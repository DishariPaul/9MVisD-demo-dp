/* =========================================================
   MediVault Admin Dashboard Module
   File: js/admin.js
   Description:
   Handles admin dashboard data loading,
   doctors/patients management,
   analytics rendering,
   sidebar interactions,
   and API communication.
========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = "http://localhost:5000";

/* =========================================================
   DOM REFERENCES
========================================================= */

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuToggle = document.getElementById("menuToggle");

/* =========================================================
   API METHODS
========================================================= */

/**
 * Fetch Dashboard Statistics
 */
async function fetchDashboardData() {

    const response = await fetch(
        `${API_BASE_URL}/api/admin/dashboard`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch dashboard data."
        );
    }

    return await response.json();
}

/**
 * Fetch Doctors List
 */
async function fetchDoctors() {

    const response = await fetch(
        `${API_BASE_URL}/api/admin/doctors`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch doctors."
        );
    }

    return await response.json();
}

/**
 * Fetch Patients List
 */
async function fetchPatients() {

    const response = await fetch(
        `${API_BASE_URL}/api/admin/patients`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch patients."
        );
    }

    return await response.json();
}

/* =========================================================
   SIDEBAR CONTROLS
========================================================= */

function openSidebar() {

    if (!sidebar) return;

    sidebar.classList.add("active");

    if (sidebarOverlay) {
        sidebarOverlay.classList.add("active");
    }
}

function closeSidebar() {

    if (!sidebar) return;

    sidebar.classList.remove("active");

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("active");
    }
}

function initializeSidebar() {

    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            openSidebar
        );

    }

    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }
}

/* =========================================================
   UI HELPERS
========================================================= */

function showNotification(
    message,
    type = "success"
) {

    console.log(
        `[${type.toUpperCase()}] ${message}`
    );

}

/**
 * Generic Loading State
 */
function showLoading() {

    console.log("Loading...");
}

function hideLoading() {

    console.log("Loading Complete");
}

/* =========================================================
   DASHBOARD RENDERING
========================================================= */
function renderDashboardStats(data) {
    document.getElementById(
        "totalDoctors"
    ).textContent =
        data.data.totalDoctors;

    document.getElementById(
        "totalPatients"
    ).textContent =
        data.data.totalPatients;

    document.getElementById(
        "totalDocuments"
    ).textContent =
        data.data.totalDocuments;

    document.getElementById(
        "premiumUsers"
    ).textContent =
        data.data.premiumUsers;
}

/* Render Doctors Data */
function renderDoctors(doctors) {

    const table =
        document.getElementById(
            "doctorsTableBody"
        );

    table.innerHTML = "";

    doctors.data.forEach(
        doctor => {

            table.innerHTML += `
                <tr>
                    <td>${doctor.doctor_name}</td>
                    <td>${doctor.specialization}</td>
                    <td>${doctor.phone}</td>
                </tr>
            `;
        }
    );
}

/* Render Patients Data */
function renderPatients(patients) {

    const table =
        document.getElementById(
            "patientsTableBody"
        );

    table.innerHTML = "";

    patients.data.forEach(
        patient => {

            table.innerHTML += `
                <tr>
                    <td>${patient.patient_name}</td>
                    <td>${patient.patient_id}</td>
                    <td>${patient.phone_number}</td>
                    <td>${patient.gender}</td>
                </tr>
            `;
        }
    );
}

/* =========================================================
   DASHBOARD DATA LOADING
========================================================= */

async function loadDashboard() {

    try {

        showLoading();

        const dashboardData =
            await fetchDashboardData();

        renderDashboardStats(
            dashboardData
        );

    } catch (error) {

        console.error(error);

        showNotification(
            error.message,
            "error"
        );

    } finally {

        hideLoading();

    }
}

async function loadDoctors() {

    try {

        const doctors =
            await fetchDoctors();

        renderDoctors(
            doctors
        );

    } catch (error) {

        console.error(error);

    }
}

async function loadPatients() {

    try {

        const patients =
            await fetchPatients();

        renderPatients(
            patients
        );

    } catch (error) {

        console.error(error);

    }
}

/* =========================================================
   AUTHENTICATION CHECK
========================================================= */

function getCurrentUser() {

    const user =
        localStorage.getItem(
            "medivault_user"
        );

    if (!user) return null;

    return JSON.parse(user);
}

function protectRoute() {

    const user =
        getCurrentUser();

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }

    if (
        user.role &&
        user.role !== "admin"
    ) {

        switch (user.role) {

            case "doctor":
                window.location.href =
                    "doctor.html";
                break;

            case "patient":
                window.location.href =
                    "patient.html";
                break;

            default:
                window.location.href =
                    "login.html";
        }

    }
}

/* =========================================================
   LOGOUT
========================================================= */

function initializeLogout() {

    const logoutButton =
        document.querySelector(
            ".sidebar-footer .btn"
        );

    if (!logoutButton) return;

    logoutButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            localStorage.removeItem(
                "medivault_user"
            );

            window.location.href =
                "login.html";

        }
    );
}

/* =========================================================
   EVENT LISTENERS
========================================================= */

function initializeEvents() {

    initializeSidebar();

    initializeLogout();
}

/* =========================================================
   APP INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        protectRoute();

        initializeEvents();

        await loadDashboard();

        await loadDoctors();

        await loadPatients();

    }
);

