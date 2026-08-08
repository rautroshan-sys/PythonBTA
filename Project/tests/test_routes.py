def test_signup_and_login(client):
    client.post("/signup", json={"email": "a@b.com", "password": "pass123"})
    res = client.post("/login", json={"email": "a@b.com", "password": "pass123"})
    assert res.status_code == 200


def test_login_wrong_password(client):
    client.post("/signup", json={"email": "a@b.com", "password": "pass123"})
    res = client.post("/login", json={"email": "a@b.com", "password": "wrong"})
    assert res.status_code == 401


def test_ask_requires_login(client):
    res = client.post("/ask", json={"question": "hi"})
    assert res.status_code == 401