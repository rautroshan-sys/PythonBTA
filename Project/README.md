# Extractly — Document Extraction & RAG Q&A Tool

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-API-8E75B2?logo=googlegemini&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

**CS50x 2026 Final Project**
Video demo: [add link here before submission]

---

## Table of Contents
- [About](#about)
- [Why This Project](#why-this-project)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Setup](#setup)
- [Challenges & What Helped](#challenges--what-helped)
- [Skills Gained](#skills-gained)

---

## About

Extractly is a web application that extracts text from PDFs, images, and plain text files, then answers natural-language questions about the extracted content using a Retrieval-Augmented Generation (RAG) pipeline. Users can upload a document, ask questions about it, and receive answers grounded in the document's actual content — with source chunks shown alongside each answer.

Optional accounts let users keep a saved history of past extractions and Q&A sessions.

## Why This Project

I built this to combine two things I wanted to learn properly: full-stack web development (Flask, SQL, frontend) and the internals of a RAG pipeline (chunking, embeddings, vector similarity search, grounded generation), rather than treating RAG as a black box. Most tutorials wire a vector database to an LLM and stop there — I wanted to understand and implement each stage myself: extraction (including OCR for scanned images), chunking strategy, embedding generation, similarity retrieval, and grounded answer generation, with user accounts and persistence layered on top as a realistic product surface.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask |
| Database | PostgreSQL with `pgvector` extension |
| ORM | Flask-SQLAlchemy |
| Embeddings & Generation | Google Gemini API (`text-embedding-004`, `gemini-1.5-flash`) |
| OCR | Gemini Vision |
| PDF Parsing | `pypdf` |
| Frontend | HTML, CSS, vanilla JavaScript |
| Auth | Flask sessions with `werkzeug` password hashing |
| Testing | `pytest` |
| Deployment | Render (app), Supabase (database) |

## Architecture

The request flow is: a document is uploaded through the browser, extracted to plain text (via direct parsing for PDFs/text or Gemini Vision OCR for images), split into overlapping word chunks, embedded, and stored in Postgres with a `pgvector` column. When a user asks a question, the query is embedded and compared against stored chunks using cosine similarity; the top-matching chunks are passed to Gemini along with the question to generate a grounded answer.

```
Browser (HTML/CSS/JS)
        │
        ▼
Flask server (routes: upload, ask, login, register, history)
        │
        ▼
core/loader.py → core/chunker.py → core/embedder.py
        │
        ▼
PostgreSQL + pgvector  ⇄  core/retriever.py  ⇄  core/generator.py → Gemini API
```

## Repository Structure

```
Project/
├── app.py                  Flask app and all routes
├── config.py                Environment-based configuration
├── Procfile                  Deployment start command
├── requirements.txt
│
├── core/
│   ├── loader.py            PDF, image, and text extraction (with OCR fallback)
│   ├── chunker.py           Overlapping word-based text chunking
│   ├── embedder.py          Embedding generation via Gemini
│   ├── retriever.py         Cosine-similarity chunk retrieval
│   └── generator.py         Prompt construction and grounded answer generation
│
├── db/
│   ├── models.py            SQLAlchemy models: User, Document, Chunk, ChatHistory, Feedback
│   └── database.py          Database initialization
│
├── templates/                Jinja2 HTML templates
├── static/                   CSS and JavaScript
└── tests/                    pytest test suite
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

## Challenges & What Helped

**Chunk isolation across documents and users.** Early versions of the retriever searched every stored chunk regardless of which document or user it belonged to, meaning a question could surface content from an unrelated upload. Fixing this meant filtering retrieval by `document_id` end to end, from the frontend request through the database query.

**Environment and dependency mismatches.** Several early errors traced back to package/driver mismatches rather than logic bugs — for example, using the `psycopg` v3 driver with a connection string still formatted for `psycopg2`, and Postgres 15+'s stricter default schema privileges blocking table creation until explicitly granted. These were the hardest bugs to diagnose because the error messages pointed deep into library internals rather than at the actual cause.

**IPv6 connectivity in cloud dev environments.** Connecting to Supabase's direct database endpoint failed inside GitHub Codespaces due to a lack of IPv6 support; switching to Supabase's connection pooler (IPv4-compatible) resolved it — a reminder that networking constraints in a cloud IDE aren't always visible until they cause a failure.

**OCR reliability.** Distinguishing a genuinely unreadable image from a valid extraction required more than checking for an empty string — a short or garbled result also indicates a failure. Adding an explicit confidence signal from the vision model itself, alongside a minimum word-count check, made this failure mode visible instead of silent.

What helped throughout was building each pipeline stage (loader, chunker, embedder, retriever, generator) as an isolated, independently testable module before wiring them into Flask — problems in the core logic surfaced immediately in a plain Python shell rather than buried in a web request/response cycle.

## Skills Gained

- Designing and implementing a full RAG pipeline from raw document to grounded answer
- Working with `pgvector` for similarity search in PostgreSQL
- Structuring a Flask application with a clear separation between routes, core logic, and data models
- Session-based authentication and access-scoped data retrieval
- Debugging across the full stack: dependency resolution, database privileges, network configuration, and application logic
- Deploying a multi-service application (Flask on Render, PostgreSQL on Supabase) with environment-based configuration

---

This was CS50.