import { tryCatch } from "../utils/tryCatch.js";
import CustomError from "../CustomError.js";
import Request from "../models/request.model.js";
import mongoose from "mongoose";
import { transporter } from "../utils/nodemailerConfig.js";
import User from "../models/user.model.js";
import exceljs from "exceljs";


///------------- Add Request --------------//
export const addRequest = tryCatch(async (req, res) => {
  const { dirName, dirAddress, phone, dateVist, problem, fullname } = req.body;
  if (!dirName || !dirAddress || !phone || !dateVist || !problem || !fullname) {
    throw new CustomError("required", 400, "4001");
  }
  
  req.body = { ...req.body, status: "pending" };
  
  const request = await Request.create(req.body);
  
  if (!request) {
    throw new CustomError("not-created", 404, "5000");
  }
  res.json({ status: "success" });
});
// ------------- delete request --------------//
export const deleteRequest = tryCatch(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    throw new CustomError("required", 400, "4001");
  }
  // change the status of the request to deleted
  const request = await Request.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    {
      $set: { status: "deleted" },
    }
  );
  res.status(200).json({ status: "success" });
});
///------------- add employee for the request --------------//
export const addEmployee = tryCatch(async (req, res) => {
  const { emp, request, oldemp } = req.body;
  if (!emp || !request) {
    throw new CustomError("All fields are required", 400, "4001");
  }

  // find the user with id
  const user = await User.findById(emp);
  const requestData = await Request.findById(request);

  // check if the user and request exist
  if (!user || !requestData) {
    throw new CustomError("no data found", 404, "5000");
  }
  // delete request id from user request
  if (oldemp) {
    const userUpdated = await User.findById(user._id);
    for (let i = 0; i < userUpdated.request.length; i++) {
      if (userUpdated.request[i].toString() === requestData._id.toString()) {
        await User.findByIdAndUpdate(user._id, {
          $pull: { request: requestData._id },
        });
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: userUpdated.email,
          subject: "هەڵوەشانەوەی داواکاری چاکردنەوە",
          text: "داواکاری چاکردنەوە هەڵوەشایەوە سەردانی ئەژمارەکەت بکە!",
        });
        break;
      }
    }
  }
  // update the request
  const requestUpdated = await Request.findByIdAndUpdate(request, {
    $set: { empVist: user._id },
    status: "processing",
  });
  // looping inside the user are id exite
  let check = false;
  const userUpdated = await User.findById(user._id);
  // console.log(userUpdated.request);
  for (let i = 0; i < userUpdated.request.length; i++) {
    if (userUpdated.request[i].toString() === requestData._id.toString()) {
      // console.log(requestData._id);
      check = true;
      break;
    }
  }
  if (check == false) {
    await User.findByIdAndUpdate(user._id, {
      $push: { request: requestData._id },
    });
  }
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: "داواکاری چاکردنەوە",
    text: `بەڕێوبەرایەتی:${requestData.dirName}\n
    ژمارەی مۆبایل:${requestData.phone}\n
    بەرواری سەردانی کردن:${requestData.dateVist}\n
    `,
  });
  res.status(200).json({ status: "success" });
});
///------------- get all requests --------------//
///------------- get all requests --------------//
export const getAllProcessingRequests = tryCatch(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  let query = {};
  query.status = { $eq: "processing" };

  if (req.query.emp) {
    query.empVist = req.query.emp;
  }
  if (req.query.phone) {
    query.phone = req.query.phone;
  }
  if (req.query.dirName) {
    query.dirName = req.query.dirName;
  }
  const skip = (page - 1) * limit;
  // search with query
  const user = await User.findById(req.user.sub);
  // console.log(user);
  if (user?.role == "admin") {
    const length = await Request.countDocuments(query);
    const requests = await Request.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ dateVist: 1 });
    res.status(200).json({ status: "success", data: requests, length: length });
    return;
  }
  if (user?.role == "emp") {
    query.status = { $eq: "processing" };
    query.empVist = { $eq: user._id };

    const requests = await Request.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ dateVist: 1 });
    res.status(200).json({ status: "success", data: requests });
    return;
  }
  if (!user) {
    const error = new CustomError("no user found", 404, "5000");
    res.json(error);
    return;
  }
});
///------------- get new request --------------//
export const getAllNewRequest = tryCatch(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  let query = {};
  query.status = { $eq: "pending" };

  if (req.query.emp) {
    query.empVist = req.query.emp;
  }
  if (req.query.phone) {
    query.phone = req.query.phone;
  }
  if (req.query.dirName) {
    query.dirName = req.query.dirName;
  }
  const skip = (page - 1) * limit;
  // search with query
  const user = await User.findById(req.user.sub);
  if (!user) {
    const error = new CustomError("no user found", 404, "5000");
    res.json(error);
    return;
  }
  if (user?.role == "admin") {
    // emp vist retrive _id and fullname
    const length = await Request.find(query).count();
    const requests = await Request.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ dateVist: 1 });
    res.status(200).json({ status: "success", data: requests, length: length });
    return;
  }
  if (!user) {
    const error = new CustomError("no user found", 404, "5000");
    res.json(error);
    return;
  }
});

