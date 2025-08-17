import express from 'express';
import { checkAuth, Login, signUp, updateProfile } from "./../controllers/userController.js"
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", Login);
userRouter.post("/update-profile",protectRoute, updateProfile);
userRouter.get("/check",protectRoute, checkAuth);

export default userRouter;