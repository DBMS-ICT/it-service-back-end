import express from "express";
import morgan from "morgan";
import path from "path";
import cors from "cors";
import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
import userRout from "./routes/user.routes.js";
import requestRout from "./routes/request.routes.js";
import directoryRoute from "./routes/directory.routes.js";
import repairRouter from "./routes/repair.routes.js";
import "./strategy/auth.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import {
  trimBodyMiddleware,
  trimQueryMiddleware,
} from "./middleware/trimQuery.middleware.js";
import {
  xssBodyMiddleware,
  xssQueryMiddleware,
  xssParamsMiddleware,
} from "./middleware/xss.middleware.js";
dotenv.config();
connectDb();
const app = express();
app.use(express.json());
// app.use(helmet());
// const corsOptions = {
//   origin: ["http://192.168.43.159:5173", "http://localhost:5173"],
//   methods: "GET,POST,PATCH,PUT",
// };
// app.use(cors(corsOptions));
app.use(cors({}));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(xssQueryMiddleware, xssParamsMiddleware, xssBodyMiddleware);
app.use(trimQueryMiddleware);
app.use("/api/user", userRout);
app.use("/api/request", requestRout);
app.use("/api/directory", directoryRoute);
app.use("/api/repair", repairRouter);

app.use(errorHandler);

const __dirname = path.resolve();
app.use("/csvfile", express.static(path.join(__dirname, "csvfile")));
export default app;
