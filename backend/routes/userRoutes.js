const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// New: Registration Route
router.post("/register", userController.registerUser);

// Existing: Fetch users
router.get("/", userController.getUsers);

module.exports = router;
