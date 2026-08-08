from core.loader import load_text, load_file
import pytest


def test_load_text(tmp_path):
    path = tmp_path / "sample.txt"
    path.write_text("hello world")
    assert load_text(str(path)) == "hello world"


def test_unsupported_extension(tmp_path):
    path = tmp_path / "sample.xyz"
    path.write_text("data")
    with pytest.raises(ValueError):
        load_file(str(path))