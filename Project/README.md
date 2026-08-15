# Extractly — Document Extraction & RAG Q&A Tool

![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python&logoColor=white)
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
- [About Me](#about-me)

---

## About

Extractly extracts text from PDFs, images, and plain text files, then answers natural-language questions about the extracted content using a Retrieval-Augmented Generation (RAG) pipeline. Extraction and Q&A work for anyone with no account required, through a docked chat sidebar in the style of an IDE assistant panel. Creating an account is entirely optional and only unlocks a saved history of past extractions and questions.

## Why This Project

I built this to combine two things I wanted to learn properly: full-stack web development (Flask, SQL, frontend) and the internals of a RAG pipeline (chunking, embeddings, vector similarity search, grounded generation), rather than treating RAG as a black box. I implemented each stage myself: extraction with a real OCR fallback for scanned or oddly-encoded documents, chunking strategy, embedding generation, per-document similarity retrieval, and grounded answer generation — with optional accounts and persistence layered on top as a realistic product surface rather than a gate in front of the core tool.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, gunicorn |
| Database | PostgreSQL with `pgvector` (hosted on Supabase, accessed via the session pooler) |
| ORM | Flask-SQLAlchemy |
| Embeddings & Generation | Google Gemini API via `google-genai` (`gemini-embedding-001`, `gemini-3.6-flash`) |
| OCR | Gemini Vision — used for images directly, and as a fallback for PDFs with no extractable text layer |
| PDF Parsing | `pypdf` (primary), `pymupdf` (renders pages to images for the OCR fallback path) |
| Frontend | HTML (Jinja2), CSS, vanilla JavaScript — no framework, no build step |
| Auth | Flask sessions, `werkzeug` password hashing, plain HTML form submission with server-side flash messages (optional) |
| Testing | `pytest` |
| Deployment | Render (app) + Supabase (database) |

## Architecture

A document is uploaded, extracted to plain text, split into overlapping chunks, embedded, and stored in Postgres with a `pgvector` column scoped to that specific document. Extraction tries direct parsing first (`pypdf` for PDFs, direct read for text files); if a PDF has no extractable text layer — common with certain export tools despite being visually readable — each page is rendered to an image and passed through the same Gemini Vision OCR path used for uploaded images.

When a question is asked, it's embedded and compared against chunks belonging **only to that document** using cosine similarity; the top matches are passed to Gemini along with the question to generate a grounded, reasoning-capable answer. The chat lives in a docked sidebar panel that pushes page content aside rather than overlaying it, matching the layout pattern of tools like GitHub Codespaces' agent panel. If the person is logged in, the question and answer are saved to their history; if not, extraction and Q&A still work in full, nothing is persisted beyond the session.

Authentication uses plain HTML form submissions with server-rendered flash messages rather than a JS/JSON layer — this was a deliberate simplification partway through the build, after content-type mismatches between a JSON-based frontend and form-encoded submissions caused repeated bugs.

```
Browser (HTML/CSS/JS, docked chat panel)
        │
        ▼
Flask server (routes: /, /upload, /ask, /login, /register, /logout, /history, /feedback)
        │
        ▼
core/loader.py → core/chunker.py → core/embedder.py
        │           (OCR fallback via core/generator.py's Vision call)
        ▼
PostgreSQL + pgvector (Supabase)  ⇄  core/retriever.py (scoped by document_id)  ⇄  core/generator.py → Gemini API
```

## Repository Structure

```
Project/
├── app.py                  Flask app and all routes
├── config.py                 Environment-based configuration
├── Procfile                   Render start command (gunicorn, extended timeout)
├── requirements.txt
│
├── core/
│   ├── loader.py            PDF, image, and text extraction, with OCR fallback for scanned PDFs
│   ├── chunker.py             Overlapping character-based text chunking
│   ├── embedder.py            Embedding generation via Gemini, truncated to 768 dimensions
│   ├── retriever.py            Cosine-similarity retrieval, scoped to one document
│   └── generator.py            Prompt construction, grounded + reasoning-capable answers,
│                                 OCR calls, retry handling for transient API errors
│
├── db/
│   ├── models.py             User, Document, Chunk, ChatHistory, Feedback
│   └── database.py            Flask-SQLAlchemy initialization
│
├── templates/
│   ├── base.html              Shared layout, nav, flash messages, docked chat panel
│   ├── index.html              Upload + extraction UI
│   ├── login.html
│   ├── register.html
│   └── history.html            Past Q&A, visible only when logged in
│
├── static/
│   ├── css/styles.css
│   └── js/main.js              Upload, extraction, chat, and scroll behavior
│
└── tests/                      pytest suite
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

The app is deployed on **Render** as a web service (`gunicorn app:app`, with an extended timeout to accommodate multi-page OCR requests), with **Supabase** providing a managed PostgreSQL instance with `pgvector` enabled. Environment variables (`DATABASE_URL`, `GEMINI_API_KEY`, `SECRET_KEY`) are set directly in Render's dashboard rather than committed. The database connection uses Supabase's session pooler rather than its direct connection endpoint, since the direct endpoint resolves to an IPv6-only address unreachable from the development environment this was built in.

## Challenges & What Helped

**Chunk isolation across documents.** The retriever originally searched every stored chunk with no `document_id` filter. Fixed by scoping retrieval end to end — frontend request, `/ask` route, and the SQL query itself.

**Making the core tool login-optional.** The original design gated upload and Q&A behind authentication; the actual intent was the reverse. This meant relaxing a `NOT NULL` constraint on an already-created production column rather than just changing the model, since the schema already existed on the live database.

**Auth architecture simplification.** An early JS/JSON-based login and register flow repeatedly hit content-type mismatches against Flask's request parsing. Rebuilding auth as plain HTML form submissions with server-side flash messages removed an entire class of bugs rather than patching around them.

**Two Gemini model retirements during development.** `text-embedding-004` and `gemini-1.5-flash` were both retired mid-build, surfacing as 404s with no warning beforehand. This also meant migrating off the fully deprecated `google-generativeai` package to `google-genai`, and explicitly requesting a truncated 768-dimension output from the new embedding model to match the already-created database schema, rather than accepting its new 3072-dimension default.

**Silent failures on scanned or oddly-encoded PDFs.** Some PDFs are visually readable but return empty text from `pypdf` due to font encoding it can't parse. Rather than surfacing this as an error, the loader now falls back to rendering each page as an image and running it through the same Gemini Vision OCR path used for photos.

**A CSS flexbox scroll bug in the chat panel.** The message log was intended to scroll independently within a fixed-height panel, but the whole page scrolled instead. The cause was flexbox's default `min-height: auto` on a flex child, which prevents it from shrinking below its content size even with `flex: 1` set — overriding it with `min-height: 0` was the actual fix, not the `overflow-y: auto` that seemed like the obvious culprit.

**Environment variables on the deploy platform are separate from local `.env`.** A deploy failed with a missing-database-URI error because environment variables had never actually been added in Render's dashboard — `.env` is gitignored and never reaches the deployed environment by design.

**Driver, privilege, and connectivity mismatches.** Using the `psycopg` v3 driver required an explicit `postgresql+psycopg://` scheme, Postgres 15+'s stricter default schema privileges blocked table creation until explicitly granted, and Supabase's direct connection endpoint's IPv6-only address required switching to its connection pooler.

What helped throughout was building each pipeline stage (loader, chunker, embedder, retriever, generator) as an isolated, independently testable module before wiring it into Flask, and debugging with `curl` directly against the running server to separate real application errors from unrelated networking issues.

## Skills Gained

- Designing and implementing a full RAG pipeline from raw document to grounded, document-scoped answer, including a real OCR fallback path for documents that resist standard text extraction
- Working with `pgvector` for similarity search in PostgreSQL, including schema migration on a live database
- Structuring a Flask application with a clear separation between routes, core logic, and data models
- Choosing and simplifying an authentication architecture based on real bugs encountered, not just following a tutorial pattern
- Debugging across the full stack: dependency resolution, database privileges and schema migration, network configuration, request content-type mismatches, and CSS layout internals
- Adapting to breaking upstream API changes mid-project (two model retirements) without losing working functionality
- Deploying a multi-service application (Flask on Render, PostgreSQL on Supabase) with environment-based configuration, separate from local development settings

---

## About Me

**Roshan Raut** — second-year BE-CSE (AI & ML) student at A. P. Shah Institute of Technology, Mumbai University. This project was built as my CS50x final submission while working toward an AI/LLM engineering path.

GitHub: [rautroshan-sys](https://github.com/rautroshan-sys)
LinkedIn: [roshan-raut-b335993b7](https://linkedin.com/in/roshan-raut-b335993b7)

---

This was CS50.