///------------- get one request --------------//
export const getOneRequest = tryCatch(async (req, res) => {
  const { id } = req.params;
  // check if the user and request exist
  if (!id) {
    throw new CustomError("required", 400, "4001");
  }

  // find the user with id
  const user = await User.findById(req.user.sub);
  if (!user) {
    throw new CustomError("user not found", 404, "5000");
  }

  // find the request with id
  if (user?.role == "admin" && user?.status == "active") {
    const request = await Request.findById({
      _id: new mongoose.Types.ObjectId(id),
    }).populate("empVist", "fullname");
    // check if the request exist
    if (!request) {
      throw new CustomError("request not found", 404, "5000");
    }
    res.status(200).json({ status: "success", data: request });
    return;
  }
  //
  if (
    user?.role == "emp" &&
    user?.status == "active" &&
    user?.request.includes(new mongoose.Types.ObjectId(id))
  ) {
    const request = await Request.findById({
      _id: new mongoose.Types.ObjectId(id),
    }).populate("empVist", "fullname");
    // check if the request exist
    if (!request) {
      throw new CustomError("request not found", 404, "5000");
    }
    res.status(200).json({ status: "success", data: request });
    return;
  }
  if (
    user?.role == "emp" &&
    user?.status == "active" &&
    user?.request.includes(new mongoose.Types.ObjectId(id))
  ) {
    const request = await Request.findById({
      _id: new mongoose.Types.ObjectId(id),
    }).populate("empVist", "fullname");
    // check if the request exist
    if (!request) {
      throw new CustomError("request not found", 404, "5000");
    }
    res.status(200).json({ status: "success", data: request });
    return;
  }
});

///------------- update emp desc --------------//
export const updateEmpDesc = tryCatch(async (req, res) => {
  const { id, desc } = req.body;
  if (!id) {
    throw new CustomError("All fields are required", 400, "4001");
  }
  const request = await Request.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { empDesc: desc } }
  );
  if (!request) {
    throw new CustomError("request not found", 404, "5000");
  }
  res.status(200).json({ status: "success" });
});
///------------- update status to complete --------------//
export const updateStatus = tryCatch(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    throw new CustomError("All fields are required", 400, "4001");
  }
  const request = await Request.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { status: "complete" } }
  );
  if (!request) {
    throw new CustomError("request not found", 404, "5000");
  }
  res.status(200).json({ status: "success" });
});
/// ------------- get complete request --------------//
export const getCompleteRequest = tryCatch(async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) {
    const error = new CustomError("no user found", 404, "5000");
    res.json(error);
    return;
  }
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  if (user?.role == "admin") {
    const length = await Request.find({ status: "complete" }).count();
    const requests = await Request.find({
      status: "complete",
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ dateVist: 1 })
      .populate("empVist", "fullname");
    res.status(200).json({ status: "success", data: requests, length: length });
    return;
  }
  if (user?.role == "emp") {
    const requests = await Request.find({
      status: "complete",
      empVist: user._id,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ dateVist: 1 })
      .populate("empVist", "fullname");
    res.status(200).json({ status: "success", data: requests });
    return;
  }
  res.status(200).json({ status: "success" });
});
// ------------- update number request --------------//
export const updateNumber = tryCatch(async (req, res) => {
  const { number, id } = req.body;
  if (!number || !id) {
    throw new CustomError("required", 400, "4001");
  }
  // check if the request exist with number and id not the same
  const request = await Request.findOne({ number: number, _id: { $ne: id } });
  if (request) {
    throw new CustomError("exist", 400, "4000");
  }
  // update number
  const newRequest = await Request.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { number: number } }
  );
  if (!newRequest) {
    throw new CustomError("request not found", 404, "5000");
  }
  res.status(200).json({ status: "success" });
});

