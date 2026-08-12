import time
from google import genai
from config import Config

client = genai.Client(api_key=Config.GEMINI_API_KEY)
MODEL = "gemini-3.6-flash"

ANSWER_PROMPT = (
    
    "Answer the question using the information and logic present in the context below. "
    "You may reason through or calculate based on what's in the context — for example, "
    "tracing through code logic, doing arithmetic, or drawing conclusions that follow "
    "directly from what's described. Only say you don't know if the answer genuinely "
    "cannot be derived from the context even with reasoning.\n\n"
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