// ===== Method selection =====
const methodCards = document.querySelectorAll('.method-card');
const uploadTitle = document.getElementById('uploadTitle');
const extractBtn = document.getElementById('extractBtn');
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

let selectedMethod = null;
let selectedFile = null;

const methodLabels = {
  pdf: 'Drop a PDF here',
  image: 'Drop a PNG or JPG here',
  text: 'Drop a .txt or .md file here'
};

const methodAccept = {
  pdf: '.pdf',
  image: '.png,.jpg,.jpeg',
  text: '.txt,.md'
};

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

// ===== Upload zone =====
uploadZone.addEventListener('click', () => {
  if (!selectedMethod) return;
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    selectedFile = fileInput.files[0];
    uploadTitle.textContent = selectedFile.name;
  }
  updateExtractButton();
});

['dragover', 'dragleave', 'drop'].forEach(evt => {
  uploadZone.addEventListener(evt, e => e.preventDefault());
});

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

// Wire this to your Flask /upload + /ask routes
extractBtn.addEventListener('click', () => {
  if (!selectedFile) return;
  // Example:
  // const formData = new FormData();
  // formData.append('file', selectedFile);
  // formData.append('method', selectedMethod);
  // fetch('/upload', { method: 'POST', body: formData }).then(...)
  console.log('Extracting', selectedFile.name, 'via', selectedMethod);
});

// ===== Auth modal =====
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalSubmit = document.getElementById('modalSubmit');
const modalSwitchText = document.getElementById('modalSwitchText');
const modalSwitchBtn = document.getElementById('modalSwitchBtn');
const modalClose = document.getElementById('modalClose');
const authForm = document.getElementById('authForm');

const authControlsSignedOut = document.getElementById('authControlsSignedOut');
const authControlsSignedIn = document.getElementById('authControlsSignedIn');
const historyPanel = document.getElementById('historyPanel');
const historyBtn = document.getElementById('historyBtn');
const accountPill = document.getElementById('accountPill');

let modalMode = 'login';

function openModal(mode) {
  modalMode = mode;
  if (mode === 'login') {
    modalTitle.textContent = 'Log in';
    modalSubmit.textContent = 'Log in';
    modalSwitchText.textContent = "Don't have an account?";
    modalSwitchBtn.textContent = 'Register';
  } else {
    modalTitle.textContent = 'Create account';
    modalSubmit.textContent = 'Register';
    modalSwitchText.textContent = 'Already have an account?';
    modalSwitchBtn.textContent = 'Log in';
  }
  modalBackdrop.hidden = false;
}

document.getElementById('loginBtn').addEventListener('click', () => openModal('login'));
document.getElementById('registerBtn').addEventListener('click', () => openModal('register'));
modalSwitchBtn.addEventListener('click', () => openModal(modalMode === 'login' ? 'register' : 'login'));
modalClose.addEventListener('click', () => modalBackdrop.hidden = true);
modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) modalBackdrop.hidden = true;
});

// Frontend-only demo: swap this for a real call to your backend's
// /login or /register endpoint, storing a session token on success.
authForm.addEventListener('submit', e => {
  e.preventDefault();
  modalBackdrop.hidden = true;
  setSignedIn(true);
});

function setSignedIn(isSignedIn) {
  authControlsSignedOut.hidden = isSignedIn;
  authControlsSignedIn.hidden = !isSignedIn;
  historyPanel.hidden = !isSignedIn;
}

historyBtn.addEventListener('click', () => {
  historyPanel.scrollIntoView({ behavior: 'smooth' });
});

// Populate this from your backend once a user is signed in, e.g.
// fetch('/history').then(r => r.json()).then(renderHistory)
function renderHistory(items) {
  const list = document.getElementById('historyList');
  if (!items.length) {
    list.innerHTML = '<div class="history-empty">Nothing extracted yet — your results will show up here.</div>';
    return;
  }
  list.innerHTML = items.map(item => `
    <div class="history-item">
      <span class="history-item-name">${item.name}</span>
      <span class="history-item-date">${item.date}</span>
    </div>
  `).join('');
}