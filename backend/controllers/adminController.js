const pool = require("../config/db");

const createDoctor = async (req, res) => {
  try {
    const {
      doctor_name,
      phone,
      email,
      specialization,
      hospital,
      subscription_type
    } = req.body;

    const existingDoctor = await pool.query(
      `
      SELECT *
      FROM doctors
      WHERE phone = $1
         OR email = $2
      `,
      [phone, email]
    );

    if (existingDoctor.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this phone or email already exists"
      });
    }

    const doctor_id = "d" + Date.now();

    const result = await pool.query(
      `
      INSERT INTO doctors (
        doctor_id,
        doctor_name,
        phone,
        email,
        specialization,
        hospital,
        subscription_type,
        created_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,NOW()
      )
      RETURNING *
      `,
      [
        doctor_id,
        doctor_name,
        phone,
        email,
        specialization,
        hospital,
        subscription_type
      ]
    );

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
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


const createPatient = async (req, res) => {
  try {
    const {
      patient_name,
      phone_number,
      age,
      gender,
      created_by
    } = req.body;

    const existingPatient = await pool.query(
      `
      SELECT *
      FROM patients
      WHERE phone_number = $1
      `,
      [phone_number]
    );

    if (existingPatient.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Patient already exists"
      });
    }

    const patient_id = "p" + Date.now();

    const result = await pool.query(
      `
      INSERT INTO patients (
        patient_id,
        patient_name,
        phone_number,
        age,
        gender,
        created_by,
        created_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,NOW()
      )
      RETURNING *
      `,
      [
        patient_id,
        patient_name,
        phone_number,
        age,
        gender,
        created_by
      ]
    );

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
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


const getAllDoctors = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        doctor_id,
        doctor_name,
        phone,
        email,
        specialization,
        hospital,
        subscription_type
      FROM doctors
      ORDER BY doctor_name
      `
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


const getAllPatients = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        patient_id,
        patient_name,
        phone_number,
        age,
        gender,
        created_by
      FROM patients
      ORDER BY patient_name
      `
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


const getDashboardStats = async (req, res) => {
  try {

    const doctors = await pool.query(
      "SELECT COUNT(*) FROM doctors"
    );

    const patients = await pool.query(
      "SELECT COUNT(*) FROM patients"
    );

    const documents = await pool.query(
      "SELECT COUNT(*) FROM documents"
    );

    const premiumUsers = await pool.query(
      `
      SELECT COUNT(*)
      FROM subscriptions
      WHERE plan IN ('premium', 'enterprise')
      AND status = 'active'
      `
    );

    res.status(200).json({
      success: true,
      data: {
        totalDoctors: Number(doctors.rows[0].count),
        totalPatients: Number(patients.rows[0].count),
        totalDocuments: Number(documents.rows[0].count),
        premiumUsers: Number(premiumUsers.rows[0].count)
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

module.exports = { createDoctor, createPatient, getAllDoctors, getAllPatients, getDashboardStats };
