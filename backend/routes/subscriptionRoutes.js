const express = require("express");
const router = express.Router();

const { getSubscription } = require("../controllers/subscriptionController");

router.get("/:userId", getSubscription);

module.exports = router;

