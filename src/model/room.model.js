import mongoose from "mongoose";


const roomSchema = new mongoose.Schema({
    users: {
        type: [mongoose.Types.ObjectId],
        ref: 'user'
    },
    lastMessage: {
        type: String,
        default: null
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
        // default: ''
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        // require: true
    },
    type: {
        type: String,
        require: true,
        // default: 'msg'
    }
}, {
    timestamps: true
    // timestapms: true
})

const Room = mongoose.model('room', roomSchema);
export default Room;

// mongoose.models