const Mongoose = require("mongoose");
const TASK = require("../models/taskModel");
const USER = require("../models/userModel");
const PROJECT = require("../models/projectModel");

const DASHBOARD = async (req, res, next) => {
  try {
    let projects = [];
    let tasks = [];
    let users = [];
    try {
      projects = await PROJECT.find({ isActive: true }, "_id isCompleted");
      tasks = await TASK.find({ isActive: true }, "_id status");
      users = await USER.find(
        { isActive: true, role: { $in: ["EMPLOYEE"] } },
        " _id employeeId firstName lastName fullName"
      );
    } catch (err) {
      console.log("dashboard error: ", err);
    }

    return res.status(200).json({ success: true, projects, tasks, users });
  } catch (error) {
    next(error);
  }
};

const AGG = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log("ID: " + id);
    const result = await TASK.aggregate([
      // Filter by assignee
      {
        $match: {
          assignee: Mongoose.Types.ObjectId(id),
        },
      },
      // Lookup the user information for the assignee
      {
        $lookup: {
          from: "users",
          localField: "assignee",
          foreignField: "_id",
          as: "assignee",
        },
      },
      // Unwind the assignee array to get a single document for each task
      {
        $unwind: "$assignee",
      },

      {
        $project: {
          fullName: {
            $concat: ["$assignee.firstName", " ", "$assignee.lastName"],
          },
          actualTime: 1,
          estimatedTime: 1,
          name: 1,
          status: 1,
          "assignee._id": 1,
        },
      },
      // Calculate the total time taken for all tasks

      {
        $group: {
          _id: "$assignee._id",
          fullName: { $first: "$fullName" },
          totalTimeTaken: {
            $sum: "$actualTime",
          },
          totalEstimatedTime: {
            $sum: "$estimatedTime",
          },
          taskCount: {
            $sum: 1,
          },
          taskStatus: {
            $push: {
              taskId: "$_id",
              name: "$name",
              status: "$status",
            },
          },
          tasksCompletedOnTime: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "Completed"] },
                    { $lte: ["$actualTime", "$estimatedTime"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          tasksNotCompletedOnTime: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $ne: ["$status", "Completed"] },
                    { $gt: ["$actualTime", "$estimatedTime"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      // Calculate the performance metric
      {
        $addFields: {
          performance: {
            $multiply: [
              {
                $divide: ["$totalTimeTaken", "$totalEstimatedTime"],
              },
              100,
            ],
          },
        },
      },
    ]);
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

module.exports = { DASHBOARD, AGG };
