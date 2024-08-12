import { Router } from "express";
import {
  addEmployee,
  addRequest,
  deleteRequest,
  getOneRequest,
  updateEmpDesc,
  getAllNewRequest,
  getAllProcessingRequests,
  updateStatus,
  getCompleteRequest,
  updateNumber,
  updateDate,
  convertToCsv,
} from "../controllers/request.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../controllers/user.controller.js";

const router = Router();
router
  .route("/")
  .post(addRequest)
  .put(protect, isAdmin, addEmployee)
  .get(protect, isAdmin, getAllNewRequest)
  .delete(protect, isAdmin, deleteRequest)
  .patch(protect, updateEmpDesc);
router
  .route("/processing")
  .get(protect, getAllProcessingRequests)
  .put(protect, updateStatus)
  .patch(protect, isAdmin, updateNumber);
router
  .route("/complete")
  .get(protect, getCompleteRequest)
  .put(protect, isAdmin, updateDate);
  router.route("/export").post(convertToCsv);
router.route("/:id").get(protect, getOneRequest);
export default router;
