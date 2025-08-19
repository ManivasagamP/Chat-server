import express from 'express';
import env from 'dotenv';
import cors from 'cors';
import http from "http";
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';

env.config();

//HTTP server setup
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes setup
app.use('/api/status',(req, res)=> {
    res.send('Server is running' );
})
app.use("/api/auth",userRouter);
app.use("/api/messages", messageRouter)

// Connect to MongoDB
await connectDB();

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});