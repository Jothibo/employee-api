const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    estimatedTime: { type: Number, required: true },
    actualTime: { type: Number },
    progressLevel: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Can't be less than 0"],
      max: [100, "Can't be higher than 100"],
    },
    status: {
      type: String,
      required: true,
      default: "To Do",
      enum: ["To Do", "Progress", "Review", "Completed"],
    },
    completedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
