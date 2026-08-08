import pytest
from app import app as flask_app
from db.database import db


@pytest.fixture
def app():
    flask_app.config.update(SQLALCHEMY_DATABASE_URI="sqlite:///:memory:", TESTING=True)
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def mock_embed(mocker):
    return mocker.patch("core.embedder.embed_text", return_value=[0.0] * 768)