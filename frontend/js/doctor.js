/* =========================================================
   MediVault Doctor Dashboard Module
   File: js/doctor.js
   Description:
   Handles doctor dashboard functionality,
   patient search, record access,
   dashboard loading, sidebar controls,
   and authentication protection.
========================================================= */

"use strict";

/* =============== CONFIGURATION ================================= */
const API_BASE_URL = "http://localhost:5000";
let allPatients = [];


/* ====================== DOM REFERENCES ================================= */
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuToggle = document.getElementById("menuToggle");

const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-section .btn");

/* =================== API METHODS ==================================== */
/* Fetch Doctor-to-Patient Relation */
async function fetchDoctorPatients(doctorId) {
    const response = await fetch(`${API_BASE_URL}/api/doctor/${doctorId}/patients`);
    if (!response.ok) {
        throw new Error("Unable to fetch patients.");
    }
    return await response.json();
}

/* Fetch Patient Details */
async function fetchPatientDocuments(patientId) {
    const response = await fetch(`${API_BASE_URL}/api/doctor/patient/${patientId}/documents`);
    return await response.json();
}
// async function fetchDoctorPatients(doctorId) {
//     const response = await fetch(`${API_BASE_URL}/api/doctor/${doctorId}/patients`);
//     return await response.json();
// }

/* Search Patients - Placeholder endpoint until backend is added. */
function searchPatients(searchTerm) {
    return allPatients.filter(patient => patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()));
}

/* =================== SIDEBAR CONTROLS =================================== */
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
        menuToggle.addEventListener("click", openSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }
}

/* =================== AUTHENTICATION =================================== */
function getCurrentUser() {
    const user = localStorage.getItem("medivault_user");
    return user ? JSON.parse(user) : null;
}

function protectRoute() {
    const user = getCurrentUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }
    if (user.role && user.role !== "doctor") {
        switch (user.role) {
            case "admin":
                window.location.href = "admin.html";
                break;

            case "patient": window.location.href = "patient.html";
                break;

            default:
                window.location.href = "login.html";
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
            localStorage.removeItem("medivault_user");
            window.location.href = "doctor-login.html";
        }
    );
}

/* =========================================================
   UI HELPERS
========================================================= */
function showNotification(message, type = "success") {
    console.log(
        `[${type.toUpperCase()}] ${message}`
    );
}
function showLoading() {
    console.log("Loading...");
}
function hideLoading() {
    console.log("Loading Complete");
}

/* =========================================================
   SEARCH FUNCTIONALITY
========================================================= */
async function handlePatientSearch() {
    const searchTerm = searchInput?.value.trim();

    if (!searchTerm) {
        showNotification("Please enter a search term.", "error");
        return;
    }

    try {
        showLoading();
        const results = await searchPatients(searchTerm);
        renderSearchResults(results);

    } catch (error) {
        console.error(error);
        showNotification(error.message, "error");

    } finally {
        hideLoading();
    }
}

/* Render Search Results - Placeholder for future implementation. */
function renderSearchResults(results) {
    renderPatients(results);
}

// function renderPatients(patients) {
//     const tbody = document.getElementById("patientsTableBody");

//     if (!tbody) return;

//     tbody.innerHTML = "";

//     patients.forEach(
//         patient => {
//             tbody.innerHTML += `
//                 <tr>
//                     <td>
//                         ${patient.patient_name}
//                     </td>
//                     <td>
//                         ${patient.age}
//                     </td>
//                     <td>
//                         ${patient.gender}
//                     </td>
//                     <td>
//                         ${patient.phone_number}
//                     </td>
//                     <td>
//                         <button
//                             class="btn btn-primary"
//                             onclick="
//                             viewDocuments(
//                                 '${patient.patient_id}'
//                             )
//                             "
//                         >
//                             Documents
//                         </button>
//                     </td>
//                 </tr>
//             `;
//         }
//     );
// }

/* ========================= PATIENT RECORD VIEWER ================================= */
async function loadPatientDocuments(patientId) {
    try {
        showLoading();
        const documents = await fetchPatientDocuments(patientId);
        renderPatientDocuments(documents);

    } catch (error) {
        console.error(error);
        showNotification(error.message, "error");
    
    } finally {
        hideLoading();
    }
}

