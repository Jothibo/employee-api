const express = require("express");
const router = express.Router();
const {
  CREATE,
  GET,
  GET_PROJECT_BY_ID,
  UPDATE_PROJECT_BY_ID,
} = require("../controllers/projectController");

router.post("/create", CREATE);
router.get("", GET);
router.get("/:id", GET_PROJECT_BY_ID);
router.put("/:id", UPDATE_PROJECT_BY_ID);

module.exports = router;
