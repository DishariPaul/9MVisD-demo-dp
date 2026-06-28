const express = require("express");
const router = express.Router();

const { getDoctorPatient, getPatientDocuments, deleteDocument } = require("../controllers/doctorController");

router.get("/:id/patients", getDoctorPatient);
router.get("/patient/:patientId/documents", getPatientDocuments);

const checkPremium = require("../middleware/checkPremium");
router.delete("/document/:userId/:documentId", checkPremium, deleteDocument);

module.exports = router;
  

