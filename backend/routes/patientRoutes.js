const express = require("express");
const router = express.Router();

const { getPatientById, getPatientDocuments, getPatientDashboard, getPatientPrescriptions } = require("../controllers/patientController");

router.get("/:id", getPatientById);
router.get("/:id/documents", getPatientDocuments);
router.get("/:id/dashboard", getPatientDashboard);
router.get("/:id/prescriptions", getPatientPrescriptions);

module.exports = router;
