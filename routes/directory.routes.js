import { Router } from "express";
import {
  createDirectory,
  getData,
  deleteData,
  getOneData,
  updateData,
  getAllData,
} from "../controllers/directory.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../controllers/user.controller.js";
const router = Router();
router
  .route("/")
  .post(protect, isAdmin, createDirectory)
  .get(protect, isAdmin, getData)
  .delete(protect, isAdmin, deleteData)
  .patch(protect, isAdmin, updateData);
router.route("/all").get(getAllData);
router.route("/:id").get(protect, isAdmin, getOneData);
export default router;
