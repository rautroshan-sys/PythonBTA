import os
from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from config import Config
from db.database import db
from db.models import User, Document, ChatHistory, Feedback
from core.loader import load_file
from core.chunker import chunk_text
from core.embedder import store_chunks
from core.retriever import top_chunks
from core.generator import generate_answer

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

UPLOAD_DIR = "static/uploads"


@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "GET":
        return render_template("signup.html")
    data = request.json
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "email already registered"}), 400
    user = User(email=data["email"], password_hash=generate_password_hash(data["password"]))
    db.session.add(user)
    db.session.commit()
    session["user_id"] = user.id
    return jsonify({"status": "ok"})


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "invalid credentials"}), 401
    session["user_id"] = user.id
    return jsonify({"status": "ok"})


@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"status": "ok"})


@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["file"]
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    path = os.path.join(UPLOAD_DIR, secure_filename(file.filename))
    file.save(path)

    text = load_file(path)
    if text.strip() == "UNREADABLE":
        return jsonify({"error": "file unreadable"}), 400

    doc = Document(user_id=session.get("user_id"), filename=file.filename)
    db.session.add(doc)
    db.session.commit()
    store_chunks(doc.id, chunk_text(text))
    return jsonify({"status": "ok", "document_id": doc.id})


@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question, document_id = data["question"], data.get("document_id")
    if not document_id:
        return jsonify({"error": "document_id is required"}), 400

    chunks = top_chunks(question, document_id)
    answer = generate_answer(question, chunks)

    if "user_id" in session:
        entry = ChatHistory(user_id=session["user_id"], document_id=document_id, question=question, answer=answer)
        db.session.add(entry)
        db.session.commit()

    return jsonify({"answer": answer})

@app.route("/history")
def history():
    if "user_id" not in session:
        return redirect(url_for("login"))
    entries = ChatHistory.query.filter_by(user_id=session["user_id"]).order_by(ChatHistory.created_at.desc()).all()
    return render_template("history.html", entries=entries)


@app.route("/feedback", methods=["POST"])
def feedback():
    if "user_id" not in session:
        return jsonify({"error": "not logged in"}), 401
    data = request.json
    fb = Feedback(chat_history_id=data["chat_id"], user_id=session["user_id"], rating=data["rating"], comment=data.get("comment"))
    db.session.add(fb)
    db.session.commit()
    return jsonify({"status": "ok"})


@app.route("/")
def index():
    return render_template("index.html", logged_in="user_id" in session)

@app.context_processor
def inject_logged_in():
    user = User.query.get(session["user_id"]) if "user_id" in session else None
    return {"logged_in": user is not None, "current_user": user}

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)