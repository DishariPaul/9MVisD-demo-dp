const pool = require("../config/db");

const loginPatient = async (req, res) => {
  try {
    const { phoneNumber, patientName } = req.body || {};

    if (!phoneNumber || !patientName){
        return res.status(400).json({
            success: false, 
            message: "Phone number and Patient's name are required"
        });
    }

    // console.log("Patient Login Attempt:");
    // console.log("Patient Name:", patientName);
    // console.log("Phone Number:", phoneNumber);

    const result = await pool.query(
      `
      SELECT
          patient_id,
          patient_name,
          phone_number
      FROM patients 
      WHERE phone_number = $1
      AND patient_name = $2
      `,
      [phoneNumber, patientName]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid phone number or patient's name"
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result.rows[0],
      timestamp: new Date()
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

const loginDoctor = async (req, res) => {

    try {

        const {
            doctorName,
            phone
        } = req.body || {};

        if (!doctorName || !phone) {

            return res.status(400).json({
                success:false,
                message:"Doctor name and phone required"
            });

        }

        const result = await pool.query(
            `
            SELECT *
            FROM doctors
            WHERE doctor_name = $1
            AND phone = $2
            `,
            [doctorName, phone]
        );

        if(result.rows.length === 0){

            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            });

        }

        res.status(200).json({
            success:true,
            role:"doctor",
            data:result.rows[0]
        });

    } catch(error){

        console.error(error);

        res.status(500).json({
            success:false,
            message:"Server Error"
        });

    }
};



module.exports = { loginPatient, loginDoctor }


