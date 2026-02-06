import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import {upload} from "../middlewares/multer.middleware.js";

const userRouter = Router();

userRouter.route("/register").post( 
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "coverImage", maxCount: 5},
    ]),
    registerUser
);

userRouter.route('/register').post(registerUser);
// userRouter.route('/login').post(loginUser);

export default userRouter;
 