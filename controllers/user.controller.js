import { tryCatch } from "../utils/tryCatch.js";
import CustomError from "../CustomError.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { transporter } from "../utils/nodemailerConfig.js";

const ObjectId = mongoose.Types.ObjectId;

// Function to generate JWT token
const generateToken = (user) => {
  const body = { sub: user._id, email: user.email };
  const token = jwt.sign({ user: body }, process.env.JWT_SECRET);
  return token;
};

// handle the delete process
export const deleteUser = tryCatch(async (req, res) => {
  const { id } = req.body;
  const admin = await User.findById(req.user.sub);
  if (!admin) {
    const error = new CustomError("no user found", 404, "5000");
    res.json(error);
    return;
  }
  // change status to delete and set id of admin who delete the user
  const user = await User.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { status: "deleted" },
    { deletedBy: admin._id },
    { deletedAt: new Date() }
  );
  if (!user) {
    const error = new CustomError("no user found", 404, "5000");
    res.json(error);
    return;
  }
  res.status(200).json({ status: "success" });
});
//-------------- update role --------------//
export const updateRole = tryCatch(async (req, res) => {
  const { id, role } = req.body;
  const admin = await User.findById(req.user.sub);
  if (!id || !role) {
    throw new CustomError("All fields are required", 400, "4001");
  }
  const user = await User.findByIdAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { role: role } },
    { addRoleBy: admin._id, updatedRoleAt: new Date() }
  );

  if (!user) {
    throw new CustomError("user not found", 404, "5000");
  }
  res.status(200).json({ status: "success" });
});
//-------------- block or unblock --------------//
export const updateStatus = tryCatch(async (req, res) => {
  const { id, status } = req.body;
  const admin = await User.findById(req.user.sub);
  if (!id || !status) {
    throw new CustomError("All fields are required", 400, "4001");
  }
  const user = await User.findByIdAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status: status } },
    { addRoleBy: admin._id, updatedRoleAt: new Date() }
  );
  if (!user) {
    throw new CustomError("user not found", 404, "5000");
  }
  res.status(200).json({ status: "success" });
});
//-------------- accept user --------------//
export const acceptUser = tryCatch(async (req, res) => {
  const { id } = req.body;
  const admin = await User.findById(req.user.sub);
  if (!id) {
    throw new CustomError("All fields are required", 400, "4001");
  }
  const user = await User.findByIdAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status: "active" } },
    { addRoleBy: admin._id, updatedRoleAt: new Date() }
  );
  if (!user) {
    throw new CustomError("user not found", 404, "5000");
  }
  res.status(200).json({ status: "success" });
});
//-------------- Signup --------------//
export const signup = tryCatch(async (req, res) => {
  req.login(req.user, { session: false }, async (error) => {
    if (error) {
      throw new CustomError(error.message, 401, 4001);
    }
    res.status(200).json({ status: "success" });
  });
});

// get users and create pagination
export const getActiveEmployee = tryCatch(async (req, res) => {
  // retrive fullname and _id
  const users = await User.find({ status: "active", role: "emp" }).select(
    "fullname _id"
  );
  if (!users) {
    const error = new CustomError("no user found", 404, "5000");
    res.json(error);
    return;
  }
  res.status(200).json({ status: "success", data: { data: users } });
});
export const getPendingUser = tryCatch(async (req, res) => {
  const { page } = req.query;
  const limit = 20;
  const skip = (page - 1) * limit;
  const countUser = await User.countDocuments({ status: "pending" });
  const users = await User.find({ status: "pending" })
    .skip(skip)
    .limit(limit)
    .select("fullname _id role email phone gender status");
  res
    .status(200)
    .json({ status: "success", data: { data: users, length: countUser } });
});
//-------------- get all users active and block --------------//
export const getAllUsersActiveAndBlock = tryCatch(async (req, res) => {
  const { page } = req.query;
  const limit = 20;
  const skip = (page - 1) * limit;
  const countUser = await User.countDocuments();
  const users = await User.find({
    status: { $in: ["active", "block"] },
  })
    .skip(skip)
    .limit(limit)
    .select("fullname _id role email phone gender status");
  res
    .status(200)
    .json({ status: "success", data: { data: users, length: countUser } });
});
// get current user
export const getCurrentUser = tryCatch(async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) {
    const error = new CustomError("no user found", 404, "5000");
    res.json(error);
    return;
  }
  const sanitizedUser = {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    phone: user.phone,
    role: user.role,
    gender: user.gender,
  };
  res.status(200).json({ status: "success", data: { data: sanitizedUser } });
});

