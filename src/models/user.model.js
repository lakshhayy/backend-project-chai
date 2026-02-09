import mongoose , {Schema}from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//import { use } from "react";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index : true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index : true,
    },
    avatar: {
        type: String,
        default: null,
        required: true,
    },
    coverimage: {
        type: String,
    },
    password: {
        type: String,
        required: [ true, "Password is required" ],
    },
    watchhistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    }],
    refreshToken: { 
        type: String,
    }},
    { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateaccessToken = function () {
    const payload = {
        _id: this._id,
        username: this.username,
    };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
}
userSchema.methods.generateRefreshToken = function () {
    const payload = {
        _id: this._id,
        username: this.username,
    };
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
}

const User = mongoose.model("User", userSchema);
export   {User};
