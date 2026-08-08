from core.embedder import embed_text
from db.models import Chunk


def top_chunks(query, k=5):
    query_vec = embed_text(query)
    return Chunk.query.order_by(Chunk.embedding.cosine_distance(query_vec)).limit(k).all()