import pytest

pytestmark = pytest.mark.skip(reason="requires a real Postgres+pgvector instance, run in CI only")


def test_top_chunks_returns_most_relevant_first(mocker):
    from core.retriever import top_chunks
    from db.models import Chunk

    mocker.patch("core.retriever.embed_text", return_value=[1.0, 0.0])
    relevant = Chunk(text="Python is a programming language", embedding=[1.0, 0.0])
    irrelevant = Chunk(text="Bananas are yellow", embedding=[0.0, 1.0])
    results = top_chunks("what is python", k=2)
    assert results[0].text == relevant.text