import streamlit as st
from PIL import Image
import os

# Import custom engines
# --- CHANGED: Now importing 'load_input_as_image' instead of 'convert_pdf_to_image' ---
from src.engines.utils import load_input_as_image, preprocess_image_for_ocr
from src.engines.ocr import OCREngine
from src.engines.llm import LLMEngine

st.set_page_config(page_title="Smart Form Guide", layout="wide")

# --- INITIALIZATION ---
@st.cache_resource
def load_engines():
    return OCREngine(), LLMEngine()

try:
    ocr_engine, llm_engine = load_engines()
    st.sidebar.success("System Ready: AI Engines Loaded")
except Exception as e:
    st.error(f"Critical Error loading engines: {e}")
    st.stop()

# --- STATE MANAGEMENT ---
if 'extracted_text' not in st.session_state:
    st.session_state['extracted_text'] = None
if 'form_analysis' not in st.session_state:
    st.session_state['form_analysis'] = None
if 'current_image' not in st.session_state:
    st.session_state['current_image'] = None
# Initialize chat history if empty
if "messages" not in st.session_state:
    st.session_state.messages = []

# --- UI HEADER ---
st.title("🏦 Smart Form Guide")
st.caption("Conversational Assistant with Memory")

# 1. SIDEBAR
with st.sidebar:
    st.header("1. Upload Form")
    # --- CHANGED: Allow image formats ---
    uploaded_file = st.file_uploader("Choose a File", type=["pdf", "jpg", "jpeg", "png"])
    
    if uploaded_file is not None:
        # --- CHANGED: Dynamically save with the correct file extension ---
        file_ext = uploaded_file.name.split(".")[-1]
        save_path = os.path.join("data", "raw_pdfs", f"current_upload.{file_ext}")
        
        # Ensure directory exists just in case
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        if st.button("Process Document"):
            # Clear history on new file
            st.session_state.messages = []
            
            with st.spinner("Step 1: Vision Processing..."):
                # --- CHANGED: Use the unified loader that handles both PDFs and Images ---
                raw_img = load_input_as_image(save_path)
                
                if raw_img:
                    clean_img = preprocess_image_for_ocr(raw_img)
                    st.session_state['current_image'] = clean_img
                
                    with st.spinner("Step 2: OCR Extraction..."):
                        text_data = ocr_engine.get_raw_text(clean_img)
                        st.session_state['extracted_text'] = text_data
                    
                    with st.spinner("Step 3: Initial Analysis..."):
                        analysis = llm_engine.analyze_form(text_data)
                        st.session_state['form_analysis'] = analysis
                    
                    st.success("Processing Complete!")
                else:
                    st.error("Failed to load the document. Please ensure it is a valid PDF or Image.")

# 2. MAIN LAYOUT
col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("Document View")
    if st.session_state['current_image']:
        st.image(st.session_state['current_image'], caption="AI Enhanced View", use_container_width=True)
    else:
        st.info("Please upload a document.")

with col2:
    if st.session_state['form_analysis']:
        with st.expander("📄 Form Summary", expanded=False):
            st.markdown(st.session_state['form_analysis'])
    
    st.divider()

    # --- CHAT INTERFACE ---
    st.markdown("### 💬 Chat with your Form Assistant")
    
    # Display previous chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Suggested quick questions
    common_fields = ["Where do I sign?", "What is 'Official Use'?", "Date format?"]
    selected_pill = st.pills("Quick Questions:", common_fields)
    
    # Capture User Input (From box OR pill)
    user_input = st.chat_input("Ask something about this form...")
    
    if selected_pill:
        user_input = selected_pill
    
    if user_input:
        # 1. Add User Message to History
        st.session_state.messages.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.markdown(user_input)

        # 2. Generate AI Response
        if st.session_state['extracted_text']:
            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    # PASS THE FULL HISTORY TO THE BRAIN
                    response = llm_engine.ask_field_guidance(
                        user_input, 
                        st.session_state['extracted_text'],
                        st.session_state.messages # <--- The Magic Memory Link
                    )
                    st.markdown(response)
            
            # 3. Add AI Message to History
            st.session_state.messages.append({"role": "assistant", "content": response})
        else:
            st.error("Please upload and process a document first.")