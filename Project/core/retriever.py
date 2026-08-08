from core.embedder import embed_text
from db.models import Chunk


def top_chunks(query, document_id, k=5):
    query_vec = embed_text(query)
    return (
        Chunk.query.filter_by(document_id=document_id)
        .order_by(Chunk.embedding.cosine_distance(query_vec))
        .limit(k)
        .all()
    )