import mongoose from "mongoose";

//Function to connect to MongoDB
export const connectDB = async() => {
    const db  = await mongoose.connect(process.env.MONGODB_URI).then(() => {
        console.log("MongoDB connected successfully");
    }).catch((error) => {
        console.error("MongoDB connection failed:", error);
        process.exit(1); // Exit the process if connection fails
    });

    return db;
}