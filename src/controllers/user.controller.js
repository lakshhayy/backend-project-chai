import { asynchandler }  from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asynchandler (async (req, res) => {
    //return res.status(200).json({message: "User registered successfully"});
    // get user detais 
    // validate user details - not empty, valid email, password strength
    // check if user already exists
    // check for images , check for avatar
    //cloudinary upload if images present
    //create user in db
    //remove password from response, and refresh token field if any
    //check for user creation 
    //send response

    const {fullname, email, username, password} = req.body;
    console.log(fullname, email, username, password);

    if(
        [fullname, email, username, password].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const existingUser = User.findOne({
        $or: [{email}, {username}]}).then((existingUser) => {
        if(existingUser) {
            throw new ApiError(409, "User with given email or username already exists");
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;
    }); //   check if user already exists
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(500, "Failed to upload avatar image");
    }
    const user = awaitUser.create({
        fullname,
        email,
        password,
        username : username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || null,
    })   
     
    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createduser) {
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(
        201, createduser, "User registered successfully"
    ));
});

export {registerUser};