// ------------- convert data to csv file and send for download --------------//
// export const convertToCsv = tryCatch(async (req, res) => {

//     // Fetch data from MongoDB
//     const data = await Request.find().lean();

// // Convert data to CSV
// const csv = new ObjectsToCsv(data);
// const csvString = await csv.toString();
// const filePath = 'csvfile/data.csv';

// // Encode the CSV string to UTF-8
// const encodedCsv = iconv.encode(csvString, 'utf8');

// // Write the encoded CSV string to a file
// fs.writeFileSync(filePath, encodedCsv);

// // Send the file for download
// res.download(filePath, 'data.csv', (err) => {
//   if (err) {
//     console.error('Error sending the file for download:', err);
//     res.status(500).send('Error downloading the file');
//   }

//       // Remove the file after sending it
//       // fs.unlinkSync(filePath);
//     });

// });


export const convertToCsv = tryCatch(async (req, res) => {
  const formValue=req.body;
  const requests = await Request.find({
    createdAt: {
      $gte: new Date(formValue.from),
      $lte: new Date(formValue.to)
    }
  }).lean().exec();
  

  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Requests');

  // Define columns
  worksheet.columns = [
    { header: 'ID', key: '_id', width: 15 },
    { header: 'ناویی تەواو', key: 'fullname', width: 15 },
    { header: 'ناویی بەڕێوەبەرایەتی', key: 'dirName', width: 15 },
    { header: 'ناونیشانی بەڕێوەبەرایەتی', key: 'dirAddress', width: 15 },
    { header: 'ژمارەی مۆبایل', key: 'phone', width: 15 },
    { header: 'کاتی سەردانی', key: 'dateVist', width: 15 },
    { header: 'کێشە', key: 'problem', width: 15 },
    { header: 'دۆخ', key: 'status', width: 15 },
    { header: 'تێبینی بەشی داواکار', key: 'desc', width: 15 },
    { header: 'کاتی تۆمارکردن', key: 'createdAt', width: 15 },
    { header: 'کارمەند', key: 'empVist', width: 15 },
    { header: 'تێبینی کارمەندی چاکەرەوە', key: 'empDesc', width: 15 },
    { header: 'ژمارەی کەیس', key: 'number', width: 15 },
    // Add more fields as per your Request model
  ];

  // Set a default font that supports Unicode for the entire worksheet
  worksheet.eachRow((row, rowNumber) => {
    row.font = { name: 'Arial Unicode MS', family: 4 };
  });

  // Add rows
  worksheet.addRows(requests);

  // Generate the file path
  const filePath = `csvfile/${Date.now()}.xlsx`;

  // Write to the file
  await workbook.xlsx.writeFile(filePath);

  // Optionally, you can send a response indicating success
  res.status(200).json({ status: 'success', filePath: filePath });

  // Or you can end the response without sending any data back
  return;
});

// -------------- update date request --------------//
export const updateDate = tryCatch(async (req, res) => {
  const { date, id } = req.body;
  if (!date || !id) {
    throw new CustomError("required", 400, "4001");
  }
  // update date
  const newRequest = await Request.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { date: date } }
  );
  if (!newRequest) {
    throw new CustomError("request not found", 404, "5000");
  }
  res.status(200).json({ status: "success" });
});
