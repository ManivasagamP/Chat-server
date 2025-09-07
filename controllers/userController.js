import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// Create a new user
export const signUp = async (req, res) => {
    const { email, fullName, password, profilePic, bio } = req.body;

    try {
        //existing user check
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Password hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await User.create({
            email,
            fullName,
            password: hashedPassword,
            profilePic: profilePic,
            bio: bio
        });

        const token = generateToken(newUser._id);

        res.status(201).json({
            success: true,
            userData: newUser,
            token,
            message: "User created successfully"
        });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

// User login
export const Login = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            userData: user,
            token,
            message: "User logged in successfully"
        });

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

//controller to check if user is authenticated
export const checkAuth = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        res.json({ success: true, user: req.user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

//controller to get user profile details
export const updateProfile = async (req, res) => {
    console.log("Update profile request received");
    try {
        const { fullName, profilePic, bio } = req.body;

        const userId = req.user._id;
        let updateFields = { fullName, bio };

        if (profilePic) {
            // Await is required here
            const upload = await cloudinary.uploader.upload(profilePic);
            updateFields.profilePic = upload.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            userData: updatedUser,
            message: "Profile updated successfully"
        });

        console.log("Profile updated successfully:", updatedUser);

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}