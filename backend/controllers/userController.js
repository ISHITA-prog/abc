const db = require("../config/db");
const bcrypt = require("bcrypt");

// GET all users
const getUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// POST /register
const registerUser = async (req, res) => {
  const { email, mobile, password, role, department } = req.body;

  if (!email || !mobile || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check for duplicate email or mobile
    const [existing] = await db.query(
      "SELECT * FROM users WHERE email = ? OR mobile = ?",
      [email, mobile]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email or mobile already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert into DB
    await db.query(
      "INSERT INTO users (email, mobile, password_hash, role, department) VALUES (?, ?, ?, ?, ?)",
      [email, mobile, hashedPassword, role, department || null]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getUsers, registerUser };
