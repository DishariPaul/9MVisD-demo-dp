const pool = require("../config/db");

const uploadDocument = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      title,
      type,
      uploadedBy,
      notes
    } = req.body || {};

    if (!req.file){
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const fileUrl = req.file.filename;

    if (!patientId || !title || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    console.log(req.file);
    console.log(fileUrl);

    const documentId = "doc" + Date.now();

    console.log([
      documentId,
      patientId,
      doctorId,
      title,
      type,
      fileUrl,
      uploadedBy,
      notes
    ]);

    const result = await pool.query(
      `
      INSERT INTO documents (
        document_id,
        patient_id,
        doctor_id,
        title,
        type,
        file_url,
        uploaded_by,
        upload_date,
        notes
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,NOW(),$8
      )
      RETURNING *
      `,
      [
        documentId,
        patientId,
        doctorId || null,
        title,
        type,
        fileUrl,
        uploadedBy,
        notes
      ]
    );

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


const path = require("path");

const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM documents
      WHERE document_id = $1
      `,
      [documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    const filePath = path.join(
      __dirname,
      "../uploads",
      result.rows[0].file_url
    );

    res.download(filePath);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


const deleteDocument = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM documents
      WHERE document_id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    res.json({
      success: true,
      message: "Document deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

module.exports = { uploadDocument, downloadDocument, deleteDocument };


