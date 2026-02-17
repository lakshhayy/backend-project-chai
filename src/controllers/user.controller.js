import { asynchandler }  from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
//import { use } from "react";

const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        if(!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateaccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken; // we are storing the refresh token in the user document in the database, so that we can verify it later when the user sends a request to refresh the access token using the refresh token
        await user.save({validateBeforeSave: false}); // we are not validating before save because we are not changing any required field, and we want to avoid any validation error if some required field is missing in the user document

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed", [error.message], error.stack);
    }
}

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
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with given email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(500, "Failed to upload avatar image");
    }
    const user = await User.create({
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

const loginUser = asynchandler (async (req, res) => {
   // req body 
   // username or email and password
   // find the user
   // password check 
   // generate access and refresh token
   //send cookie 

   const {email, username, password} = req.body;
   if(!username && !email) {
    throw new ApiError(400, "Username or email is required");
   }
   if(!password) {
    throw new ApiError(400, "Password is required");
   }
   const user = await User.findOne({
    $or: [{email}, {username}] // if email matches or username matches
   });
   if(!user) {
    throw new ApiError(404, "User not found");
   }
   const isPasswordValid = await user.comparePassword(password); 
   if(!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
   }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id);

   const loggedinUser = await User.findById(user._id).select("-password -refreshToken");

   const options = {
    httpOnly: true,
    secure: true
   };



    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedinUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    );
});

const logoutUser = asynchandler (async (req, res) => {
    const options = {
        httpOnly: true,
        secure: true
    };
    await User.findByIdAndUpdate(
        req.user._id,
        {
            
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true
        }
        
    );
    return res
    .status(200) 
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asynchandler (async (req, res) => {
    const incomingRefreshToken = req.cookies.
    refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized access - refresh token missing");
    }
    
    // verify the incoming refresh token
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.JWT_REFRESH_SECRET,
            
        )
        const user = await User.findById(decodedToken?._id)
        if(!user) {
            throw new ApiError(404, "User not found");
        }
        if(incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Unauthorized access - invalid refresh token");
        } 
    
        const options = {
            httpOnly: true,
            secure: true
        };  
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    newRefreshToken
                },
                "Access token refreshed successfully"
            )
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token"); 
    }
});

const changecurrentUserPassword = asynchandler (async (req, res) => {
    // get current user id from req.user
    // get old password and new password from req.body
    // find the user in the database
    // compare the old password with the password in the database
    // if they match, update the password with the new password
    // save the user document
    // send response
    const{ oldPassword, newPassword} = req.body;
    
    const user = await User.findById(req.user?._id);
    const isPasswordValid = await user.comparePassword(oldPassword);

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid old password");
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});

const getcurrentUserDetails = asynchandler (async (req, res) => {
    // get current user id from req.user
    // find the user in the database
    // send response with user details except password and refresh token
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "User details fetched successfully"
        )
    );
});

const updateAccountDetails = asynchandler (async (req, res) => {
    // get current user id from req.user
    // get updated details from req.body and req.files
    // validate the updated details
    const {fullname, username} = req.body;
    if(!fullname || !username) {
        throw new ApiError(400, "All fields are required");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                username
            }
        },
        {new: true}

    ).select("-password -refreshToken");
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asynchandler (async (req, res) => {
    // get current user id from req.user
    // get avatar image from req.file
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url) {
        throw new ApiError(500, "Failed to upload avatar image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asynchandler (async (req, res) => {
    // get current user id from req.user
    // get cover image from req.file
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url) {
        throw new ApiError(500, "Failed to upload cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});
 
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changecurrentUserPassword,
    getcurrentUserDetails,
    updateAccountDetails,
    updateUserAvatar
};