const methodCards = document.querySelectorAll('.method-card');
const uploadTitle = document.getElementById('upload-title');
const extractBtn = document.getElementById('extract-btn');
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const extractForm = document.getElementById('extract-form');
const resultSection = document.getElementById('result-section');
const resultBox = document.getElementById('result-box');
const chatPanel = document.getElementById('chat-panel');
const chatPanelTitle = document.getElementById('chat-panel-title');
const questionInput = document.getElementById('question-input');

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
    resultBox.textContent = 'Uploaded — ask questions about it in the chat panel.';

    document.getElementById('chat-log').innerHTML = '';
    appendMessage('assistant', data.text);
    chatPanelTitle.textContent = selectedFile.name;
    questionInput.disabled = false;
    questionInput.placeholder = 'Ask a question...';
    chatPanel.classList.add('open');
  } catch (err) {
    alert(err.message || 'Something went wrong — try again.');
  } finally {
    extractBtn.disabled = false;
    extractBtn.textContent = 'Extract text';
  }
});

document.getElementById('chat-toggle').addEventListener('click', () => {
  chatPanel.classList.toggle('open');
});

document.getElementById('chat-close').addEventListener('click', () => {
  chatPanel.classList.remove('open');
});

function appendMessage(role, text) {
  const bubble = document.createElement('div');
  bubble.style.cssText = role === 'user'
    ? 'align-self:flex-end;background:var(--accent-soft);color:var(--ink);padding:10px 14px;border-radius:10px;max-width:85%'
    : 'align-self:flex-start;background:var(--paper);border:1px solid var(--line);padding:10px 14px;border-radius:10px;max-width:85%';
  bubble.textContent = text;
  document.getElementById('chat-log').appendChild(bubble);
  bubble.scrollIntoView({ behavior: 'smooth' });
  return bubble;
}

document.getElementById('ask-btn').addEventListener('click', async () => {
  const question = questionInput.value.trim();
  if (!question || !currentDocId) return;

  appendMessage('user', question);
  questionInput.value = '';
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

function showToast(text) {
  const toast = document.createElement('div');
  toast.textContent = text;
  toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:10px 20px;border-radius:8px;z-index:200;font-size:14px';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1200);
}

async function submitAuthForm(formId, endpoint) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const nameField = document.getElementById('name');
    const body = nameField ? { name: nameField.value, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      showToast(endpoint === '/signup' ? 'Account created' : 'Logged in');
      setTimeout(() => window.location.href = '/', 900);
    } catch (err) {
      alert(err.message);
    }
  });
}

submitAuthForm('login-form', '/login');
submitAuthForm('signup-form', '/signup');

const signoutBtn = document.getElementById('signout-btn');
if (signoutBtn) {
  signoutBtn.addEventListener('click', async () => {
    await fetch('/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  });
}