import User from "../models/user.js";
import Message from "../models/message.js";
import cloudinary from "../lib/cloudinary.js";
import { io,userSocketMap } from "../server.js";

//get All users except the logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({
            _id: {$ne: userId}.select("-password")
        });

        //count number of messages for each user
        let unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({
                senderId:user._id,
                receiverId: userId,
                seen: false
            })
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }
        })

        await Promise.all(promises);
        res.status(200).json({success: true, users: filteredUsers, unseenMessages});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Internal Server Error", error:error.message})
    }
}

//Get all messages for selected users
export const getMessages = async(req, res) => {
    try {
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId}
            ]
        });

        await Message.updateMany({
            senderId: selectedUserId,
            receiverId: myId,
        }, {
            seen: true
        })

        res.status(200).json({success: true, messages});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Internal Server Error", error:error.message})
    }
}

//api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;

        await Message.findByIdAndUpdate(id, {seen: true});

        res.status(200).json({success: true, message: "Message marked as seen"});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Internal Server Error", error:error.message});
    }
};

//send message to a user
export const sendMessage = async (req,res) => {
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl = "";
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            image: imageUrl,
            text
        });

        //Emit the new message to the receiver's socket 
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        res.status(201).json({success: true, message: newMessage});
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Internal Server Error", error:error.message} );
    }
}