# Extractly — Document Extraction & RAG Q&A Tool

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-API-8E75B2?logo=googlegemini&logoColor=white)
![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

**CS50x 2026 Final Project**
Live: https://pythonbta.onrender.com
Video demo: [add link here before submission]

---

## Table of Contents
- [About](#about)
- [Why This Project](#why-this-project)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Setup](#setup)
- [Deployment](#deployment)
- [Challenges & What Helped](#challenges--what-helped)
- [Skills Gained](#skills-gained)

---

## About

Extractly extracts text from PDFs, images, and plain text files, then answers natural-language questions about the extracted content using a Retrieval-Augmented Generation (RAG) pipeline. Extraction and Q&A work for anyone with no account required. Creating an account is optional and only unlocks a saved history of past extractions and questions — the core tool is not gated behind a login.

## Why This Project

I built this to combine two things I wanted to learn properly: full-stack web development (Flask, SQL, frontend) and the internals of a RAG pipeline (chunking, embeddings, vector similarity search, grounded generation), rather than treating RAG as a black box. I wanted to implement each stage myself: extraction (including OCR for scanned images), chunking strategy, embedding generation, per-document similarity retrieval, and grounded answer generation, with optional accounts and persistence layered on top as a realistic product surface rather than a required gate.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, gunicorn |
| Database | PostgreSQL with `pgvector` (hosted on Supabase) |
| ORM | Flask-SQLAlchemy |
| Embeddings & Generation | Google Gemini API (`text-embedding-004`, `gemini-1.5-flash`) |
| OCR | Gemini Vision |
| PDF Parsing | `pypdf` |
| Frontend | HTML (Jinja2), CSS, vanilla JavaScript |
| Auth | Flask sessions with `werkzeug` password hashing (optional) |
| Testing | `pytest` |
| Deployment | Render (app) + Supabase (database) |

## Architecture

A document is uploaded, extracted to plain text (direct parsing for PDFs/text, Gemini Vision OCR for images), split into overlapping word chunks, embedded, and stored in Postgres with a `pgvector` column, scoped to that specific document. When a question is asked, it's embedded and compared against chunks belonging **only to that document** using cosine similarity; the top matches are passed to Gemini along with the question to generate a grounded answer. If the person is logged in, the question and answer are saved to their history; if not, extraction and Q&A still work in full, nothing is persisted beyond the session.

```
Browser (HTML/CSS/JS)
        │
        ▼
Flask server (routes: upload, ask, login, signup, history, feedback)
        │
        ▼
core/loader.py → core/chunker.py → core/embedder.py
        │
        ▼
PostgreSQL + pgvector (Supabase)  ⇄  core/retriever.py (scoped by document_id)  ⇄  core/generator.py → Gemini API
```

## Repository Structure

```
Project/
├── app.py                  Flask app and all routes
├── config.py                Environment-based configuration
├── Procfile                  Render start command
├── requirements.txt
│
├── core/
│   ├── loader.py            PDF, image, and text extraction (with OCR fallback)
│   ├── chunker.py           Overlapping word-based text chunking
│   ├── embedder.py          Embedding generation and chunk storage
│   ├── retriever.py         Cosine-similarity retrieval, scoped to one document
│   └── generator.py         Prompt construction, grounded answer generation, OCR calls
│
├── db/
│   ├── models.py            User, Document, Chunk, ChatHistory, Feedback
│   └── database.py          Flask-SQLAlchemy initialization
│
├── templates/
│   ├── base.html            Shared layout, nav, optional login/register state
│   ├── index.html            Upload + extraction UI
│   ├── login.html
│   ├── signup.html
│   └── history.html          Past Q&A, visible only when logged in
│
├── static/
│   ├── style.css
│   └── script.js             Upload, extraction, auth, and ask flows
│
└── tests/                    pytest suite
```

## Setup

```bash
git clone <repo-url>
cd Project
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL, GEMINI_API_KEY, SECRET_KEY
python
>>> from app import app
>>> from db.database import db
>>> with app.app_context():
...     db.create_all()
>>> exit()
python app.py
```

## Deployment

The app is deployed on **Render** as a web service (`gunicorn app:app`), with **Supabase** providing a managed PostgreSQL instance with `pgvector` enabled. Environment variables (`DATABASE_URL`, `GEMINI_API_KEY`, `SECRET_KEY`) are set directly in Render's dashboard rather than committed. The database connection uses Supabase's session pooler rather than its direct connection endpoint, since the direct endpoint resolves to an IPv6-only address that some environments — including the GitHub Codespace this was developed in — cannot route to.

## Challenges & What Helped

**Chunk isolation across documents.** The retriever originally searched every stored chunk with no `document_id` filter, meaning a question could pull in content from an unrelated upload. Fixed by scoping retrieval to the current document end to end — frontend request, `/ask` route, and the SQL query itself.

**Making the core tool login-optional.** The initial design gated upload and Q&A behind authentication. The actual intent was the reverse: extraction should work for anyone, and an account should only add persistence. This meant relaxing a `NOT NULL` constraint on an already-created production column (`ALTER TABLE ... DROP NOT NULL`) rather than just changing the model, since the schema already existed on the live database.

**Content-Type mismatches between forms and the API.** The login and signup pages initially submitted as standard HTML forms (`application/x-www-form-urlencoded`), while the Flask routes expected JSON, producing a 415 error. Fixed by intercepting form submission in JavaScript and sending `fetch()` requests with an explicit JSON content type — the same pattern already used for uploads.

**Environment variables on the deploy platform are separate from local `.env`.** A deploy failed with `Either 'SQLALCHEMY_DATABASE_URI' or 'SQLALCHEMY_BINDS' must be set` — the environment variables had never actually been added in Render's dashboard, since `.env` is gitignored and never reaches the deployed environment by design.

**IPv6 connectivity in cloud dev environments.** Connecting to Supabase's direct database endpoint failed inside GitHub Codespaces due to a lack of IPv6 support; switching to Supabase's connection pooler resolved it, and the same pooler string is used in production.

**Driver and privilege mismatches.** Using the `psycopg` v3 driver required an explicit `postgresql+psycopg://` scheme rather than the default `psycopg2` assumption, and Postgres 15+'s stricter default schema privileges blocked table creation until explicitly granted with `GRANT ALL ON SCHEMA public`.

**OCR reliability.** Distinguishing a genuinely unreadable image from a valid extraction required more than checking for an empty string — a short or garbled result also indicates failure. Adding an explicit confidence signal from the vision model, alongside a minimum word-count check, made this failure mode visible instead of silent.

What helped throughout was building each pipeline stage (loader, chunker, embedder, retriever, generator) as an isolated, independently testable module before wiring it into Flask, and debugging with `curl` directly against the running server to separate actual application errors from unrelated networking or port-forwarding issues.

## Skills Gained

- Designing and implementing a full RAG pipeline from raw document to grounded, document-scoped answer
- Working with `pgvector` for similarity search in PostgreSQL
- Structuring a Flask application with a clear separation between routes, core logic, and data models
- Optional, session-based authentication that layers persistence on top of a fully functional anonymous flow
- Debugging across the full stack: dependency resolution, database privileges and schema migration, network configuration, and request content-type mismatches
- Deploying a multi-service application (Flask on Render, PostgreSQL on Supabase) with environment-based configuration, separate from local development settings

---

## About Me

**Roshan Raut** — second-year BE-CSE (AI & ML) student at A. P. Shah Institute of Technology, Mumbai University. This project was built as my CS50x final submission while working toward an AI/LLM engineering path.

GitHub: [rautroshan-sys](https://github.com/rautroshan-sys)
LinkedIn: [roshan-raut-b335993b7](https://linkedin.com/in/roshan-raut-b335993b7)

---

This was CS50.