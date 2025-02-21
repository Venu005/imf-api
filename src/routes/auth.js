const router = require("express").Router();
const { register, login, logout } = require("../controllers/auth.controller");

// Register
router.post("/register", register);

// Login (sets cookie)
router.post("/login", login);

// Logout (clears cookie)
router.post("/logout", logout);

module.exports = router;
