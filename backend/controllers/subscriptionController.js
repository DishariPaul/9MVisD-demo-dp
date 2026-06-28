const pool = require("../config/db");

const getSubscription = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await pool.query(
      `
      SELECT
        subscription_id,
        user_id,
        role,
        plan,
        status,
        start_date,
        end_date
      FROM subscriptions
      WHERE user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription fetched successfully",
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

const downloadDocument = async (req, res) => {
  res.json({
    success: true,
    message: "Premium download feature"
  });
}


module.exports = { getSubscription, downloadDocument }