// handle the login process
export const login = tryCatch(async (req, res, next) => {
  passport.authenticate("login", async (err, user) => {
    if (err || !user) {
      const error = new CustomError("no user found", 404, "5000");
      res.json(error);
      return;
    }
    req.login(user, { session: false }, async (error) => {
      if (error) {
        throw new CustomError(error.message, 401, 4001);
      }

      // Create a sanitized user object without sensitive information
      const sanitizedUser = {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        gender: user.gender,
      };

      const token = generateToken(req.user);
      res
        .status(201)
        .json({ status: "success", data: { data: sanitizedUser, token } });
    });
  })(req, res, next);
});

// update user password
export const updatePassword = tryCatch(async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    throw new CustomError("All fields are required", 400, "4001");
  }
  if (newPassword !== confirmNewPassword) {
    throw new CustomError("not match", 200, "4003");
  }

  const user = await User.findById(req.user.sub);
  if (!user) {
    throw new CustomError("no user found", 202, "5001");
  }

  const isValidPassword = await user.isValidPassword(oldPassword);
  if (!isValidPassword) {
    throw new CustomError("invalid", 200, "4002");
  }

  user.password = newPassword;
  const updatedUser = await user.save();

  if (!updatedUser) {
    return res.status(201).json({ status: "failed" });
  }

  return res.status(202).json({ status: "success" });
}); // update user password forget
export const updatePasswordForget = tryCatch(async (req, res) => {
  const { code, newPassword, confirmNewPassword } = req.body;

  if (!code || !newPassword || !confirmNewPassword) {
    throw new CustomError("required", 200, "4001");
  }
  if (newPassword !== confirmNewPassword) {
    throw new CustomError("not-match", 200, "4003");
  }

  // find user with verify code
  const user = await User.findOne({ verifyCode: code });
  if (!user) {
    throw new CustomError("100", 400, "5001");
  }
  // check if the code is expired
  if (user.verifyAt < Date.now()) {
    throw new CustomError("100", 400, "5001");
  }
  // update verifyAt to now
  else {
    user.verifyAt = Date.now();
    await user.save();
  }
  // update password
  user.password = newPassword;
  const updatedUser = await user.save();
  if (!updatedUser) {
    return res.status(201).json({ status: "failed" });
  }

  return res.status(202).json({ status: "success" });
});

