"use strict";

/* =========================================================
   CONFIG
========================================================= */

const API_BASE_URL = "http://localhost:5000";

/* =========================================================
   DOM ELEMENTS
========================================================= */

const form =
    document.getElementById("doctorLoginForm");

const doctorNameInput =
    document.getElementById("doctorName");

const phoneInput =
    document.getElementById("phone");

const errorMessage =
    document.getElementById("errorMessage");

const loginText =
    document.getElementById("loginText");

const loadingSpinner =
    document.getElementById("loadingSpinner");

/* =========================================================
   UI HELPERS
========================================================= */

function showError(message) {

    if (!errorMessage) return;

    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}

function hideError() {

    if (!errorMessage) return;

    errorMessage.style.display = "none";
}

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

/* =========================================================
   API CALL
========================================================= */

async function loginDoctor(
    doctorName,
    phone
) {

    console.log("Attempting Doctor Login...");
    console.log("Doctor Name:", doctorName);
    console.log("Phone:", phone);

    const response = await fetch(
        `${API_BASE_URL}/api/auth/doctor-login`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                doctorName,
                phone
            })
        }
    );

    const data =
        await response.json();

    console.log(
        "Backend Response:",
        data
    );

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Login failed"
        );

    }

    return data;
}

/* =========================================================
   LOGIN HANDLER
========================================================= */

async function handleLogin(
    event
) {

    event.preventDefault();

    hideError();

    const doctorName =
        doctorNameInput?.value.trim();

    const phone =
        phoneInput?.value.trim();

    if (!doctorName || !phone) {

        showError(
            "Doctor name and phone number are required."
        );

        return;
    }

    try {

        setLoading(true);

        const result =
            await loginDoctor(
                doctorName,
                phone
            );

        console.log(
            "Login Success:",
            result
        );

        localStorage.setItem(
            "medivault_user",
            JSON.stringify(result)
        );

        window.location.href =
            "doctor.html";

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        showError(
            error.message ||
            "Unable to login"
        );

    } finally {

        setLoading(false);

    }
}

/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!form) {

            console.error(
                "doctorLoginForm not found"
            );

            return;
        }

        form.addEventListener(
            "submit",
            handleLogin
        );

    }
);


