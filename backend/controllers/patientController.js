const pool = require("../config/db");

const getPatientById = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                patient_id,
                patient_name,
                phone_number,
                age,
                gender
            FROM patients
            WHERE patient_id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.status(200).json({
            success: true,
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
    try{
        const patientId = req.params.id;

        const result = await pool.query(
            `SELECT
                document_id,
                title,
                type,
                upload_date,
                uploaded_by
            FROM documents
            WHERE patient_id = $1
            ORDER BY upload_date DESC
            `,
            [patientId]
        );

        res.status(200).json({
            success: true,
            message: "Documents fetched successfully",
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


const getPatientDashboard = async (req, res) => {
  try {

    const { id } = req.params;

    const documentsResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM documents
      WHERE patient_id = $1
      `,
      [id]
    );

    const doctorsResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM patient_doctors
      WHERE patient_id = $1
      `,
      [id]
    );

    res.json({
      success: true,
      data: {
        totalDocuments:
          Number(
            documentsResult.rows[0].count
          ),

        doctorAccess:
          Number(
            doctorsResult.rows[0].count
          )
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};


const getPatientPrescriptions = async (req,res)=>{
    try{
        const { id } = req.params;

        const result = await pool.query(
                `
                SELECT *
                FROM prescriptions
                WHERE patient_id=$1
                ORDER BY created_at DESC
                `,
                [id]
            );

        res.json({
            success:true,
            data:result.rows
        });

    }catch(error){
        console.error(error);
        res.status(500).json({
            success:false
        });
    }
};

module.exports = {  getPatientById, getPatientDocuments, getPatientDashboard, getPatientPrescriptions};


