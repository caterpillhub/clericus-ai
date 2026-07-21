# ⚖️ Clericus AI

A compliance-aware AI assistant that guides users step-by-step through filling out banking forms — reading the document via OCR, identifying the form type, and explaining each mandatory field in plain language.

Upload a scanned banking form (PDF/image) and chat with an AI that walks you through it field-by-field, grounded strictly in the bank's compliance rules.

> 🎓 **Student / MVP+ Project** — built as an academic project to explore local, privacy-preserving AI for regulated document workflows. Not a production banking product.

## 🚀 Overview

Built with:
- **Backend:** FastAPI + PaddleOCR + PyMuPDF + Pillow
- **LLM:** Ollama running LLaMA 3 (fully local — no cloud API calls)
- **Frontend:** Next.js (App Router) + React + Tailwind/shadcn UI
- **Rules Engine:** JSON-based compliance schema library (22 IDFC FIRST Bank forms)

The project focuses on:
- Document ingestion via OCR (PDF or image)
- Automatic form-type identification against a compliance schema library
- Session-isolated, guided field-by-field form filling via LLM
- A modern chat interface for interacting with the assistant

## 🧠 How It Works

1. User uploads a banking form (PDF/JPG/PNG).
2. Backend renders/preprocesses the document and runs OCR (PaddleOCR) to extract text.
3. The rule engine scores the extracted text against JSON compliance schemas to identify the form type.
4. A session is created; the LLM (LLaMA 3 via Ollama) guides the user through each mandatory field — explaining rules, formats, and rejection reasons — one at a time.
5. User can ask questions about the current field, request repeats, or move to the next field.

## ✨ Features

- ✅ OCR-based document ingestion (PDF & image support)
- ✅ Automatic form-type identification (22 pre-built compliance schemas)
- ✅ Guided, sequential field-by-field form filling
- ✅ In-context Q&A per field (won't advance until you're ready)
- ✅ Fully local LLM inference — no data leaves the machine
- ✅ Schema-agnostic — add new forms by dropping in a JSON file
- ✅ Chat-style Next.js interface with history & settings panel

## 🏗 Project Structure

```
clericus-ai/
├── backend/
│   ├── app.py                 ← FastAPI application
│   ├── requirements.txt
│   ├── data/rules/             ← JSON compliance schemas (22 forms)
│   └── src/engines/
│       ├── utils.py            ← PDF/image preprocessing
│       ├── ocr.py               ← PaddleOCR extraction
│       ├── llm.py               ← LLM controller & session state
│       └── rule_engine.py       ← Schema scoring & identification
└── frontend/
    ├── app/                    ← Next.js App Router pages & API routes
    ├── components/             ← Chat UI, panels, shadcn/ui components
    └── hooks/, lib/
```

## 🧪 Running Locally

### Prerequisites
- Python 3.10+, Node.js 18+, Ollama installed
- Pull the model once: `ollama pull llama3`

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
ollama serve                # separate terminal
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
Backend runs on `http://localhost:8000` (docs at `/docs`).

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

> Full setup, troubleshooting, and API reference: see `EXECUTION_INSTRUCTIONS.md`.

## 📊 Technical Decisions

**Why local LLM (Ollama + LLaMA 3) over a cloud API?**
Banking forms carry sensitive PII (PAN, Aadhaar, account numbers). Local inference keeps all data on-device — no cost per query, no external transmission.

**Why PaddleOCR over Tesseract?**
Better accuracy on low-contrast, smartphone-photographed forms, fully local, and its NumPy-native pipeline integrates cleanly with the Pillow-based preprocessing step.

**Why JSON schemas instead of a database?**
Editable by non-developers, Git-auditable, and schema-agnostic — new forms are supported with zero code changes, just a new JSON file.

## ⚠️ Known Limitations (Student/MVP+ Scope)

- Sessions are stored in memory — lost on server restart
- CPU-only inference is slow (~4–6s/response); GPU recommended for smoother use
- No authentication or multi-user persistence layer
- Limited to the 22 pre-loaded IDFC FIRST Bank form types
- No automated test suite included yet

These are accepted tradeoffs for an academic MVP+ build, not a production deployment.

## 🔮 Future Improvements

- Persistent session storage (Redis/DB-backed)
- Support for handwritten field detection
- Multi-bank / multi-institution schema support
- Auth & role-based access for real deployments
- Automated evaluation pipeline in CI

## 📌 Why This Project Exists

Filling regulated banking forms is confusing and error-prone for everyday users. Clericus AI explores whether a fully local, privacy-preserving AI assistant can turn a static compliance form into a guided conversation — built as a hands-on study in combining OCR, rule engines, and LLMs for a regulated domain.

## 🧾 License

MIT License
