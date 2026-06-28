const express = require("express");
const router = express.Router();

const {loginPatient, loginDoctor} = require("../controllers/authController");

router.post("/login", loginPatient);
router.post("/doctor-login", loginDoctor);

module.exports = router;
