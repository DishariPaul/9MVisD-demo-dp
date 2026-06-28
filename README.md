# 9MVisD – Healthcare Record & Prescription Management System

## Overview

9MVisD is a full-stack healthcare record and prescription management system developed to simplify patient record management, digital prescription generation, and medical document handling.

The application provides dedicated dashboards for doctors and patients while securely managing healthcare records through a PostgreSQL database and RESTful APIs.

This project was built as a full-stack web application using Node.js, Express.js, PostgreSQL, and Vanilla JavaScript.

---

## Features

### Doctor

* Doctor Authentication
* Dashboard
* Search Patients
* Create Prescriptions
* Edit Prescriptions
* Delete Prescriptions
* View Previous Prescriptions
* Print Prescriptions
* Upload Medical Documents
* Download Medical Documents
* Dashboard Statistics

### Patient

* Patient Authentication
* Dashboard
* View Prescriptions
* Upload Medical Records
* Download Documents
* Camera Capture
* Storage Usage Overview

### Prescription System

* Dynamic Medicine Autocomplete
* Medical History Autocomplete
* Illness Autocomplete
* Advice Autocomplete
* Auto-growing Master Tables
* Printable Prescriptions
* Follow-up Scheduling

### Document Management

* Upload Documents
* Download Documents
* Delete Documents
* Secure File Handling using Multer

---

## Technology Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript (ES6)

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### Development Tools

* Visual Studio Code
* PostgreSQL
* pgAdmin
* Postman
* Git
* GitHub

---

## Project Structure

```text
9MVisD
│
├── frontend/
│
├── backend/
│
├── database/
│
├── docs/
│
└── README.md
```

---

## Backend Architecture

```text
Frontend
      │
      ▼
Node.js + Express
      │
REST APIs
      │
      ▼
PostgreSQL Database
```

---

## Major Modules

* Authentication
* Doctor Dashboard
* Patient Dashboard
* Prescription Management
* Medical Document Management
* Master Table Management
* Subscription Management
* REST API Backend

---

## Database Tables

* doctors
* patients
* prescriptions
* prescription_items
* documents
* subscriptions
* medicine_master
* history_master
* illness_master
* advice_master

---

## Future Enhancements

* Cloud Storage Integration
* Appointment Scheduling
* Email Notifications
* Desktop Application
* Microsoft SQL Server Migration
* Analytics Dashboard

---

## Author

**Dishari Paul**

B.Tech Computer Science Engineering

SRM Institute of Science and Technology

---

## License

This project is intended for educational and portfolio purposes.
