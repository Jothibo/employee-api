const TASK = require("../models/taskModel");
const USER = require("../models/userModel");
const PROJECT = require("../models/projectModel");
const mongoose = require("mongoose");

const CREATE = async (req, res, next) => {
  try {
    const payload = req.body;
    const user = await USER.findOneByEmail(req.user.email);
    const newTask = await TASK.create({
      ...payload,
      createdBy: user.id,
    });
    const projectID = payload.project;
    await PROJECT.findByIdAndUpdate(
      projectID,
      {
        $push: {
          tasks: newTask?.id,
        },
      },
      { new: true }
    );
    return res.status(201).json({ success: true, task: newTask });
  } catch (err) {
    next(err);
  }
};

const GET = async (req, res) => {
  try {
    const user = await USER.findOneByEmail(req.user.email);
    const payload = { isActive: true };
    if (user?.role == "EMPLOYEE") {
      payload.assignee = user?.id;
    }
    const tasks = await TASK.find(payload, null, {
      populate: [
        { path: "assignee", select: "id firstName lastName fullName" },
        { path: "project", select: "id name" },
        { path: "createdBy", select: "id firstName lastName fullName" },
      ],
    });
    return res.status(200).json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

const GET_TASK_BY_ID = async (req, res, next) => {
  try {
    const id = req.params;
    const ID = mongoose.Types.ObjectId(id);
    const task = await TASK.findById(ID, null, {
      populate: [
        { path: "assignee", select: "id firstName lastName fullName" },
        { path: "project", select: "id name" },
        { path: "createdBy", select: "id firstName lastName fullName" },
      ],
    });
    return res.status(200).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

const UPDATE_TASK_BY_ID = async (req, res, next) => {
  try {
    const id = req.params;
    const ID = mongoose.Types.ObjectId(id);
    const payload = req.body;
    const user = await USER.findOneByEmail(req.user.email);
    const updatedTask = await TASK.findByIdAndUpdate(
      ID,
      {
        ...payload,
        updatedBy: user.id,
      },
      {
        new: true,
        populate: [
          { path: "assignee", select: "id firstName lastName fullName" },
          { path: "project", select: "id name" },
          { path: "createdBy", select: "id firstName lastName fullName" },
        ],
      }
    );
    return res.status(201).json({ success: true, task: updatedTask });
  } catch (error) {
    next(error);
  }
};

module.exports = { CREATE, GET_TASK_BY_ID, UPDATE_TASK_BY_ID, GET };
