import json
import os
import glob

class RuleEngine:
    def __init__(self, rules_dir="data/rules"):
        self.rules_db = {}
        self.rules_dir = rules_dir
        self.load_rules()

    def load_rules(self):
        """
        Scans 'data/rules' and loads your JSON files.
        """
        if not os.path.exists(self.rules_dir):
            os.makedirs(self.rules_dir)
            
        json_files = glob.glob(os.path.join(self.rules_dir, "*.json"))
        print(f"[RuleEngine] Found {len(json_files)} compliance protocols.")
        
        for file_path in json_files:
            try:
                with open(file_path, 'r') as f:
                    rule_set = json.load(f)
                    # Use form_id or filename as key
                    key = rule_set.get("form_id", os.path.basename(file_path))
                    self.rules_db[key] = rule_set
            except Exception as e:
                print(f"Error loading {file_path}: {e}")

    def identify_form(self, ocr_text):
        """
        Matches text to a JSON rule set.
        """
        text_upper = ocr_text.upper()
        best_match = None
        max_score = 0
        
        for form_id, schema in self.rules_db.items():
            score = 0
            # Check Authority
            auth = schema.get("authority", "").upper()
            if auth and auth in text_upper:
                score += 3
            
            # Check Section Titles
            sections = schema.get("sections", {})
            for sec_data in sections.values():
                if sec_data.get("title", "").upper() in text_upper:
                    score += 1
            
            if score > max_score and score > 4:
                max_score = score
                best_match = form_id
        
        if best_match:
            return best_match, self.rules_db[best_match]
        return "GENERIC_FORM", None

    def get_prompt_injection(self, form_id):
        """
        Converts JSON rules into text for the LLM.
        """
        if form_id == "GENERIC_FORM" or form_id not in self.rules_db:
            return "No specific rules found. Use general banking standards."
            
        schema = self.rules_db[form_id]
        rules_text = f"*** COMPLIANCE PROTOCOL: {schema.get('authority')} ***\n"
        
        sections = schema.get("sections", {})
        if "GLOBAL" in sections:
            rules_text += f"GENERAL RULE: {sections['GLOBAL']['instruction']}\n"
            
        for key, data in sections.items():
            if key == "GLOBAL": continue
            rules_text += f"- {data['title']}: {data['instruction']}\n"
            
        rules_text += "**************************************************"
        return rules_text