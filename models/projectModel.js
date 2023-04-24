const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String },
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    duration: { type: Number, required: true },
    hoursTaken: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isCompleted: { type: Boolean, default: false },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
