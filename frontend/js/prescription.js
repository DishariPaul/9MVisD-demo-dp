/**
 * MediVault — prescription.js
 * Works with the exact HTML provided. No HTML modifications needed.
 * Modals (previewModal, previousModal) are injected by this file at init.
 */

// ─── Constants ───────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api";

// ─── State ───────────────────────────────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const VIEW_MODE = params.get("mode") === "view";
const VIEW_PRESCRIPTION_ID = params.get("id");

let editingPrescriptionId = null;

const tags = {
  history: [],
  illness: [],
  advice: [],
};

let medicines = [];
let patientData = null;
let doctorData = null;

// ─── Utility ─────────────────────────────────────────────────────────────────

function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function showToast(message, type = "info") {
  let container = document.getElementById("mv-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "mv-toast-container";
    container.style.cssText =
      "position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;";
    document.body.appendChild(container);
  }

  const colors = { success: "#22c55e", error: "#ef4444", info: "#3b82f6" };
  const toast = document.createElement("div");
  toast.style.cssText = `
    background:#1e293b;color:#f1f5f9;
    border-left:4px solid ${colors[type] || colors.info};
    padding:12px 18px;border-radius:8px;font-size:14px;
    box-shadow:0 4px 20px rgba(0,0,0,0.4);
    opacity:0;transition:opacity 0.3s ease;max-width:320px;
  `;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => (toast.style.opacity = "1"));
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 320);
  }, 3500);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function debounce(fn, delay = 280) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function setField(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function bindBtn(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", fn);
}

// ─── Modal Injection ──────────────────────────────────────────────────────────
// The HTML has these modals commented out — we inject them via JS.

function injectModals() {
  if (!document.getElementById("previewModal")) {
    const previewModal = document.createElement("div");
    previewModal.id = "previewModal";
    previewModal.style.cssText =
      "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9000;" +
      "align-items:center;justify-content:center;padding:20px;";
    previewModal.innerHTML = `
      <div style="background:#fff;border-radius:12px;max-width:780px;width:100%;
                  max-height:90vh;overflow-y:auto;padding:32px;position:relative;">
        <button id="closePreviewBtn" style="position:absolute;top:14px;right:18px;
          background:none;border:none;font-size:22px;cursor:pointer;color:#64748b;">&times;</button>
        <div id="previewContent"></div>
        <div style="margin-top:20px;text-align:right;">
          <button id="previewPrintBtn" style="
            background:#1e293b;color:#fff;border:none;padding:9px 22px;
            border-radius:7px;cursor:pointer;font-size:14px;">🖨 Print</button>
        </div>
      </div>
    `;
    document.body.appendChild(previewModal);
  }

  if (!document.getElementById("previousModal")) {
    const prevModal = document.createElement("div");
    prevModal.id = "previousModal";
    prevModal.style.cssText =
      "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9000;" +
      "align-items:center;justify-content:center;padding:20px;";
    prevModal.innerHTML = `
      <div style="background:#fff;border-radius:12px;max-width:700px;width:100%;
                  max-height:85vh;overflow-y:auto;padding:32px;position:relative;">
        <button id="closePreviousBtn" style="position:absolute;top:14px;right:18px;
          background:none;border:none;font-size:22px;cursor:pointer;color:#64748b;">&times;</button>
        <h3 style="margin:0 0 20px;font-size:18px;color:#1e293b;">Previous Prescriptions</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="border-bottom:2px solid #e2e8f0;">
              <th style="text-align:left;padding:8px 10px;">Date</th>
              <th style="text-align:left;padding:8px 10px;">Doctor</th>
              <th style="text-align:left;padding:8px 10px;">Actions</th>
            </tr>
          </thead>
          <tbody id="previousTableBody"></tbody>
        </table>
      </div>
    `;
    document.body.appendChild(prevModal);
  }

  // Wire close buttons and backdrop clicks after injection
  bindBtn("closePreviewBtn", closePreviewModal);
  bindBtn("closePreviousBtn", closePreviousModal);
  bindBtn("previewPrintBtn", printPrescription);

  document.getElementById("previewModal").addEventListener("click", (e) => {
    if (e.target.id === "previewModal") closePreviewModal();
  });
  document.getElementById("previousModal").addEventListener("click", (e) => {
    if (e.target.id === "previousModal") closePreviousModal();
  });
}

// ─── Doctor Info ──────────────────────────────────────────────────────────────
function loadDoctorInfo() {
  try {
    const raw = localStorage.getItem("medivault_user");

    if (!raw) return;

    const user = JSON.parse(raw);

    doctorData = user.data;

    if (!doctorData) return;

    setField("doctorName", doctorData.doctor_name || "");
    setField("doctorDegree", doctorData.degree || "");
    setField("doctorExtra", doctorData.specialization || "");
    setField("doctorContact", doctorData.phone || "");
    setField("chamberAddress", doctorData.hospital || "");
    setField("chamberTime", doctorData.timing || "");

  } catch (e) {
    console.error(
      "Could not load doctor info",
      e
    );
  }
}

// ─── Patient Info ─────────────────────────────────────────────────────────────

async function loadPatientInfo() {
  const patientId = getQueryParam("patientId");
  if (!patientId) {
    showToast("No patient ID in URL.", "error");
    return;
  }
  try {
    const res  = await fetch(`${API_BASE}/patient/${patientId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to load patient.");
    patientData = json.data;
    setField("patientName",    patientData.patient_name || "");
    setField("patientAge",     patientData.age ? `${patientData.age} yrs` : "");
    setField("patientGender",  patientData.gender       || "");
    setField("patientContact", patientData.phone_number || "");
  } catch (err) {
    showToast("Error loading patient info.", "error");
    console.error(err);
  }
}

// ─── Date Label ───────────────────────────────────────────────────────────────

function setDateLabel() {
  setField("rxDateLabel", "Date: " + formatDate(new Date().toISOString()));
}

// ─── Vitals ───────────────────────────────────────────────────────────────────
// The HTML vitals are <span> elements. We make them contenteditable so the
// user can click and type directly on the prescription form.

const VITAL_IDS = ["weight", "height", "pulse", "bloodPressure", "temperature", "respiratoryRate"];

function setupVitals() {
  VITAL_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.contentEditable = "true";
    el.style.cursor = "text";
    el.style.minWidth = "40px";
    el.style.outline = "none";
    el.style.borderBottom = "1px dashed rgba(255,255,255,0.3)";
    // Clear placeholder dash on first focus
    el.addEventListener("focus", () => {
      if (el.textContent.trim() === "—") el.textContent = "";
    });
    el.addEventListener("blur", () => {
      if (!el.textContent.trim()) el.textContent = "—";
    });
    // Prevent newlines
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); el.blur(); }
    });
  });
}

function getVitals() {
  const clean = (id) => {
    const el = document.getElementById(id);
    if (!el) return "";
    const v = el.textContent.trim();
    return v === "—" ? "" : v;
  };
  return {
    weight:         clean("weight"),
    height:         clean("height"),
    pulse:          clean("pulse"),
    bloodPressure:  clean("bloodPressure"),
    temperature:    clean("temperature"),
    respiratoryRate:clean("respiratoryRate"),
  };
}

function setVitals(vitals = {}) {
  const map = {
    weight:          vitals.weight          || "",
    height:          vitals.height          || "",
    pulse:           vitals.pulse           || "",
    bloodPressure:   vitals.blood_pressure  || vitals.bloodPressure  || "",
    temperature:     vitals.temperature     || "",
    respiratoryRate: vitals.respiratory_rate|| vitals.respiratoryRate|| "",
  };
  VITAL_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = map[id] || "—";
  });
}

// ─── Tag Panels ───────────────────────────────────────────────────────────────
function setupTagPanel(type, searchEndpoint, resultKey) {
  const input     = document.getElementById(`${type}Input`);
  const dropdown  = document.getElementById(`${type}Dropdown`);
  const container = document.getElementById(`${type}Tags`);
  const addBtn    = document.getElementById(`add${capitalize(type)}Btn`);

  if (!input || !dropdown || !container) return;

  let activeIndex    = -1;
  let currentResults = [];

  const doSearch = debounce(async (q) => {
    if (!q) { closeDropdown(); return; }
    try {
      const res  = await fetch(`${searchEndpoint}?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!json.success) return;
      
      currentResults = (json.results || []).map((item) => item[resultKey]).filter(Boolean);

      renderDropdown(currentResults);
    } catch (err) {
      console.error(`${type} search error:`, err);
    }
  }, 280);

  function renderDropdown(items) {
    dropdown.innerHTML = "";
    activeIndex = -1;
    if (!items.length) { closeDropdown(); return; }
    items.forEach((text, i) => {
      const li = document.createElement("li");
      li.textContent = text;
      li.style.cssText = "padding:8px 12px;cursor:pointer;list-style:none;";
      li.addEventListener("mouseover", () => li.style.background = "#f1f5f9");
      li.addEventListener("mouseout",  () => li.style.background = "");
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        addTag(type, text, container);
        input.value = "";
        closeDropdown();
      });
      dropdown.appendChild(li);
    });
    dropdown.style.display = "block";
  }

  function closeDropdown() {
    dropdown.style.display = "none";
    dropdown.innerHTML = "";
    currentResults = [];
    activeIndex = -1;
  }

  function highlightItem(index) {
    dropdown.querySelectorAll("li").forEach((li, i) => {
      li.style.background = i === index ? "#e2e8f0" : "";
    });
  }

  input.addEventListener("input", () => doSearch(input.value.trim()));

  input.addEventListener("keydown", (e) => {
    const items = dropdown.querySelectorAll("li");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      highlightItem(activeIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      highlightItem(activeIndex);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && currentResults[activeIndex]) {
        addTag(type, currentResults[activeIndex], container);
      } else if (input.value.trim()) {
        addTag(type, input.value.trim(), container);
      }
      input.value = "";
      closeDropdown();
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  input.addEventListener("blur", () => setTimeout(closeDropdown, 160));

  // "+" Add button
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const v = input.value.trim();
      if (v) { addTag(type, v, container); input.value = ""; closeDropdown(); }
    });
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function addTag(type, text, container) {
  if (!text || tags[type].includes(text)) return;
  tags[type].push(text);
  renderTag(type, text, container);
}

