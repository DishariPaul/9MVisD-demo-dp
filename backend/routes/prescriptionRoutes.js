const express = require("express");
const router = express.Router();

const { savePrescription, updatePrescription, getPatientPrescriptions, getPrescriptionById, deletePrescription, searchMedicines, searchHistory, searchIllness, searchAdvice,} = require("../controllers/prescriptionController");

// Search routes — must be declared BEFORE /:prescriptionId to avoid param conflicts
router.get("/medicine/search", searchMedicines);
router.get("/history/search", searchHistory);
router.get("/illness/search", searchIllness);
router.get("/advice/search", searchAdvice);

// Patient prescriptions
router.get("/patient/:patientId", getPatientPrescriptions);

// CRUD
router.post("/", savePrescription);
router.put("/:prescriptionId", updatePrescription);
router.get("/:prescriptionId", getPrescriptionById);
router.delete("/:prescriptionId", deletePrescription);

module.exports = router;