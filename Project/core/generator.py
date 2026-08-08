import time
from google import genai
from config import Config

client = genai.Client(api_key=Config.GEMINI_API_KEY)
MODEL = "gemini-3.6-flash"

ANSWER_PROMPT = (
    "Answer the question using only the context below. "
    "If the context doesn't contain the answer, say you don't know.\n\n"
    "Context:\n{context}\n\nQuestion: {question}"
)


def generate_content_with_retry(model, contents, retries=3):
    for attempt in range(retries):
        try:
            return client.models.generate_content(model=model, contents=contents)
        except Exception as e:
            if "UNAVAILABLE" in str(e) and attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise


def call_gemini_vision(image, prompt):
    response = generate_content_with_retry(MODEL, [prompt, image])
    return response.text.strip()


def generate_answer(question, chunks):
    context = "\n\n".join(c.text for c in chunks)
    prompt = ANSWER_PROMPT.format(context=context, question=question)
    response = generate_content_with_retry(MODEL, prompt)
    return response.text.strip()