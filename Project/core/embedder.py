from google import genai
from config import Config
from db.database import db
from db.models import Chunk

client = genai.Client(api_key=Config.GEMINI_API_KEY)
EMBED_MODEL = "models/text-embedding-004"


def embed_text(text):
    result = client.models.embed_content(model=EMBED_MODEL, contents=text)
    return result.embeddings[0].values


def store_chunks(document_id, texts):
    for text in texts:
        db.session.add(Chunk(document_id=document_id, text=text, embedding=embed_text(text)))
    db.session.commit()