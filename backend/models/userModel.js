const db = require("../config/db");

const getAllUsers = async () => {
  const [rows] = await db.query("SELECT * FROM users");
  return rows;
};

module.exports = { getAllUsers };
