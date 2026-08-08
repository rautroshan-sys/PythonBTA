import google.generativeai as genai
from config import Config

genai.configure(api_key=Config.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

ANSWER_PROMPT = (
    "Answer the question using only the context below. "
    "If the context doesn't contain the answer, say you don't know.\n\n"
    "Context:\n{context}\n\nQuestion: {question}"
)


def call_gemini_vision(image, prompt):
    return model.generate_content([prompt, image]).text.strip()


def generate_answer(question, chunks):
    context = "\n\n".join(c.text for c in chunks)
    prompt = ANSWER_PROMPT.format(context=context, question=question)
    return model.generate_content(prompt).text.strip()