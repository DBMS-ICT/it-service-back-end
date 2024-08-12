import mongoose from "mongoose";

const directorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String },
    phone: { type: String },
  },
  {
    timestamps: true,
  }
);

const Directory = mongoose.model("Directory", directorySchema);
export default Directory;
