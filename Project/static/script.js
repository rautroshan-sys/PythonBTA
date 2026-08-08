const methodCards = document.querySelectorAll('.method-card');
const uploadTitle = document.getElementById('upload-title');
const extractBtn = document.getElementById('extract-btn');
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const extractForm = document.getElementById('extract-form');
const resultSection = document.getElementById('result-section');
const resultBox = document.getElementById('result-box');
const askSection = document.getElementById('ask-section');

let selectedMethod = null;
let selectedFile = null;
let currentDocId = null;

const methodLabels = { pdf: 'Drop a PDF here', image: 'Drop a PNG or JPG here', text: 'Drop a .txt or .md file here' };
const methodAccept = { pdf: '.pdf', image: '.png,.jpg,.jpeg', text: '.txt,.md' };

methodCards.forEach(card => {
  card.addEventListener('click', () => {
    methodCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    selectedMethod = card.dataset.method;
    uploadTitle.textContent = methodLabels[selectedMethod];
    fileInput.setAttribute('accept', methodAccept[selectedMethod]);
    updateExtractButton();
  });
});

uploadZone.addEventListener('click', () => {
  if (selectedMethod) fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    selectedFile = fileInput.files[0];
    uploadTitle.textContent = selectedFile.name;
  }
  updateExtractButton();
});

['dragover', 'dragleave', 'drop'].forEach(evt => uploadZone.addEventListener(evt, e => e.preventDefault()));
uploadZone.addEventListener('dragover', () => uploadZone.classList.add('drag-over'));
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));

uploadZone.addEventListener('drop', e => {
  uploadZone.classList.remove('drag-over');
  if (!selectedMethod) return;
  const file = e.dataTransfer.files[0];
  if (file) {
    selectedFile = file;
    fileInput.files = e.dataTransfer.files;
    uploadTitle.textContent = file.name;
  }
  updateExtractButton();
});

function updateExtractButton() {
  extractBtn.disabled = !(selectedMethod && selectedFile);
}

extractForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!selectedFile) return;

  const formData = new FormData();
  formData.append('file', selectedFile);

  extractBtn.disabled = true;
  extractBtn.textContent = 'Extracting...';

  try {
    const res = await fetch('/upload', { method: 'POST', body: formData, credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');

    currentDocId = data.document_id;
    resultSection.hidden = false;
    resultBox.textContent = 'Uploaded — ask a question below.';
    askSection.hidden = false;
    askSection.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    alert(err.message || 'Something went wrong — try again.');
  } finally {
    extractBtn.disabled = false;
    extractBtn.textContent = 'Extract text';
  }
});

function appendMessage(role, text) {
  const bubble = document.createElement('div');
  bubble.style.cssText = role === 'user'
    ? 'align-self:flex-end;background:var(--accent-soft);color:var(--ink);padding:10px 14px;border-radius:10px;max-width:80%'
    : 'align-self:flex-start;background:var(--surface);border:1px solid var(--line);padding:10px 14px;border-radius:10px;max-width:80%';
  bubble.textContent = text;
  document.getElementById('chat-log').appendChild(bubble);
  bubble.scrollIntoView({ behavior: 'smooth' });
  return bubble;
}

document.getElementById('ask-btn').addEventListener('click', async () => {
  const input = document.getElementById('question-input');
  const question = input.value.trim();
  if (!question || !currentDocId) return;

  appendMessage('user', question);
  input.value = '';
  const thinking = appendMessage('assistant', 'Thinking...');

  try {
    const res = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ question, document_id: currentDocId })
    });
    const data = await res.json();
    thinking.textContent = res.ok ? data.answer : (data.error || 'Something went wrong');
  } catch {
    thinking.textContent = 'Something went wrong — try again.';
  }
});

async function submitAuthForm(formId, endpoint) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      window.location.href = '/';
    } catch (err) {
      alert(err.message);
    }
  });
}

submitAuthForm('login-form', '/login');
submitAuthForm('signup-form', '/signup');