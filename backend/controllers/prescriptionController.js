const pool = require("../config/db");

// ============================================================================
// SAVE NEW VALUES INTO MASTER TABLES
// ============================================================================

async function updateMasterTable(client, table, column, values) {
    if (!Array.isArray(values)) return;
    for (let value of values) {
        if (!value) continue;
        value = value.trim().replace(/\s+/g, " ");
        await client.query(
            `
            INSERT INTO ${table} (${column})
            VALUES ($1)
            ON CONFLICT DO NOTHING
            `,
            [value]
        );
    }
}


// POST /
const savePrescription = async (req, res) => {
  const {
    patientId,
    doctorId,
    weight,
    height,
    pulse,
    bloodPressure,
    temperature,
    respiratoryRate,
    history,
    illnesses,
    advice,
    followUpDate,
    medicines,
  } = req.body;

  const prescriptionId = "pres" + Date.now();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    
    // Update master tables first
    await updateMasterTable(
        client,
        "history_master",
        "history_name",
        history
    );
    await updateMasterTable(
        client,
        "illness_master",
        "illness_name",
        illnesses
    );
    await updateMasterTable(
        client,
        "advice_master",
        "advice_text",
        advice
    );


    await client.query(
      `INSERT INTO prescriptions (
        prescription_id, patient_id, doctor_id,
        weight, height, pulse, blood_pressure, temperature, respiratory_rate,
        history, illnesses, advice, follow_up_date, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())`,
      [
        prescriptionId,
        patientId,
        doctorId,
        weight || null,
        height || null,
        pulse || null,
        bloodPressure || null,
        temperature || null,
        respiratoryRate || null,
        history || [],
        illnesses || [],
        advice || [],
        followUpDate || null,
      ]
    );

    if (Array.isArray(medicines) && medicines.length > 0) {
      for (const med of medicines) {
        await client.query(
          `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration)
           VALUES ($1,$2,$3,$4,$5)`,
          [
            prescriptionId,
            med.medicine_name || null,
            med.dosage || null,
            med.frequency || null,
            med.duration || null,
          ]
        );
      }
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Prescription saved successfully.",
      prescriptionId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("savePrescription error:", err);
    return res.status(500).json({ success: false, message: "Failed to save prescription.", error: err.message });
  } finally {
    client.release();
  }
};

// PUT /:prescriptionId
const updatePrescription = async (req, res) => {
  const { prescriptionId } = req.params;
  const {
    weight,
    height,
    pulse,
    bloodPressure,
    temperature,
    respiratoryRate,
    history,
    illnesses,
    advice,
    followUpDate,
    medicines,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await updateMasterTable(
        client,
        "history_master",
        "history_name",
        history
    );
    await updateMasterTable(
        client,
        "illness_master",
        "illness_name",
        illnesses
    );
    await updateMasterTable(
        client,
        "advice_master",
        "advice_text",
        advice
    );

    const updateResult = await client.query(
      `UPDATE prescriptions SET
        weight = $1,
        height = $2,
        pulse = $3,
        blood_pressure = $4,
        temperature = $5,
        respiratory_rate = $6,
        history = $7,
        illnesses = $8,
        advice = $9,
        follow_up_date = $10
      WHERE prescription_id = $11`,
      [
        weight || null,
        height || null,
        pulse || null,
        bloodPressure || null,
        temperature || null,
        respiratoryRate || null,
        history || [],
        illnesses || [],
        advice || [],
        followUpDate || null,
        prescriptionId,
      ]
    );

    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Prescription not found." });
    }

    await client.query(`DELETE FROM prescription_items WHERE prescription_id = $1`, [prescriptionId]);

    if (Array.isArray(medicines) && medicines.length > 0) {
      for (const med of medicines) {
        await client.query(
          `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration)
           VALUES ($1,$2,$3,$4,$5)`,
          [
            prescriptionId,
            med.medicine_name || null,
            med.dosage || null,
            med.frequency || null,
            med.duration || null,
          ]
        );
      }
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Prescription updated successfully.",
      prescriptionId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updatePrescription error:", err);
    return res.status(500).json({ success: false, message: "Failed to update prescription.", error: err.message });
  } finally {
    client.release();
  }
};

