import mongoose from "mongoose";

const dataSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const Repair = mongoose.model("Repair", dataSchema);
export default Repair;
