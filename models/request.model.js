import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    dirName: { type: String, required: true },
    dirAddress: { type: String, required: true },
    phone: { type: String, required: true },
    dateVist: { type: Date, required: true },
    problem: { type: String, required: true },
    status: { type: String, default: "pending" },
    empDesc: { type: String },
    empVist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    desc: { type: String },
    date: { type: Date },
    number: { type: String,  },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model("Request", requestSchema);
export default Request;
