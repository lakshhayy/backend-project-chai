import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
})); // to enable CORS for all routes
app.use(express.json({ limit: "16kb" })); // to parse JSON request bodies
app.use(express.urlencoded({ extended: true , limit: "16kb"})); // to handle form data
app.use(express.static("public")); // to serve static files from public folder
app.use(cookieParser()); // to parse cookies from request headers

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);


export {app};