/**
 * MediVault — patient.js
 * Patient dashboard: auth, dashboard stats, documents, camera, prescriptions, sidebar.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:5000/api";

// ─── Utility ──────────────────────────────────────────────────────────────────

function showToast(message, type = "info") {
  let container = document.getElementById("mv-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "mv-toast-container";
    container.style.cssText =
      "position:fixed;bottom:24px;right:24px;z-index:99999;" +
      "display:flex;flex-direction:column;gap:10px;pointer-events:none;";
    document.body.appendChild(container);
  }
  const colors = { success: "#22c55e", error: "#ef4444", info: "#3b82f6", warning: "#f59e0b" };
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
  }, 3800);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ─── Authentication ───────────────────────────────────────────────────────────

function getLoggedInUser() {
  try {
    const raw = localStorage.getItem("medivault_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function requireAuth() {
  const user = getLoggedInUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

function logout() {
  localStorage.removeItem("medivault_user");
  window.location.href = "login.html";
}

// ─── Patient Info ─────────────────────────────────────────────────────────────

function loadPatientName(user) {
  const name =
    user.patient_name ||
    user.name ||
    (user.data && (user.data.patient_name || user.data.name)) ||
    "Patient";
  setTextById("patientName", name);
}

function getPatientId(user) {
  return (
    user.patient_id ||
    user.id ||
    (user.data && (user.data.patient_id || user.data.id)) ||
    null
  );
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

async function loadDashboard(patientId) {
  try {
    const res = await fetch(`${API_BASE}/patient/${patientId}/dashboard`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const data = json.data || json;
    setTextById("totalDocuments", data.totalDocuments ?? data.total_documents ?? "0");
    setTextById("doctorAccess",   data.doctorAccess   ?? data.doctor_access   ?? "0");
  } catch (err) {
    console.error("loadDashboard error:", err);
    setTextById("totalDocuments", "—");
    setTextById("doctorAccess",   "—");
    showToast("Could not load dashboard stats.", "warning");
  }
}

// ─── Documents ────────────────────────────────────────────────────────────────

async function loadDocuments(patientId) {
  const tbody = document.getElementById("documentsTableBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align:center;padding:20px;opacity:0.5;">Loading…</td>
    </tr>`;

  try {
    const res  = await fetch(`${API_BASE}/patient/${patientId}/documents`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const docs = json.data || json.documents || json || [];

    if (!Array.isArray(docs) || docs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;padding:20px;opacity:0.5;">No documents found.</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = "";
    docs.forEach((doc) => {
      const tr = document.createElement("tr");
      const docId = doc.document_id || doc.id;
      tr.innerHTML = `
        <td>${escapeHtml(doc.file_name || doc.filename || "—")}</td>
        <td>${escapeHtml(doc.type || doc.document_type || "—")}</td>
        <td>${formatDate(doc.uploaded_at || doc.created_at)}</td>
        <td style="white-space:nowrap;">
          <button
            onclick="downloadDocument('${docId}')"
            style="margin-right:6px;padding:5px 12px;background:#3b82f6;color:#fff;
                   border:none;border-radius:6px;cursor:pointer;font-size:13px;">
            Download
          </button>
          <button
            onclick="deleteDocument('${docId}', this)"
            style="padding:5px 12px;background:#ef4444;color:#fff;
                   border:none;border-radius:6px;cursor:pointer;font-size:13px;">
            Delete
          </button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("loadDocuments error:", err);
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;padding:20px;color:#ef4444;">
          Failed to load documents.
        </td>
      </tr>`;
    showToast("Could not load documents.", "error");
  }
}

async function downloadDocument(documentId) {
  try {
    const res = await fetch(`${API_BASE}/documents/download/${documentId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") || "";
    let filename = "document";
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match) filename = match[1].replace(/['"]/g, "");

    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("downloadDocument error:", err);
    showToast("Download failed.", "error");
  }
}

async function deleteDocument(documentId, btnEl) {
  if (!confirm("Delete this document? This cannot be undone.")) return;
  try {
    if (btnEl) btnEl.disabled = true;
    const res  = await fetch(`${API_BASE}/documents/${documentId}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success && res.status !== 200) throw new Error(json.message || "Delete failed.");

    showToast("Document deleted.", "success");
    const user      = getLoggedInUser();
    const patientId = getPatientId(user);
    await loadDocuments(patientId);
    await loadDashboard(patientId);
  } catch (err) {
    console.error("deleteDocument error:", err);
    showToast("Failed to delete document.", "error");
    if (btnEl) btnEl.disabled = false;
  }
}

// ─── Upload (Select File) ─────────────────────────────────────────────────────

function setupFileUpload(patientId) {
  const selectBtn  = document.getElementById("selectFileBtn");
  const typeSelect = document.getElementById("documentType");
  if (!selectBtn) return;

  selectBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type   = "file";
    input.accept = "image/*,.pdf,.doc,.docx";
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      await uploadFile(file, patientId, typeSelect);
    });
    input.click();
  });
}

async function uploadFile(file, patientId, typeSelectEl) {
  const docType = typeSelectEl ? typeSelectEl.value : "general";
  const user    = getLoggedInUser();
  const doctorId = "";
  formData.append("doctorId", doctorId);

  // const doctorId = (user && (user.doctor_id || (user.data && user.data.doctor_id))) || "";

  const formData = new FormData();
  formData.append("patientId", patientId);
  formData.append("doctorId",  doctorId);
  formData.append("type",      docType);
  formData.append("file",      file);

  showToast("Uploading…", "info");

  try {
    const res  = await fetch(`${API_BASE}/documents/upload`, { method: "POST", body: formData });
    const json = await res.json();
    if (!json.success && res.status !== 200 && res.status !== 201) {
      throw new Error(json.message || "Upload failed.");
    }
    showToast("Document uploaded successfully.", "success");
    await loadDocuments(patientId);
    await loadDashboard(patientId);
  } catch (err) {
    console.error("uploadFile error:", err);
    showToast("Upload failed. Please try again.", "error");
  }
}

// ─── Camera ───────────────────────────────────────────────────────────────────

let cameraStream = null;

function setupCamera(patientId) {
  const cameraBtn    = document.getElementById("cameraBtn");
  const cameraModal  = document.getElementById("cameraModal");
  const cameraVideo  = document.getElementById("cameraVideo");
  const cameraCanvas = document.getElementById("cameraCanvas");
  const captureBtn   = document.getElementById("captureBtn");
  const closeBtn     = document.getElementById("closeCameraBtn");
  const typeSelect   = document.getElementById("documentType");

  if (!cameraBtn || !cameraModal) return;

  // Open camera
  cameraBtn.addEventListener("click", async () => {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (cameraVideo) cameraVideo.srcObject = cameraStream;
      cameraModal.style.display = "flex";
    } catch (err) {
      console.error("Camera access error:", err);
      showToast("Camera access denied or unavailable.", "error");
    }
  });

  // Close camera
  if (closeBtn) {
    closeBtn.addEventListener("click", closeCamera);
  }

  // Close on backdrop click
  if (cameraModal) {
    cameraModal.addEventListener("click", (e) => {
      if (e.target === cameraModal) closeCamera();
    });
  }

  // Capture image
  if (captureBtn && cameraCanvas && cameraVideo) {
    captureBtn.addEventListener("click", async () => {
      const ctx = cameraCanvas.getContext("2d");
      cameraCanvas.width  = cameraVideo.videoWidth  || 640;
      cameraCanvas.height = cameraVideo.videoHeight || 480;
      ctx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);

      cameraCanvas.toBlob(async (blob) => {
        if (!blob) { showToast("Could not capture image.", "error"); return; }
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        closeCamera();
        await uploadFile(file, patientId, typeSelect);
      }, "image/jpeg", 0.9);
    });
  }
}

function closeCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  const video = document.getElementById("cameraVideo");
  if (video) video.srcObject = null;
  const modal = document.getElementById("cameraModal");
  if (modal) modal.style.display = "none";
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function setupSidebar() {
  const sidebar  = document.getElementById("sidebar");
  const overlay  = document.getElementById("sidebarOverlay");
  const menuBtn  = document.getElementById("menuToggle");

  if (!menuBtn || !sidebar) return;

  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    if (overlay) overlay.classList.toggle("visible");
  });

  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("visible");
    });
  }
}

// ─── Prescriptions ────────────────────────────────────────────────────────────

async function loadPrescriptions(patientId) {
  const tbody = document.getElementById("prescriptionsTableBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="3" style="text-align:center;padding:20px;opacity:0.5;">Loading…</td>
    </tr>`;

  try {
    const res  = await fetch(`${API_BASE}/prescriptions/patient/${patientId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = json.prescriptions || json.data || [];

    if (!Array.isArray(list) || list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align:center;padding:20px;opacity:0.5;">No prescriptions found.</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = "";
    list.forEach((rx) => {
      const tr   = document.createElement("tr");
      const rxId = rx.prescription_id || rx.id;
      tr.innerHTML = `
        <td>${formatDate(rx.created_at)}</td>
        <td>${escapeHtml(rx.doctor_name || "—")}</td>
        <td>
          <button
            onclick="viewPrescription('${rxId}')"
            style="padding:5px 14px;background:#6366f1;color:#fff;
                   border:none;border-radius:6px;cursor:pointer;font-size:13px;">
            View
          </button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("loadPrescriptions error:", err);
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center;padding:20px;color:#ef4444;">
          Failed to load prescriptions.
        </td>
      </tr>`;
    showToast("Could not load prescriptions.", "error");
  }
}

function viewPrescription(prescriptionId) {
  window.location.href = `prescription.html?mode=view&id=${encodeURIComponent(prescriptionId)}`;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

function setupLogout() {
  // Support any element with id="logoutBtn" or data-action="logout"
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  document.querySelectorAll("[data-action='logout']").forEach((el) => {
    el.addEventListener("click", logout);
  });
}

// ─── Initialization ───────────────────────────────────────────────────────────

async function init() {
  // Auth guard
  const user = requireAuth();
  if (!user) return;

  const patientId = getPatientId(user);
  if (!patientId) {
    showToast("Could not identify patient. Please log in again.", "error");
    setTimeout(() => { window.location.href = "login.html"; }, 2000);
    return;
  }

  // Populate patient name
  loadPatientName(user);

  // Sidebar
  setupSidebar();

  // Logout
  setupLogout();

  // File upload
  setupFileUpload(patientId);

  // Camera
  setupCamera(patientId);

  // Async loads — run in parallel where safe
  await Promise.allSettled([
    loadDashboard(patientId),
    loadDocuments(patientId),
    loadPrescriptions(patientId),
  ]);
}

document.addEventListener("DOMContentLoaded", init);



// const doctorId =
//     (user &&
//     (
//         user.doctor_id ||
//         (user.data &&
//         user.data.doctor_id)
//     )) || "";

