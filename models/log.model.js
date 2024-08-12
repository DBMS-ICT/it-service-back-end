import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String },
    table: { type: String },
    column: { type: String },
    dataId: { type: String },
    data: { type: String },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logSchema);
export default Log;
