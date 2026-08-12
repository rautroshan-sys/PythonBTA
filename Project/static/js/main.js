/* Extractly — front-end behaviour: method selection, upload, docked chat panel. */
(function () {
  "use strict";

  var state = { method: null, accept: "", file: null, documentId: null, hasDocument: false };

  var panel = document.getElementById("chat-panel");
  var toggle = document.getElementById("chat-toggle");
  var closeBtn = document.getElementById("chat-close-btn");
  var chatLog = document.getElementById("chat-log");
  var chatForm = document.getElementById("chat-form");
  var chatInput = document.getElementById("chat-input");
  var chatAskBtn = document.getElementById("chat-ask-btn");
  var chatTitle = document.getElementById("chat-title");

  function setPanel(open) {
    panel.classList.toggle("open", open);
    panel.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    toggle.classList.toggle("shifted", open);
    if (open && !chatInput.disabled) chatInput.focus();
  }

  toggle.addEventListener("click", function () {
    setPanel(!panel.classList.contains("open"));
  });
  closeBtn.addEventListener("click", function () { setPanel(false); });

  function addMessage(role, text) {
    var empty = document.getElementById("chat-empty-state");
    if (empty) empty.remove();
    var el = document.createElement("div");
    el.className = "msg msg-" + role;
    el.textContent = text;
    chatLog.appendChild(el);
    chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
    return el;
  }

  chatForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    var question = chatInput.value.trim();
    if (!question || !state.hasDocument) return;
    chatInput.value = "";
    addMessage("user", question);
    var thinking = addMessage("assistant", "Thinking…");
    thinking.classList.add("msg-thinking");
    chatAskBtn.disabled = true;
    try {
      var res = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question, document_id: state.documentId }),
      });
      var data = await res.json();
      thinking.classList.remove("msg-thinking");
      thinking.textContent = data.answer || data.error || "Something went wrong.";
    } catch (err) {
      thinking.classList.remove("msg-thinking");
      thinking.textContent = "Network error — is the server running?";
    } finally {
      chatAskBtn.disabled = false;
      chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
    }
  });

  chatInput.addEventListener("input", function () {
    chatAskBtn.disabled = !state.hasDocument || !chatInput.value.trim();
  });

  var uploadZone = document.getElementById("upload-zone");
  if (!uploadZone) return;

  var fileInput = document.getElementById("file-input");
  var uploadLabel = document.getElementById("upload-label");
  var uploadHint = document.getElementById("upload-hint");
  var extractBtn = document.getElementById("extract-btn");
  var resultSection = document.getElementById("result-section");
  var resultStatus = document.getElementById("result-status");

  var DROP_LABELS = {
    pdf: "Drop a PDF here, or click to browse",
    image: "Drop an image here, or click to browse",
    text: "Drop a text file here, or click to browse",
  };

  function refresh() {
    uploadZone.setAttribute("aria-disabled", String(!state.method));
    uploadLabel.textContent = state.file
      ? state.file.name
      : state.method
        ? DROP_LABELS[state.method]
        : "Select a method above to begin";
    uploadHint.textContent = state.file ? "Ready to extract" : "Drag and drop, or click to browse";
    extractBtn.disabled = !state.method || !state.file;
  }

  document.querySelectorAll(".method-card").forEach(function (card) {
    card.addEventListener("click", function () {
      document.querySelectorAll(".method-card").forEach(function (c) {
        c.setAttribute("aria-pressed", String(c === card));
      });
      state.method = card.dataset.method;
      state.accept = card.dataset.accept || "";
      state.file = null;
      fileInput.value = "";
      fileInput.setAttribute("accept", state.accept);
      resultSection.hidden = true;
      refresh();
    });
  });

  uploadZone.addEventListener("click", function () { if (state.method) fileInput.click(); });
  uploadZone.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && state.method) { e.preventDefault(); fileInput.click(); }
  });
  uploadZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    if (state.method) uploadZone.classList.add("dragging");
  });
  uploadZone.addEventListener("dragleave", function () { uploadZone.classList.remove("dragging"); });
  uploadZone.addEventListener("drop", function (e) {
    e.preventDefault();
    uploadZone.classList.remove("dragging");
    if (!state.method || !e.dataTransfer.files.length) return;
    state.file = e.dataTransfer.files[0];
    resultSection.hidden = true;
    refresh();
  });
  fileInput.addEventListener("change", function () {
    state.file = fileInput.files[0] || null;
    resultSection.hidden = true;
    refresh();
  });

  extractBtn.addEventListener("click", async function () {
    if (!state.file || !state.method) return;
    extractBtn.disabled = true;
    extractBtn.textContent = "Extracting…";
    var body = new FormData();
    body.append("file", state.file);
    try {
      var res = await fetch("/upload", { method: "POST", body: body });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      state.hasDocument = true;
      state.documentId = data.document_id;
      var words = data.text.trim().split(/\s+/).length;
      resultStatus.textContent = "Extracted " + words + " words from " + state.file.name + ".";
      resultSection.hidden = false;
      chatTitle.textContent = "Ask questions about " + state.file.name;
      chatInput.disabled = false;
      chatInput.placeholder = "Ask a question…";
      addMessage("assistant", data.text);
      setPanel(true);
    } catch (err) {
      resultStatus.textContent = err.message || "Extraction failed. Try another file.";
      resultSection.hidden = false;
    } finally {
      extractBtn.textContent = "Extract text";
      refresh();
    }
  });

  refresh();
})();

