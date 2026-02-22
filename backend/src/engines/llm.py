import ollama
from src.engines.rule_engine import RuleEngine

class LLMEngine:
    def __init__(self, model_name="llama3"):
        self.model = model_name
        self.rule_engine = RuleEngine()

        self.active_rules = None
        self.active_form_id = None
        self.form_schema = None

        # Flow tracking
        self.field_order = []
        self.current_field_index = 0
        self.flow_started = False

    # ---------------------------------------------------
    # STEP 1: Analyze Form (called once after OCR)
    # ---------------------------------------------------
    def analyze_form(self, ocr_text):
        self.active_form_id, form_data = self.rule_engine.identify_form(ocr_text)
        self.active_rules = self.rule_engine.get_prompt_injection(self.active_form_id)
        self.form_schema = form_data

        # Build ordered list of mandatory fields
        self.field_order = []
        sections = form_data.get("sections", {})

        for key, data in sections.items():
            if key == "GLOBAL":
                continue
            if data.get("mandatory", False):
                self.field_order.append(key)

        self.current_field_index = 0
        self.flow_started = False

        # Basic analysis summary
        prompt = f"""
        Analyze this form text:
        {ocr_text[:2000]}

        Task:
        1. Identify the Bank Name.
        2. Identify the Form Title.
        3. Summarize the purpose in 1 sentence.
        """

        response = ollama.chat(model=self.model, messages=[
            {'role': 'user', 'content': prompt}
        ])
        return response['message']['content']

    # ---------------------------------------------------
    # START GUIDED FLOW
    # ---------------------------------------------------
    def start_guided_filling(self):
        self.flow_started = True
        self.current_field_index = 0
        return self._explain_current_field()

    # ---------------------------------------------------
    # MOVE TO NEXT FIELD
    # ---------------------------------------------------
    def mark_field_complete(self):
        if not self.flow_started:
            return "Say 'help me fill this form' to begin step-by-step guidance."

        self.current_field_index += 1

        if self.current_field_index >= len(self.field_order):
            return "✅ All mandatory fields are covered! Please review the form once before submitting."

        return self._explain_current_field()

    # ---------------------------------------------------
    # EXPLAIN CURRENT FIELD
    # ---------------------------------------------------
    def _explain_current_field(self):
        field_key = self.field_order[self.current_field_index]
        field_data = self.form_schema["sections"][field_key]

        title = field_data["title"]
        instruction = field_data["instruction"]

        prompt = f"""
        You are a friendly banking form assistant helping a user fill a bank form step by step.

        Current Field: {title}
        Official Instruction: {instruction}

        Your job:
        - Explain what this field means in very simple language.
        - Tell the user what to write.
        - Give one small example.
        - Be short and friendly.
        """

        response = ollama.chat(model=self.model, messages=[
            {'role': 'user', 'content': prompt}
        ])
        return response['message']['content']

    # ---------------------------------------------------
    # ANSWER DOUBTS ABOUT CURRENT FIELD
    # ---------------------------------------------------
    def ask_field_question(self, user_question):
        if not self.flow_started:
            return "Say 'help me fill this form' and I will guide you step by step."

        field_key = self.field_order[self.current_field_index]
        field_data = self.form_schema["sections"][field_key]

        title = field_data["title"]
        instruction = field_data["instruction"]

        prompt = f"""
        You are a helpful banking assistant guiding a user.

        Current field: {title}
        Rule: {instruction}

        User question: {user_question}

        Answer clearly and briefly.
        """

        response = ollama.chat(model=self.model, messages=[
            {'role': 'user', 'content': prompt}
        ])
        return response['message']['content']

    # ---------------------------------------------------
    # COMPATIBILITY ROUTER (USED BY STREAMLIT)
    # ---------------------------------------------------
    def ask_field_guidance(self, user_question, context_text="", chat_history=None):
        """
        This keeps compatibility with your existing Streamlit app.
        It decides whether to start flow, move next, or answer a question.
        """

        if chat_history is None:
            chat_history = []

        q = user_question.lower().strip()

        # Start guided flow
        if any(x in q for x in ["help", "start", "fill form"]):
            return self.start_guided_filling()

        # User completed current field
        if any(word in q for word in ["done", "next", "filled", "completed", "ok done"]):
            return self.mark_field_complete()

        # Otherwise answer a doubt about current field
        return self.ask_field_question(user_question)
