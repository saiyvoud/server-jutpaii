import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        require: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
    isSale: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    currency: {
        type: String,
        require: false
    },
    favorites: {
        type: [mongoose.Types.ObjectId],
        ref: 'user',
        required: false,
        default: []
    },
    province: {
        type: String,
        require: false,
        default: ''
    },
    district: {
        type: String,
        require: false,
        default: ''
    },
    village: {
        type: String,
        require: false,
        default: ''
    }
}, {
    timestamps: true
})

const Post = mongoose.model('post', postSchema);
export default Post;