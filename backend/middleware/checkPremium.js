const pool = require("../config/db");

const checkPremium = async (req, res, next) => {
  try {

    const userId = req.params.userId;

    const result = await pool.query(
      `
      SELECT *
      FROM subscriptions
      WHERE user_id = $1
      AND status = 'active'
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Premium subscription required"
      });
    }

    const subscription = result.rows[0];

    if (subscription.plan === "free") {
      return res.status(403).json({
        success: false,
        message: "Premium subscription required"
      });
    }

    req.subscription = subscription;

    next();

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

module.exports = checkPremium;

