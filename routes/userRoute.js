const express = require("express");
const { GET_ALL_USERS, ME } = require("../controllers/userController");

const router = express.Router();

router.get("", GET_ALL_USERS);
router.get("/me", ME);

module.exports = router;
