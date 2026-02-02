import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";

dotenv.config({ path: "./.env" });
connectDB()
.then(() => {
    app.on("error", (error) => {
    console.error("Error in Express app", error);
    throw error;
  });
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
})
.catch((error) => {
  console.error("Error in mongodb connection", error);
});

/*

import express from "express";
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.mongoURL}/${DB_NAME}`);
    console.log("Connected to MongoDB");
    app.on("error", (error) => {
      console.error("Error in Express app", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("Error connecting to the database", error);
  }
})()

*/