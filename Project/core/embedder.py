import google.generativeai as genai
from config import Config
from db.database import db
from db.models import Chunk

genai.configure(api_key=Config.GEMINI_API_KEY)


def embed_text(text):
    result = genai.embed_content(model="models/text-embedding-004", content=text)
    return result["embedding"]


def store_chunks(document_id, texts):
    for text in texts:
        db.session.add(Chunk(document_id=document_id, text=text, embedding=embed_text(text)))
    db.session.commit()