// GET /patient/:patientId
const getPatientPrescriptions = async (req, res) => {
  const { patientId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
        p.prescription_id,
        p.advice,
        p.created_at,
        d.doctor_name
      FROM prescriptions p
      LEFT JOIN doctors d ON p.doctor_id = d.doctor_id
      WHERE p.patient_id = $1
      ORDER BY p.created_at DESC`,
      [patientId]
    );

    return res.status(200).json({
      success: true,
      prescriptions: result.rows,
    });
  } catch (err) {
    console.error("getPatientPrescriptions error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch prescriptions.", error: err.message });
  }
};

// GET /:prescriptionId
const getPrescriptionById = async (req, res) => {
  const { prescriptionId } = req.params;

  try {
    const prescriptionResult = await pool.query(
      `SELECT * FROM prescriptions WHERE prescription_id = $1`,
      [prescriptionId]
    );

    if (prescriptionResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Prescription not found." });
    }

    const prescription = prescriptionResult.rows[0];

    const medicinesResult = await pool.query(
      `SELECT item_id, medicine_name, dosage, frequency, duration
       FROM prescription_items
       WHERE prescription_id = $1
       ORDER BY item_id ASC`,
      [prescriptionId]
    );

    const patientResult = await pool.query(
      `SELECT patient_id, patient_name, phone_number, age, gender
       FROM patients
       WHERE patient_id = $1`,
      [prescription.patient_id]
    );

    const doctorResult = await pool.query(
      `SELECT doctor_id, doctor_name, phone, specialization
       FROM doctors
       WHERE doctor_id = $1`,
      [prescription.doctor_id]
    );

    return res.status(200).json({
      success: true,
      prescription,
      patient: patientResult.rows[0] || null,
      doctor: doctorResult.rows[0] || null,
      medicines: medicinesResult.rows,
    });
  } catch (err) {
    console.error("getPrescriptionById error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch prescription.", error: err.message });
  }
};

// DELETE /:prescriptionId
const deletePrescription = async (req, res) => {
  const { prescriptionId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM prescriptions WHERE prescription_id = $1`,
      [prescriptionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Prescription not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully.",
      prescriptionId,
    });
  } catch (err) {
    console.error("deletePrescription error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete prescription.", error: err.message });
  }
};

// GET /medicine/search?q=
const searchMedicines = async (req, res) => {
  const q = (req.query.q || "").trim();

  try {
    const result = await pool.query(
      `SELECT medicine_id, medicine_name
       FROM medicine_master
       WHERE medicine_name ILIKE $1
       ORDER BY medicine_name ASC
       LIMIT 20`,
      [`%${q}%`]
    );

    return res.status(200).json({ success: true, results: result.rows });
  } catch (err) {
    console.error("searchMedicines error:", err);
    return res.status(500).json({ success: false, message: "Medicine search failed.", error: err.message });
  }
};

// GET /history/search?q=
const searchHistory = async (req, res) => {
  const q = (req.query.q || "").trim();

  try {
    const result = await pool.query(
      `SELECT history_id, history_name
       FROM history_master
       WHERE history_name ILIKE $1
       ORDER BY history_name ASC
       LIMIT 20`,
      [`%${q}%`]
    );

    return res.status(200).json({ success: true, results: result.rows });
  } catch (err) {
    console.error("searchHistory error:", err);
    return res.status(500).json({ success: false, message: "History search failed.", error: err.message });
  }
};

// GET /illness/search?q=
const searchIllness = async (req, res) => {
  const q = (req.query.q || "").trim();

  try {
    const result = await pool.query(
      `SELECT illness_id AS id, illness_name AS name, 'illness' AS source
       FROM illness_master
       WHERE illness_name ILIKE $1
       UNION
       SELECT symptom_id AS id, symptom_name AS name, 'symptom' AS source
       FROM symptom_master
       WHERE symptom_name ILIKE $1
       ORDER BY name ASC
       LIMIT 20`,
      [`%${q}%`]
    );

    return res.status(200).json({ success: true, results: result.rows });
  } catch (err) {
    console.error("searchIllness error:", err);
    return res.status(500).json({ success: false, message: "Illness search failed.", error: err.message });
  }
};

// GET /advice/search?q=
const searchAdvice = async (req, res) => {
  const q = (req.query.q || "").trim();

  try {
    const result = await pool.query(
      `SELECT advice_id, advice_text
       FROM advice_master
       WHERE advice_text ILIKE $1
       ORDER BY advice_text ASC
       LIMIT 20`,
      [`%${q}%`]
    );

    return res.status(200).json({ success: true, results: result.rows });
  } catch (err) {
    console.error("searchAdvice error:", err);
    return res.status(500).json({ success: false, message: "Advice search failed.", error: err.message });
  }
};

module.exports = {
  savePrescription,
  updatePrescription,
  getPatientPrescriptions,
  getPrescriptionById,
  deletePrescription,
  searchMedicines,
  searchHistory,
  searchIllness,
  searchAdvice,
};
