const mongoose = require("mongoose");
const {
  NotFoundError,
  UnAuthorizedError,
  CustomError,
} = require("../error_handlers/customErrors");
const PROJECT = require("../models/projectModel");
const USER = require("../models/userModel");

const CREATE = async (req, res, next) => {
  try {
    const payload = req.body;
    const user = await USER.findOneByEmail(req.user.email);
    if (user.role === "HR" || user.role === "MANAGER") {
      const existingProject = await PROJECT.findOne({ name: payload.name });
      if (existingProject) {
        return next(
          new CustomError("A project with this name already exists", 403)
        );
      }
      const newProject = await PROJECT.create({
        ...payload,
        createdBy: user.id,
      });
      return res.status(201).json({ success: true, project: newProject });
    } else next(new CustomError("forbidden error", 403));
  } catch (err) {
    console.log("error:", err);
    next(err);
  }
};

const GET = async (req, res, next) => {
  try {
    const user = await USER.findOneByEmail(req.user.email);
    const id = user.id;
    const projectQuery = { isActive: true };
    if (user?.role == "MANAGER") {
      projectQuery.manager = id;
    }
    if (user?.role == "EMPLOYEE") {
      projectQuery.members = id;
    }
    const projects = await PROJECT.find(projectQuery, null, {
      populate: [{ path: "manager", select: "id firstName lastName fullName" }],
    });
    return res.status(200).json({ success: true, projects });
  } catch (err) {
    next(err);
  }
};

const GET_PROJECT_BY_ID = async (req, res, next) => {
  try {
    const id = req.params;
    const ID = mongoose.Types.ObjectId(id);
    const project = await PROJECT.findById(ID, null, {
      populate: [
        { path: "manager", select: "id firstName lastName fullName" },
        { path: "members", select: "id firstName lastName fullName" },
        {
          path: "tasks",
          match: { isActive: true },
          populate: {
            path: "assignee",
            select: "id firstName lastName fullName",
          },
        },
      ],
    });
    return res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

const UPDATE_PROJECT_BY_ID = async (req, res, next) => {
  try {
    const id = req.params;
    const ID = mongoose.Types.ObjectId(id);
    const payload = req.body;
    const user = await USER.findOneByEmail(req.user.email);
    if (user.role === "HR" || user.role === "MANAGER") {
      const existingProject = await PROJECT.findOne({
        _id: { $ne: ID },
        name: payload.name,
      });
      if (existingProject) {
        return next(
          new CustomError("A project with this name already exists", 403)
        );
      }
      const updatedProject = await PROJECT.findByIdAndUpdate(
        ID,
        {
          ...payload,
          updatedBy: user.id,
        },
        {
          new: true,
          populate: [
            { path: "manager", select: "id firstName lastName fullName" },
            { path: "members", select: "id firstName lastName fullName" },
            {
              path: "tasks",
              populate: {
                path: "assignee",
                select: "id firstName lastName fullName",
              },
            },
          ],
        }
      );
      return res.status(200).json({ success: true, project: updatedProject });
    } else next(new CustomError("forbidden error", 403));
  } catch (err) {
    console.log("error:", err);
    next(err);
  }
};

module.exports = {
  CREATE,
  GET,
  GET_PROJECT_BY_ID,
  UPDATE_PROJECT_BY_ID,
};