// update user information
export const updateUser = tryCatch(async (req, res) => {
  const { fullname, email, phone, gender } = req.body;
  const { _id } = await User.findById(req.user.sub);
  if (!_id) {
    throw new CustomError("no user found", 202, "5001");
  }
  isValidEmailFormat(req.body.email);

  if (!email || !fullname || !phone || !gender) {
    throw new CustomError("required", 400, "4001");
  }
  // check email exists of another userconst
  const checkEmail = await User.findOne({
    _id: { $ne: _id },
    email: req.body.email,
  });

  if (checkEmail) {
    throw new CustomError("exist", 201, "4002");
  }

  const user = await User.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(_id) },
    { $set: { email: email, fullname: fullname, phone: phone, gender: gender } }
  );

  // Create a sanitized user object without sensitive information
  const sanitizedUser = {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    phone: user.phone,
    role: user.role,
    gender: user.gender,
  };
  res.json({ status: "success", data: { data: sanitizedUser } });
});
// update user
export const updateUserByAdmin = tryCatch(async (req, res) => {
  const { _id, fullname, email, role } = req.body;
  if (!_id || !fullname || !email || !role) {
    throw new CustomError("All fields are required", 400, "4001");
  }
  isValidEmailFormat(req.body.email);
  // check email exists of another userconst
  const checkEmail = await User.findOne({
    _id: { $ne: _id },
    email: req.body.email,
  });
  if (checkEmail) {
    throw new CustomError("dublicate", 201, "4002");
  }
  const user = await User.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(_id) },
    { $set: { fullname: fullname, email: email, role: role } }
  );
  if (!user) {
    throw new CustomError("no user found", 404, "5000");
  }
  res.json({ status: "success" });
});
// get user byid
export const getUserById = tryCatch(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new CustomError("All fields are required", 400, "4001");
  }
  const user = await User.findById(id);
  if (!user) {
    throw new CustomError("no user found", 404, "5000");
  }
  const sanitizedUser = {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  };
  res.json({ status: "success", data: { data: sanitizedUser } });
});
// check user is admin or not
export const isAdmin = tryCatch(async (req, res, next) => {
  const user = await User.findById(req.user.sub);
  if (user?.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});
export const isEmailExists = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError("email-required", 400, "4001");
  }
  const user = await User.findOne({ email: email });
  if (user?.email === email) {
    res.status(201).json({ status: "exist" });
    return;
  }
  next();
};
export const checkConfirmPassword = async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    res.status(201).json({ status: "password-required" });
    return;
  }
  if (password !== confirmPassword) {
    res.status(201).json({ status: "password-not-match" });
    return;
  }
  next();
};
//----- forget password -------
export const forgetPassword = tryCatch(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError("email-required", 400, "4001");
  }

  const findeDuser = await User.findOne({ email: email });
  if (!findeDuser) {
    throw new CustomError("email-not-found", 404, "4040");
  }
  // update verifyCode and verifyAt
  const updateVerifyCode = await User.findOneAndUpdate(
    { email: email },
    {
      $set: {
        verifyCode: await stringGenerator(100),
        verifyAt: new Date(Date.now() + 600000), // 10 minutes from now
      },
    },
    { new: true }
  );
  if (!updateVerifyCode) {
    throw new CustomError("update-verify-code", 500, "5000");
  }
  // send email
  const sendEmail = await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "گۆڕینی وشەی نهێنی",
    text: `
    کوردی
    ئەم لینکە تەنها یەک جار بەکاردێت و دوای ١٠ خولەک بەسەر دەچێت
    عربی
    يُستخدم هذا الرابط مرة واحدة فقط وينتهي بعد 10 دقائق\n
    English
    This link is only used once and expire after 10 minutes\n

    ${process.env.Frontend_URL}${updateVerifyCode.verifyCode}`,
  });
  if (!sendEmail) {
    throw new CustomError("failed-send-email", 500, "5000");
  }
  res.json({ status: "success" });
});
//----- check vrify code expire -------
export const checkVrifyCodeExpire = tryCatch(async (req, res) => {
  const { code } = req.params;
  if (!code) {
    throw new CustomError("100", 400, "4001");
  }
  const user = await User.findOne({ verifyCode: code });
  if (!user) {
    throw new CustomError("100", 404, "4040");
  }
  // check verifyAt if more than 30 minutes
  if (user.verifyAt < Date.now()) {
    throw new CustomError("100", 404, "4040");
  }
  res.json({ status: "success" });
  return;
});
function isValidEmailFormat(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// function generateRandomString(length) {
const stringGenerator = async (length) => {
  try {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const user = await User.findOne({ verifyCode: result });
    if (user) {
      return stringGenerator(100);
    }
    return result;
  } catch (error) {
    console.log(error);
  }
};
