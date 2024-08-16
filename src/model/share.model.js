import mongoose from "mongoose";

const shareSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
    post_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        require: true
    },
    statusShare: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
})

const Share = mongoose.model('share', shareSchema);
export default Share;