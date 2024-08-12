import { tryCatch } from "../utils/tryCatch.js";
import CustomError from "../CustomError.js";
import Directory from "../models/directory.mode.js";
import mongoose from "mongoose";
///-------------- get single directory------////
export const getOneData = tryCatch(async (req, res) => {
  const { id } = req.params;

  const data = await Directory.findById(id);
  if (!data) {
    throw new CustomError("no-found", 404, "5000");
  }
  res.status(200).json({ status: "success", data: data });
});
//--------------- get all data -------------------//
export const getAllData = tryCatch(async (req, res) => {
  const data = await Directory.find();
  res.status(200).json({ status: "success", data: data });
});
///------------- get all data with pagination --------------//
export const getData = tryCatch(async (req, res) => {
  const { page } = req.query;
  const limit = 20;
  if (!page || page < 1) {
    page = 1;
  }
  const offset = (page - 1) * limit;
  const count = await Directory.countDocuments();
  const data = await Directory.find()
    .skip(offset)
    .limit(limit)
    .sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: data, length: count });
});

///------------- add data --------------//
export const createDirectory = tryCatch(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new CustomError("required", 400, "4001");
  }
  const data = await Directory.findOne({ name });
  if (data) {
    throw new CustomError("exist", 400, "4002");
  }
  const directory = await Directory.create(req.body);
  if (!directory) {
    throw new CustomError("no-created", 404, "5000");
  }
  res.status(200).json({ status: "success" });
});

///------------- delete data --------------//
export const deleteData = tryCatch(async (req, res) => {
  const { id } = req.body;
  const data = await Directory.findByIdAndDelete({
    _id: new mongoose.Types.ObjectId(id),
  });
  if (!data) {
    const error = new CustomError("no-found", 404, "5000");
    res.json(error);
    return;
  }
  res.status(200).json({ status: "success" });
});

///------------- update data --------------//
export const updateData = tryCatch(async (req, res) => {
  const { id, name, address, phone } = req.body;
  if (!id || !name) {
    throw new CustomError("required", 400, "4001");
  }
  // check if data name exist and id not exist
  const existData = await Directory.findOne({ name, _id: { $ne: id } });

  if (existData) {
    throw new CustomError("exist", 400, "4002");
  }
  const data = await Directory.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { name: name, address: address, phone: phone } }
  );
  if (!data) {
    throw new CustomError("no-found", 404, "5000");
  }
  res.status(200).json({ status: "success" });
});
