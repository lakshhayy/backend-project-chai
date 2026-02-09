import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asynchandler(async (req, _ , next) => {
    
    try {
    const token = req.cookies?.accessToken || 
    req.header("Authorization")?.replace("Bearer ", "");

    if(!token) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    const user = await User.findById(decodedToken?._id).
    select("-password -refreshToken");
    if(!user) {
        throw new ApiError(404, "User not found");
    }

    req.user = user; // attach the user object to the request for use in subsequent middleware or route handlers
    next(); // pass control to the next middleware or route handler
    }

    catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});