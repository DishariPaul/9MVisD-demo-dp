const express = require("express");
const router = express.Router();

const checkPremium = require("../middleware/checkPremium");
const { downloadDocument } = require("../controllers/subscriptionController");
const { check } = require("express-validator");

router.get(
    "/download/:userId/:documentId",
    checkPremium,
    downloadDocument
);

module.exports = router;

