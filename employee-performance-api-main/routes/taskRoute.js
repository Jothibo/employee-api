const express = require("express");
const {
  CREATE,
  GET_TASK_BY_ID,
  UPDATE_TASK_BY_ID,
  GET,
} = require("../controllers/taskController");

const router = express.Router();

router.post("/create", CREATE);
router.get("/:id", GET_TASK_BY_ID);
router.put("/:id", UPDATE_TASK_BY_ID);
router.get("", GET);

module.exports = router;
