import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.route('/register').get(registerUser);
// userRouter.route('/login').post(loginUser);

export default userRouter;
 