function renderTag(type, text, container) {
  const span = document.createElement("span");
  span.className = "tag";
  span.dataset.value = text;
  span.innerHTML = `${escapeHtml(text)} <button class="tag-remove" aria-label="Remove" style="
    background:none;border:none;cursor:pointer;margin-left:4px;
    font-size:14px;line-height:1;opacity:0.7;">&times;</button>`;
  span.querySelector(".tag-remove").addEventListener("click", () => {
    tags[type] = tags[type].filter((t) => t !== text);
    span.remove();
  });
  container.appendChild(span);
}

function renderAllTags(type, values = []) {
  const container = document.getElementById(`${type}Tags`);
  if (!container) return;
  container.querySelectorAll(".tag").forEach((el) => el.remove());
  tags[type] = [];
  values.forEach((v) => addTag(type, v, container));
}

// ─── Medicine Autocomplete ────────────────────────────────────────────────────
function setupMedicineAutocomplete() {
  const input    = document.getElementById("medName");
  const dropdown = document.getElementById("medicineDropdown");
  if (!input || !dropdown) return;

  let activeIndex    = -1;
  let currentResults = [];

  const doSearch = debounce(async (q) => {
    if (!q) { closeDropdown(); return; }
    try {
      const res  = await fetch(`${API_BASE}/prescriptions/medicine/search?q=${encodeURIComponent(q)}`);
      
      const json = await res.json();
      console.log("Medicine Search:", json);

      if (!json.success) return;
      
      currentResults = (json.results || []).map((m) => m.medicine_name).filter(Boolean);
      renderDropdown(currentResults);
    } catch (err) {
      console.error("Medicine search error:", err);
    }
  }, 280);

  function renderDropdown(items) {
    dropdown.innerHTML = "";
    activeIndex = -1;
    if (!items.length) { closeDropdown(); return; }
    items.forEach((name) => {
      const li = document.createElement("div");
      li.textContent = name;
      li.style.cssText = "padding:8px 12px;cursor:pointer;font-size:14px;";
      li.addEventListener("mouseover", () => li.style.background = "#f1f5f9");
      li.addEventListener("mouseout",  () => li.style.background = "");
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = name;
        closeDropdown();
        input.focus();
      });
      dropdown.appendChild(li);
    });
    dropdown.style.display = "block";
  }

  function closeDropdown() {
    dropdown.style.display = "none";
    dropdown.innerHTML = "";
    currentResults = [];
    activeIndex = -1;
  }

  function highlightItem(idx) {
    [...dropdown.children].forEach((el, i) => {
      el.style.background = i === idx ? "#e2e8f0" : "";
    });
  }

  input.addEventListener("input",  () => doSearch(input.value.trim()));
  input.addEventListener("blur",   () => setTimeout(closeDropdown, 160));
  input.addEventListener("keydown", (e) => {
    const items = [...dropdown.children];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      highlightItem(activeIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      highlightItem(activeIndex);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && currentResults[activeIndex]) {
        input.value = currentResults[activeIndex];
      }
      closeDropdown();
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });
}

