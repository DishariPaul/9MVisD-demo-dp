/* =========================================================
   MediVault Authentication Module
   File: js/auth.js
========================================================= */
"use strict";


/* ========================= CONFIG ====================================== */
const API_BASE_URL = "http://localhost:5000";


/* ===================== DOM ELEMENTS ================================= */
const loginForm = document.getElementById("loginForm");
const phoneInput = document.getElementById("phoneNumber");
const patientInput = document.getElementById("patientName");
const errorMessage = document.getElementById("errorMessage");
const loginText = document.getElementById("loginText");
const loadingSpinner = document.getElementById("loadingSpinner");


/* =================== ERROR HANDLING ================================ */
function showError(message) {
    if (!errorMessage) return;

    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}

function hideError() {
    if (!errorMessage) return;

    errorMessage.style.display = "none";
}


/* ================ LOADING STATE =================================== */
function setLoading(isLoading) {
    if (!loginText || !loadingSpinner) return;

    if (isLoading) {
        loginText.style.display = "none";
        loadingSpinner.style.display = "inline";
    } else {
        loginText.style.display = "inline";
        loadingSpinner.style.display = "none";

    }
}

/* ========================== LOCAL STORAGE =================================== */
function saveSession(userData) {
    localStorage.setItem(
        "medivault_user",
        JSON.stringify(userData)
    );
}

function getSession() {
    return JSON.parse(
        localStorage.getItem("medivault_user")
    );
}

function clearSession() {
    localStorage.removeItem(
        "medivault_user"
    );
}

/* ======================== VALIDATION ================================= */
function validateForm( phoneNumber, patientName) {
    if (!phoneNumber || !patientName) {
        showError(
            "Phone number and Doctor name are required."
        );
        return false;
    }

    return true;
}

/* ================= LOGIN API =============================== */
async function loginUser( phoneNumber, patientName) {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                phoneNumber,
                patientName
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Login failed"
        );

    }

    return data;
}

/* ==================== ROLE REDIRECTION ============================ */
function redirectByRole(role) {
    switch (role) {
        case "admin":
            window.location.href = "admin.html";
            break;
        case "doctor":
            window.location.href = "doctor.html";
            break;
        case "patient":
            window.location.href = "patient.html";
            break;
        default:
            window.location.href = "patient.html";
    }
}


/* =================== LOGIN HANDLER =============================== */
async function handleLogin(event) {
    event.preventDefault();
    hideError();

    const phoneNumber = phoneInput.value.trim();
    const patientName = patientInput.value.trim();

    if (!validateForm(phoneNumber, patientName)) {return;}

    try {
        setLoading(true);
        const result = await loginUser(phoneNumber, patientName);
        console.log( "Login Success:", result);

        saveSession(result);

        /*
        Backend currently returns:
        {
          success: true,
          patient: {...}
        }
        So until roles are implemented,
        redirect directly to patient dashboard.
        */
        window.location.href = "patient.html";

    } catch (error) {
        console.error(error);
        showError(
            error.message || "Unable to login."
        );

    } finally {setLoading(false);}
}

/* ============== EXISTING SESSION CHECK ======================== */
function checkExistingSession() {
    const user = getSession();
    if (!user) return;

    console.log("Existing Session Found", user);
}

/* ====================== EVENTS ================================ */
function initializeEvents() {
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
}

/* ========================= INIT ================================== */
document.addEventListener("DOMContentLoaded", () => {
        checkExistingSession();
        initializeEvents();
    }
);


