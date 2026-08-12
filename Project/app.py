import os
from flask import Flask, request, jsonify, render_template, session, redirect, url_for, flash
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

METHODS = {
    "pdf": {"name": "PDF document", "accept": ".pdf,application/pdf"},
    "image": {"name": "Image / photo", "accept": "image/*"},
    "text": {"name": "Plain text", "accept": ".txt,.md,text/plain"},
}


@app.template_filter("datetime")
def format_datetime(value):
    return value.strftime("%d %b %Y, %H:%M")


@app.context_processor
def inject_globals():
    user = User.query.get(session["user_id"]) if "user_id" in session else None
    return {"user": user, "methods": METHODS}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        if User.query.filter_by(email=email).first():
            flash("That email is already registered", "error")
        else:
            user = User(name=name, email=email, password_hash=generate_password_hash(password))
            db.session.add(user)
            db.session.commit()
            session["user_id"] = user.id
            flash("Account created", "success")
            return redirect(url_for("index"))
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            session["user_id"] = user.id
            flash("Logged in", "success")
            return redirect(url_for("index"))
        flash("Wrong email or password", "error")
    return render_template("login.html")


@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    flash("Signed out", "success")
    return redirect(url_for("index"))


@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["file"]
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    path = os.path.join(UPLOAD_DIR, secure_filename(file.filename))
    file.save(path)

    try:
        text = load_file(path)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    doc = Document(user_id=session.get("user_id"), filename=file.filename)
    db.session.add(doc)
    db.session.commit()
    store_chunks(doc.id, chunk_text(text))
    return jsonify({"status": "ok", "document_id": doc.id, "text": text})


@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question, document_id = data.get("question"), data.get("document_id")
    if not question or not document_id:
        return jsonify({"error": "question and document_id are required"}), 400

    chunks = top_chunks(question, document_id)
    answer = generate_answer(question, chunks)

    if "user_id" in session:
        doc = Document.query.get(document_id)
        entry = ChatHistory(
            user_id=session["user_id"],
            document_id=document_id,
            question=question,
            answer=answer,
        )
        db.session.add(entry)
        db.session.commit()

    return jsonify({"answer": answer})


@app.route("/history")
def history():
    if "user_id" not in session:
        return redirect(url_for("login"))
    rows = (
        ChatHistory.query.filter_by(user_id=session["user_id"])
        .order_by(ChatHistory.created_at.desc())
        .all()
    )
    entries = [
        {
            "question": r.question,
            "answer": r.answer,
            "document_name": r.document.filename if r.document else "—",
            "created_at": r.created_at,
        }
        for r in rows
    ]
    return render_template("history.html", entries=entries)


@app.route("/feedback", methods=["POST"])
def feedback():
    if "user_id" not in session:
        return jsonify({"error": "not logged in"}), 401
    data = request.json
    chat = ChatHistory.query.filter_by(id=data["chat_id"], user_id=session["user_id"]).first()
    if not chat:
        return jsonify({"error": "not found"}), 404
    fb = Feedback(
        chat_history_id=chat.id,
        user_id=session["user_id"],
        rating=data["rating"],
        comment=data.get("comment"),
    )
    db.session.add(fb)
    db.session.commit()
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)