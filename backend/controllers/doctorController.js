const pool = require("../config/db");

const getDoctorPatient = async (req, res) => {
    try{
        const doctorId = req.params.id;

        const result = await pool.query(
            `SELECT
                p.patient_id,
                p.patient_name,
                p.phone_number,
                p.age,
                p.gender
            FROM patients p
            JOIN patient_doctors pd
                ON p.patient_id = pd.patient_id
            WHERE pd.doctor_id = $1
            ORDER BY p.patient_name
            `,
            [doctorId]
        );

        res.status(200).json({
            success: true,
            message: "Patients fetched successfully",
            count: result.rows.length,
            data: result.rows
        });
    } catch (error){
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const result = await pool.query(
      `
      DELETE FROM documents
      WHERE document_id = $1
      RETURNING *
      `,
      [documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
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

const getPatientDocuments = async (req, res) => {
    try {

        const { patientId } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM documents
            WHERE patient_id = $1
            ORDER BY upload_date DESC
            `,
            [patientId]
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


module.exports = {  getDoctorPatient, getPatientDocuments ,deleteDocument };
