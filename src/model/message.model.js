import mongoose from "mongoose";
import { TypeMessage } from "../services/message.js";


const messageSchema = new mongoose.Schema({
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'room',
        require: true
    },
    message: {
        type: String,
        require: true,
    },
    image: {
        type: String,
        default: null
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isReaded: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: TypeMessage.message
    },
    post_id: {
        type: mongoose.Types.ObjectId,
        ref: 'post',
        default: null
    },
    order_id: {
        type: mongoose.Types.ObjectId,
        ref: 'order',
        default: null
    }

}, {
    timestamps: true
})

const Message = mongoose.model('message', messageSchema);
export default Message;