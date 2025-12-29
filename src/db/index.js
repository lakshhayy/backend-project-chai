import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.mongoURL}/${DB_NAME}`);
    console.log("Connected to MongoDB", connectionInstance.connection.host);
  } catch (error) {
    console.error("Error connecting to the database", error);
    process.exit(1);
  }
}

export default connectDB;