// ─── Medicine Table ───────────────────────────────────────────────────────────

function addMedicine() {
  const name     = (document.getElementById("medName")?.value     || "").trim();
  const dosage   = (document.getElementById("medDosage")?.value   || "").trim();
  const freq     = (document.getElementById("medFreq")?.value     || "").trim();
  const duration = (document.getElementById("medDuration")?.value || "").trim();

  if (!name) { showToast("Please enter a medicine name.", "error"); return; }

  // Build display strings
  const freqDisplay     = freq     ? `${freq}/day`     : "";
  const durationDisplay = duration ? `${duration} days`: "";

  medicines.push({
    medicine_name: name,
    dosage:        dosage,
    frequency:     freqDisplay  || freq,
    duration:      durationDisplay || duration,
    _freqRaw:      freq,
    _durRaw:       duration,
  });
  renderMedicineTable();
  clearMedicineForm();
}

function clearMedicineForm() {
  ["medName", "medDosage", "medFreq", "medDuration"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

function deleteMedicine(index) {
  medicines.splice(index, 1);
  renderMedicineTable();
}

function renderMedicineTable() {
  const tbody = document.getElementById("medicineTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!medicines.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:18px;opacity:0.5;font-size:14px;">
          No medicines added yet.
        </td>
      </tr>`;
    return;
  }

  medicines.forEach((med, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(med.medicine_name)}</td>
      <td>${escapeHtml(med.dosage    || "—")}</td>
      <td>${escapeHtml(med.frequency || "—")}</td>
      <td>${escapeHtml(med.duration  || "—")}</td>
      <td>
        <button onclick="deleteMedicine(${i})"
          style="background:none;border:none;cursor:pointer;font-size:18px;color:#ef4444;"
          title="Remove medicine">&times;</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function buildPrescriptionHTML({ prescription, patient, doctor, medicineList }) {
  const d   = prescription || {};
  const p   = patient  || patientData || {};
  const doc = doctor   || doctorData  || {};

  const vitals = [
    { label: "Weight",   value: d.weight },
    { label: "Height",   value: d.height },
    { label: "Pulse",    value: d.pulse  },
    { label: "BP",       value: d.blood_pressure  || d.bloodPressure   },
    { label: "Temp",     value: d.temperature     },
    { label: "RR",       value: d.respiratory_rate|| d.respiratoryRate },
  ].filter((v) => v.value && v.value !== "—");

  const historyArr = Array.isArray(d.history)   ? d.history   : tags.history;
  const illnessArr = Array.isArray(d.illnesses) ? d.illnesses : tags.illness;
  const adviceArr  = Array.isArray(d.advice)    ? d.advice    : tags.advice;
  const meds       = medicineList || medicines;

  const tag = (t) => `<span style="display:inline-block;background:#f1f5f9;border:1px solid #cbd5e1;
    padding:2px 10px;border-radius:999px;font-size:13px;margin:2px;">${escapeHtml(t)}</span>`;

  return `
    <div style="font-family:Arial,sans-serif;color:#111;max-width:700px;margin:0 auto;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
        <div>
          <div style="font-size:20px;font-weight:700;">${escapeHtml(doc.doctorName||doc.doctor_name||"")}</div>
          <div style="font-size:14px;">${escapeHtml(doc.doctorDegree||doc.degree||"")}</div>
          <div style="font-size:13px;color:#555;">${escapeHtml(doc.doctorExtra||doc.specialization||"")}</div>
          <div style="font-size:13px;color:#555;">${escapeHtml(doc.doctorContact||doc.phone||"")}</div>
        </div>
        <div style="text-align:right;font-size:13px;color:#555;">
          <div>${escapeHtml(doc.chamberAddress||doc.address||"")}</div>
          <div>${escapeHtml(doc.chamberTime||doc.timing||"")}</div>
        </div>
      </div>

      <hr style="border:none;border-top:2px solid #111;margin:8px 0;" />

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-bottom:12px;font-size:14px;">
        <div><strong>Patient:</strong> ${escapeHtml(p.patient_name||"")}</div>
        <div><strong>Date:</strong> ${formatDate(d.created_at||new Date().toISOString())}</div>
        <div><strong>Age:</strong> ${escapeHtml(String(p.age||""))}</div>
        <div><strong>Gender:</strong> ${escapeHtml(p.gender||"")}</div>
        <div><strong>Contact:</strong> ${escapeHtml(p.phone_number||"")}</div>
      </div>

      ${vitals.length ? `
        <div style="margin-bottom:12px;">
          <div style="font-weight:600;font-size:13px;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:6px;">VITALS</div>
          <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:13px;">
            ${vitals.map((v) => `<span><strong>${v.label}:</strong> ${escapeHtml(v.value)}</span>`).join("")}
          </div>
        </div>` : ""}

      ${historyArr.length ? `
        <div style="margin-bottom:12px;">
          <div style="font-weight:600;font-size:13px;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:6px;">PATIENT HISTORY</div>
          <div>${historyArr.map(tag).join("")}</div>
        </div>` : ""}

      ${illnessArr.length ? `
        <div style="margin-bottom:12px;">
          <div style="font-weight:600;font-size:13px;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:6px;">ILLNESS / SYMPTOMS</div>
          <div>${illnessArr.map(tag).join("")}</div>
        </div>` : ""}

      ${meds.length ? `
        <div style="margin-bottom:12px;">
          <div style="font-weight:600;font-size:13px;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:6px;">MEDICINES</div>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="border:1px solid #ddd;padding:6px 10px;text-align:left;">#</th>
                <th style="border:1px solid #ddd;padding:6px 10px;text-align:left;">Medicine</th>
                <th style="border:1px solid #ddd;padding:6px 10px;text-align:left;">Dosage</th>
                <th style="border:1px solid #ddd;padding:6px 10px;text-align:left;">Frequency</th>
                <th style="border:1px solid #ddd;padding:6px 10px;text-align:left;">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${meds.map((m, i) => `
                <tr>
                  <td style="border:1px solid #ddd;padding:6px 10px;">${i + 1}</td>
                  <td style="border:1px solid #ddd;padding:6px 10px;">${escapeHtml(m.medicine_name)}</td>
                  <td style="border:1px solid #ddd;padding:6px 10px;">${escapeHtml(m.dosage    ||"—")}</td>
                  <td style="border:1px solid #ddd;padding:6px 10px;">${escapeHtml(m.frequency ||"—")}</td>
                  <td style="border:1px solid #ddd;padding:6px 10px;">${escapeHtml(m.duration  ||"—")}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>` : ""}

      ${adviceArr.length ? `
        <div style="margin-bottom:12px;">
          <div style="font-weight:600;font-size:13px;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:6px;">ADVICE</div>
          <ul style="margin:0;padding-left:18px;font-size:14px;">
            ${adviceArr.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}
          </ul>
        </div>` : ""}

      ${(d.follow_up_date || d.followUpDate) ? `
        <div style="font-size:14px;margin-top:8px;">
          <strong>Follow-up Date:</strong> ${formatDate(d.follow_up_date || d.followUpDate)}
        </div>` : ""}
    </div>
  `;
}

function openPreviewModal(options = {}) {
  const modal   = document.getElementById("previewModal");
  const content = document.getElementById("previewContent");
  if (!modal || !content) return;

  content.innerHTML = buildPrescriptionHTML({
    prescription: options.prescription || {
      ...getVitals(),
      history:      tags.history,
      illnesses:    tags.illness,
      advice:       tags.advice,
      follow_up_date: (document.getElementById("followUpDate")?.value || ""),
      created_at:   new Date().toISOString(),
    },
    patient:     options.patient  || null,
    doctor:      options.doctor   || null,
    medicineList:options.medicines|| null,
  });
  modal.style.display = "flex";
}

function closePreviewModal() {
  const modal = document.getElementById("previewModal");
  if (modal) modal.style.display = "none";
}

// ─── Print ────────────────────────────────────────────────────────────────────

function printPrescription() {
  const content = document.getElementById("previewContent");

  // If preview modal isn't open yet, open it first, then print
  const modal = document.getElementById("previewModal");
  if (!content || !content.innerHTML.trim() || modal.style.display === "none") {
    openPreviewModal();
    // Wait one tick for render then print
    setTimeout(() => doPrint(), 80);
    return;
  }
  doPrint();
}

function doPrint() {
  const content = document.getElementById("previewContent");
  if (!content) return;
  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Prescription Summary</title>
    <style>
      body{font-family:Arial,sans-serif;margin:24px;color:#111;}
      table{border-collapse:collapse;}
      @media print{body{margin:0;}}
    </style>
  </head><body>${content.innerHTML}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

// ─── Save / Update ────────────────────────────────────────────────────────────
async function savePrescription() {
  const patientId = getQueryParam("patientId");
  if (!patientId) { showToast("Patient ID missing.", "error"); return; }
  if (!doctorData) { showToast("Doctor info not loaded.", "error"); return; }

  const followUpEl = document.getElementById("followUpDate");

  // Strip display helpers (_freqRaw, _durRaw) before sending
  const cleanMeds = medicines.map(({ medicine_name, dosage, frequency, duration }) =>
    ({ medicine_name, dosage, frequency, duration })
  );

  const payload = {
    patientId,
    doctorId: doctorData.doctor_id || doctorData.doctorId || "",
    ...getVitals(),
    history:     tags.history,
    illnesses:   tags.illness,
    advice:      tags.advice,
    followUpDate:followUpEl ? followUpEl.value : "",
    medicines:   cleanMeds,
  };

  const isUpdate = editingPrescriptionId !== null;
  const url    = isUpdate
    ? `${API_BASE}/prescriptions/${editingPrescriptionId}`
    : `${API_BASE}/prescriptions`;
  const method = isUpdate ? "PUT" : "POST";

  try {
    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Save failed.");

    showToast(isUpdate ? "Prescription updated." : "Prescription saved.", "success");
    editingPrescriptionId = null;
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) saveBtn.textContent = "Save";
  } catch (err) {
    showToast("Failed to save prescription.", "error");
    console.error(err);
  }
}

// ─── Delete (footer deleteBtn) ────────────────────────────────────────────────
async function handleDeleteBtn() {
  if (!editingPrescriptionId) {
    showToast("No prescription selected to delete.", "info");
    return;
  }
  await deletePrescription(editingPrescriptionId);
}

// ─── Previous Prescriptions Modal ─────────────────────────────────────────────
async function openPreviousModal() {
  const modal = document.getElementById("previousModal");
  const tbody = document.getElementById("previousTableBody");
  if (!modal || !tbody) return;

  const patientId = getQueryParam("patientId");
  console.log("Patient ID:", patientId);
  if (!patientId) { showToast("Patient ID missing.", "error"); return; }

  tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px;opacity:0.5;">Loading…</td></tr>`;
  modal.style.display = "flex";

  try {
    const res  = await fetch(`${API_BASE}/prescriptions/patient/${patientId}`);
    const json = await res.json();
    console.log("API Response:", json);
    if (!json.success) throw new Error(json.message);

    const list = json.prescriptions ?? json.data ?? [];
    tbody.innerHTML = "";

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px;opacity:0.5;">No prescriptions found.</td></tr>`;
      return;
    }

    list.forEach((row) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #f1f5f9";
      tr.innerHTML = `
        <td style="padding:10px;">${formatDate(row.created_at)}</td>
        <td style="padding:10px;">${escapeHtml(row.doctor_name || "—")}</td>
        <td style="padding:10px;white-space:nowrap;">
          <button onclick="viewPrescription('${row.prescription_id}')"
            style="margin-right:6px;padding:4px 10px;background:#3b82f6;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:13px;">View</button>
          <button onclick="editPrescription('${row.prescription_id}')"
            style="margin-right:6px;padding:4px 10px;background:#f59e0b;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:13px;">Edit</button>
          <button onclick="deletePrescription('${row.prescription_id}')"
            style="padding:4px 10px;background:#ef4444;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:13px;">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px;color:#ef4444;">Failed to load prescriptions.</td></tr>`;
    console.error(err);
  }
}

function closePreviousModal() {
  const modal = document.getElementById("previousModal");
  if (modal) modal.style.display = "none";
}

// ─── View Prescription ────────────────────────────────────────────────────────

async function viewPrescription(prescriptionId) {
  try {
    const data = await fetchFullPrescription(prescriptionId);
    openPreviewModal({
      prescription: data.prescription,
      patient:      data.patient,
      doctor:       data.doctor,
      medicines:    data.medicines,
    });
  } catch (err) {
    showToast("Failed to load prescription.", "error");
    console.error(err);
  }
}

// ─── Edit Prescription ────────────────────────────────────────────────────────

async function editPrescription(prescriptionId) {
  try {
    const data = await fetchFullPrescription(prescriptionId);
    const rx   = data.prescription;

    setVitals(rx);

    console.log("rx =", rx);
    console.log("history =", rx.history);
    console.log("illnesses =", rx.illnesses);
    console.log("advice =", rx.advice);

    renderAllTags("history", rx.history   || []);
    renderAllTags("illness", rx.illnesses || []);
    // renderAllTags("advice",  rx.advice    || []);

    //to convert the advice from string to list, like the rest
    let adviceValues = [];

    if (Array.isArray(rx.advice)) {
        adviceValues = rx.advice;
    }
    else if (typeof rx.advice === "string") {
        adviceValues = rx.advice
            .replace(/^{|}$/g, "")
            .split(",")
            .map(v => v.replace(/"/g, "").trim())
            .filter(Boolean);
    }
    renderAllTags("advice", adviceValues);

    medicines = (data.medicines || []).map(({ medicine_name, dosage, frequency, duration }) =>
      ({ medicine_name, dosage, frequency, duration })
    );
    renderMedicineTable();

    const followUpEl = document.getElementById("followUpDate");
    if (followUpEl && rx.follow_up_date) {
      followUpEl.value = new Date(rx.follow_up_date).toISOString().split("T")[0];
    }

    editingPrescriptionId = prescriptionId;
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) saveBtn.textContent = "Update";

    closePreviousModal();
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("Prescription loaded for editing.", "info");
  } catch (err) {
    showToast("Failed to load prescription for editing.", "error");
    console.error(err);
  }
}

// ─── Delete Prescription ──────────────────────────────────────────────────────

async function deletePrescription(prescriptionId) {
  if (!confirm("Delete this prescription? This cannot be undone.")) return;
  try {
    const res  = await fetch(`${API_BASE}/prescriptions/${prescriptionId}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    showToast("Prescription deleted.", "success");

    if (editingPrescriptionId === prescriptionId) {
      editingPrescriptionId = null;
      const saveBtn = document.getElementById("saveBtn");
      if (saveBtn) saveBtn.textContent = "Save";
    }

    // Refresh list if modal is open
    const modal = document.getElementById("previousModal");
    if (modal && modal.style.display === "flex") openPreviousModal();
  } catch (err) {
    showToast("Failed to delete prescription.", "error");
    console.error(err);
  }
}

// ─── Fetch Full Prescription ──────────────────────────────────────────────────
async function fetchFullPrescription(prescriptionId) {
  const res  = await fetch(`${API_BASE}/prescriptions/${prescriptionId}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Fetch failed.");
  return {
    prescription: json.prescription,
    patient:      json.patient   || null,
    doctor:       json.doctor    || null,
    medicines:    json.medicines || [],
  };
}


// ─── View-Mode Prescription (only for patient.js) ──────────────────────────────────────────────────
function enableViewMode() {
    // Hide buttons
    [
        "saveBtn",
        "editBtn",
        "deleteBtn"
    ].forEach((id) => {

        const btn = document.getElementById(id);

        if (btn)
            btn.style.display = "none";

    });

    // Disable follow-up
    const followUp =
        document.getElementById("followUpDate");

    if (followUp)
        followUp.disabled = true;

    // Disable medicine add inputs
    [
        "medName",
        "medDosage",
        "medFreq",
        "medDuration",
        "addMedBtn"
    ].forEach((id) => {

        const el =
            document.getElementById(id);

        if (!el) return;

        el.disabled = true;

    });

    // Disable tag inputs
    [
        "historyInput",
        "illnessInput",
        "adviceInput",
        "addHistoryBtn",
        "addIllnessBtn",
        "addAdviceBtn"
    ].forEach((id) => {

        const el =
            document.getElementById(id);

        if (!el) return;

        el.disabled = true;

    });

}




// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  injectModals();
  loadDoctorInfo();
  setDateLabel();
  setupVitals();
  await loadPatientInfo();

  // If opened from patient dashboard
  if (VIEW_MODE && VIEW_PRESCRIPTION_ID) {
      await editPrescription(VIEW_PRESCRIPTION_ID);
      enableViewMode();
  }

  // Tag panels — use HTML IDs exactly
  setupTagPanel("history", `${API_BASE}/prescriptions/history/search`, "history_name");
  setupTagPanel("illness", `${API_BASE}/prescriptions/illness/search`, "name");
  setupTagPanel("advice", `${API_BASE}/prescriptions/advice/search`, "advice_text");

  // Medicine
  setupMedicineAutocomplete();
  renderMedicineTable();

  // Footer buttons — use exact HTML IDs
  bindBtn("editBtn",   openPreviousModal);       // Edit → opens previous prescriptions list
  bindBtn("deleteBtn", handleDeleteBtn);         // Delete current editing prescription
  bindBtn("previewBtn",() => openPreviewModal());
  bindBtn("saveBtn",   savePrescription);
  bindBtn("printBtn",  printPrescription);

  // Add medicine button
  bindBtn("addMedBtn", addMedicine);
}

document.addEventListener("DOMContentLoaded", init);







/* 
const user = JSON.parse(localStorage.getItem("medivault_user"));

document.getElementById("doctorName").textContent =
user.data.doctor_name;

document.getElementById("doctorDegree").textContent =
user.data.specialization;

document.getElementById("doctorExtra").textContent =
user.data.hospital;

document.getElementById("doctorContact").textContent =
user.data.phone;

historyInput.addEventListener("input", ...)
*/
