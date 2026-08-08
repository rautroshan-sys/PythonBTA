rag_tool/
│
├── app.py                      # Flask app + ALL routes (upload, ask, login, history)
├── config.py                   # Config: DB URI, Gemini API key (from .env)
├── .env
├── .gitignore
├── requirements.txt
│
├── core/
│   ├── loader.py                # pdf, image, text extraction
│   ├── chunker.py                # splits text into chunks
│   ├── embedder.py               # creates vectors + calls Gemini
│   └── retriever.py             # similarity search
│
├── db/
│   ├── models.py                # User, Document, Chunk, ChatHistory
│   └── database.py              # connection/session setup
│
├── templates/
│   ├── base.html
│   ├── login.html
│   ├── index.html
│   └── history.html
│
├── static/
│   ├── style.css
│   └── script.js                 # one JS file is fine unless it gets huge
│
└── tests/
    ├── conftest.py
    ├── test_chunker.py
    ├── test_loader.py
    └── test_routes.py