function loadDoctorInfo() {
    const user = getCurrentUser();

    if (!user?.data) return;

    document.getElementById("doctorName").textContent = user.data.doctor_name;
    document.getElementById("doctorSpecialization").textContent = user.data.specialization;
}

async function loadPatients() {
    try {
        const user = getCurrentUser();
        const doctorId = user?.data?.doctor_id;

        if (!doctorId) {
            console.error("Doctor ID not found");
            return;
        }

        const result = await fetchDoctorPatients(doctorId);

        allPatients = result.data;
        renderPatients(result.data);
        updateStatistics(result.data);

    } catch (error) {
        console.error(error);
    }
}


function renderPatients(patients) {
    const table = document.getElementById("patientsTableBody");

    table.innerHTML = "";
    patients.forEach(
        patient => {
            table.innerHTML += `
                <tr>
                    <td>${patient.patient_name}</td>
                    <td>${patient.age}</td>
                    <td>${patient.gender}</td>
                    <td>${patient.phone_number}</td>

                    <td>

                        <button
                            class="btn btn-primary"
                            onclick="
                                viewDocuments('${patient.patient_id}');
                                showPatientDetails('${patient.patient_id}');
                            "
                        >
                            View
                        </button>

                    </td>

                </tr>
            `;
        }
    );
}

function updateStatistics(patients) {
    document.getElementById("totalPatients").textContent = patients.length;
    
    const maleCount = patients.filter(p => p.gender === "Male").length;
    const femaleCount = patients.filter(p => p.gender === "Female").length;
    const averageAge = Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length);

    document.getElementById("malePatients").textContent = maleCount;
    document.getElementById("femalePatients").textContent = femaleCount;
    document.getElementById("averageAge").textContent = averageAge;
}


function renderPatientDetails(patient) {

    document.getElementById("patientDetails").innerHTML = `
        <h4>${patient.patient_name}</h4>
        <p><strong>ID:</strong> ${patient.patient_id}</p>
        <p><strong>Age:</strong> ${patient.age}</p>
        <p><strong>Gender:</strong> ${patient.gender}</p>
        <p><strong>Phone:</strong> ${patient.phone_number}</p>

        <br>

        <button
            class="btn btn-primary"
            onclick="
            location.href=
            'prescription.html?patientId=${patient.patient_id}'
            "
        >
            Write Prescription
        </button>
    `;
}


function renderPatientDocuments(documents) {
    const table = document.getElementById("documentsTableBody");

    table.innerHTML = "";

    documents.forEach(
        doc => {
            table.innerHTML += `
                <tr>
                    <td>${doc.title}</td>
                    <td>${doc.type}</td>
                    <td>
                        ${new Date(
                            doc.upload_date
                        ).toLocaleDateString()}
                    </td>
                    <td>
                        <button
                            class="btn btn-outline"
                            onclick="
                            window.open(
                                '${API_BASE_URL}/api/documents/download/${doc.document_id}'
                            )"
                        >
                            Download
                        </button>
                    </td>
                </tr>
            `;
        }
    );
}


window.viewDocuments = async function (patientId) {
    const result = await fetchPatientDocuments(patientId);
    renderPatientDocuments(result.data);
};
window.showPatientDetails = function(patientId){
    const patient =
        allPatients.find(
            p =>
            p.patient_id === patientId
        );
    if(patient){
        renderPatientDetails(
            patient
        );
    }
};


/* ============== DASHBOARD INITIALIZATION ====================================== */
function initializeDashboard() {
    console.log(
        "Doctor Dashboard Initialized"
    );
}

/* =============== EVENT LISTENERS ===================================== */
function initializeEvents() {
    initializeSidebar();
    initializeLogout();
    if (searchButton) {
        searchButton.addEventListener("click", handlePatientSearch);
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    handlePatientSearch();
                }
            }
        );
    }
}

/* ================ APP INITIALIZATION ====================================== */
document.addEventListener(
    "DOMContentLoaded",
    async () => {       //cannot use await inside a normal function, so using async

        protectRoute();
        initializeEvents();
        initializeDashboard();
        loadDoctorInfo();
        await loadPatients();

    }
);




