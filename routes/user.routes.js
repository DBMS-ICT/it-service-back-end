import { Router } from "express";
import { signUpMiddleware } from "../middleware/auth.middleware.js";
import { uploadSingle, resizeFile } from "../middleware/multer.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  acceptUser,
  checkConfirmPassword,
  checkVrifyCodeExpire,
  deleteUser,
  forgetPassword,
  getActiveEmployee,
  getAllUsersActiveAndBlock,
  getCurrentUser,
  getPendingUser,
  isAdmin,
  isEmailExists,
  login,
  signup,
  updatePassword,
  updatePasswordForget,
  updateRole,
  updateStatus,
  updateUser,
} from "../controllers/user.controller.js";
const router = Router();
// protect, isAdmin,
router
  .route("/")
  .get(protect, getActiveEmployee)
  .delete(protect, isAdmin, deleteUser)
  .put(protect, isAdmin, updateRole)
  .patch(protect, isAdmin, updateStatus);
router.route("/all").get(protect, isAdmin, getAllUsersActiveAndBlock);
router
  .route("/pending")
  .get(protect, isAdmin, getPendingUser)
  .put(protect, isAdmin, acceptUser);

router
  .route("/auth/signup")
  .post(isEmailExists, checkConfirmPassword, signUpMiddleware, signup);
router.route("/auth/signin").post(login);
router
  .route("/current")
  .get(protect, getCurrentUser)
  .put(protect, updateUser)
  .patch(protect, updatePassword);
router
  .route("/auth/forget-password")
  .post(forgetPassword)
  .put(updatePasswordForget);
router.route("/auth/forget-password/:code").get(checkVrifyCodeExpire);
export default router;
