import mongoose from 'mongoose';

const messageSchmea = new mongoose.Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image:{
        type: String,
        required: true
    },
    seen:{
        type: Boolean,
        default: false
    }

},
{
    timestamps: true
});

const Message = mongoose.model("Message", messageSchmea);
export default Message;