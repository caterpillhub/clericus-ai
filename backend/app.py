# backend/app.py

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import shutil
import uuid

from src.engines.utils import load_input_as_image, preprocess_image_for_ocr
from src.engines.ocr import OCREngine
from src.engines.llm import LLMEngine

app = FastAPI(title="FormAssist API")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Global OCR Engine ----------
ocr_engine = OCREngine()

# 🔥 Session-based LLM engines
sessions = {}


# ---------- Schemas ----------

class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    session_id: str
    messages: List[Message]
    extracted_text: str


# ---------- Health ----------
@app.get("/health")
def health():
    return {"status": "healthy"}


# ---------- Document Processing ----------
@app.post("/process")
async def process_document(file: UploadFile = File(...)):

    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        raw_img = load_input_as_image(temp_path)

        if raw_img is None:
            return {"error": "Invalid document"}

        clean_img = preprocess_image_for_ocr(raw_img)

        text_data = ocr_engine.get_raw_text(clean_img)

        # 🔥 Create session
        session_id = str(uuid.uuid4())

        # 🔥 New LLM engine per session
        llm_engine = LLMEngine()
        analysis = llm_engine.analyze_form(text_data)

        sessions[session_id] = llm_engine

        return {
            "session_id": session_id,
            "extracted_text": text_data,
            "analysis": analysis
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ---------- Chat ----------
@app.post("/chat")
def chat(request: ChatRequest):

    if request.session_id not in sessions:
        return {"response": "Session expired. Please upload the document again."}

    llm_engine = sessions[request.session_id]

    if not request.messages:
        return {"response": "No message provided."}

    user_input = request.messages[-1].content

    response = llm_engine.ask_field_guidance(
        user_input,
        request.extracted_text,
        [msg.dict() for msg in request.messages]
    )

    return {"response": response}