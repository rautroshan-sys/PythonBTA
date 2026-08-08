from google import genai
from config import Config

client = genai.Client(api_key=Config.GEMINI_API_KEY)
MODEL = "gemini-3.6-flash"

ANSWER_PROMPT = (
    "Answer the question using only the context below. "
    "If the context doesn't contain the answer, say you don't know.\n\n"
    "Context:\n{context}\n\nQuestion: {question}"
)


def call_gemini_vision(image, prompt):
    response = client.models.generate_content(model=MODEL, contents=[prompt, image])
    return response.text.strip()


def generate_answer(question, chunks):
    context = "\n\n".join(c.text for c in chunks)
    prompt = ANSWER_PROMPT.format(context=context, question=question)
    response = client.models.generate_content(model=MODEL, contents=prompt)
    return response.text.strip()