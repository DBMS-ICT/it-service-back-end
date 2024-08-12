import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: {
      type: String,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      unique: true,
      required: true,
    },
    phone: { type: String, required: true },
    password: { type: String, required: true, minLength: 8 },
    role: { type: String, enum: ["emp", "admin"], default: "emp" },
    gender: { type: String, enum: ["male", "female"], required: true },
    status: { type: String, default: "active" },
    request: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
      },
    ],
    deletedBy: {
      type: String,
    },
    deletedAt: { type: Date },
    addRoleBy: { type: String },
    updatedRoleAt: { type: Date },
    verifyCode: {type: String, required:false,unique: true, minLength: 100, maxLength: 100,  },
    verifyAt: { type: Date },
  },
  {
    timestamps: true,
  }
);
// hashing password
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
// Check the password when the user input is plain text equal to their password
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
