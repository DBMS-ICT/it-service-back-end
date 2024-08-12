import { tryCatch } from "../utils/tryCatch.js";
import CustomError from "../CustomError.js";
import Repair from "../models/repair.model.js";
import mongoose from "mongoose";

///------------- get all data --------------//
export const getData = tryCatch(async (req, res) => {
  const data = await Repair.find().sort({ createdAt: -1 });
  if (!data) {
    throw new CustomError("no-data", 404, "5000");
  }
  res.status(200).json({ status: "success", data: data });
});

///------------- add data --------------//
export const createData = tryCatch(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new CustomError("required", 400, "4001");
  }
  // check if data exist
  const data = await Repair.findOne({ name });
  if (data) {
    throw new CustomError("exist", 400, "4002");
  }
  const repair = await Repair.create(req.body);
  if (!repair) {
    throw new CustomError("no-created", 404, "5000");
  }
  res.status(200).json({ status: "success" });
});

///------------- delete data --------------//
export const deleteData = tryCatch(async (req, res) => {
  const { id } = req.body;
  const data = await Repair.findByIdAndDelete({
    _id: new mongoose.Types.ObjectId(id),
  });

  if (!data) {
    const error = new CustomError("no-found", 404, "5000");
    res.json(error);
    return;
  }
  res.status(200).json({ status: "success" });
});
