from pypdf import PdfReader
from PIL import Image
from core.generator import call_gemini_vision

OCR_PROMPT = (
    "Extract all text from this image exactly as it appears, preserving "
    "original line breaks, spacing, and reading order (top to bottom, "
    "left to right). Do not correct spelling, grammar, or formatting. "
    "Do not paraphrase, summarize, or add any text that is not visibly "
    "present in the image.\n\n"
    "If part of the image is unreadable, mark that portion as [UNREADABLE] "
    "inline and continue extracting the rest of the text normally.\n\n"
    "If the entire image is blurry, too dark, low resolution, or contains "
    "no readable text at all, respond with exactly: UNREADABLE\n\n"
    "Return only the extracted text with no commentary, explanation, or "
    "markdown formatting."
)


def load_pdf(path):
    text = "\n".join(page.extract_text() or "" for page in PdfReader(path).pages)
    if not text.strip():
        raise ValueError("No readable text found in this PDF — it may be a scanned image without text.")
    return text


def load_image(path):
    text = call_gemini_vision(Image.open(path), OCR_PROMPT)
    if text.strip() == "UNREADABLE":
        raise ValueError("Picture is not clear enough to extract text. Please upload a clearer image.")
    return text


def load_text(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def load_file(path):
    ext = path.rsplit(".", 1)[-1].lower()
    if ext == "pdf":
        return load_pdf(path)
    if ext in ("png", "jpg", "jpeg", "webp"):
        return load_image(path)
    if ext == "txt":
        return load_text(path)
    raise ValueError(f"unsupported file type: {ext}")