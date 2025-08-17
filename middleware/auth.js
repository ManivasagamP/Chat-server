import jwt from 'jsonwebtoken';
import User from '../models/user.js';

//middleware for authentication
export const protectRoute = (req, res, next) => {
    try {
        const token = req.headers.token;

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = User.findById(decoded._id).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        res.status(401).json({ success: false, message: "User not found" });
    }
}