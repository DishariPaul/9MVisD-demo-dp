const pool = require("./config/db");

async function testDB() {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM doctors"
    );

    console.log("Connected!");
    console.log(result.rows);
  } catch (err) {
    console.error(err);
  }
}

testDB();
