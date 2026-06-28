const express = require("express");
const router = express.Router();

const { createDoctor, createPatient, getAllDoctors, getAllPatients, getDashboardStats } = require("../controllers/adminController");

router.post("/create-doctor", createDoctor);
router.post("/create-patient", createPatient);
router.get("/doctors", getAllDoctors);
router.get("/patients", getAllPatients);
router.get("/dashboard", getDashboardStats);


module.exports = router;
