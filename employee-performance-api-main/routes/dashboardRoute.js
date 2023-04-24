const express = require("express");
const { DASHBOARD, AGG } = require("../controllers/dashboardController");

const router = express.Router();

router.get("", DASHBOARD);
router.get("/:id", AGG);

module.exports = router;
