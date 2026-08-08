from core.chunker import chunk_text


def test_empty_text():
    assert chunk_text("") == []


def test_short_text_single_chunk():
    assert chunk_text("hello world", size=800) == ["hello world"]


def test_splits_long_text():
    text = "a" * 2000
    chunks = chunk_text(text, size=800, overlap=100)
    assert len(chunks) > 1
    assert all(len(c) <= 800 for c in chunks)


def test_overlap_preserved():
    text = "a" * 1000
    chunks = chunk_text(text, size=800, overlap=100)
    assert chunks[0][-100:] == chunks[1][:100]