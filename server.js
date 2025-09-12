import './config.js';
import express from 'express';
import cors from 'cors';
import http from "http";
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from "socket.io";

//HTTP server setup
const app = express();
const server = http.createServer(app);

// ✅ Allowlist origins
const allowedOrigins = [
  "https://chat-client-iota-lac.vercel.app",
  /\.vercel\.app$/ // allow all preview deployments
];

// Socket.io server setup
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"], // ✅ force upgrade
});

//store online users
export const userSocketMap = {};

//socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  //Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("user disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  })
})

// Middleware setup
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server
    if (
      allowedOrigins.some(o =>
        (typeof o === "string" && o === origin) ||
        (o instanceof RegExp && o.test(origin))
      )
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes setup
app.use('/api/status', (req, res) => {
  res.send('Api is Live');
})
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter)

// port
const PORT = process.env.PORT;

async function start() {
  try {
    await connectDB(); // ensure your lib/db.js uses process.env.MONGODB_URI
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
