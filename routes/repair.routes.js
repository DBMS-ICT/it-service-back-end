import { Router } from "express";
import {
  getData,
  createData,
  deleteData,
} from "../controllers/repair.controller.js";
import { isAdmin } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router
  .route("/")
  .get(getData)
  .post(protect, isAdmin, createData)
  .delete(protect, isAdmin, deleteData);
export default router;
