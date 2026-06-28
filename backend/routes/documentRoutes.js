const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { uploadDocument, downloadDocument, deleteDocument } = require("../controllers/documentController");

router.post(
  "/upload",
  upload.single("document"),
  uploadDocument
);

router.get(
  "/download/:documentId",
  downloadDocument
);

router.delete(
  "/:id",
  deleteDocument
);

module.exports = router;

