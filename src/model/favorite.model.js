import mongoose from "mongoose";


const favoriteSchema = new mongoose.Schema({
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
    statusfavorite: {
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

const Favorite = mongoose.model('favorite', favoriteSchema);
export default Favorite;