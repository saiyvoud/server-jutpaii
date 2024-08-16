import mongoose from "mongoose";

const reportPostSchema = new mongoose.Schema({
    // user_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'user',
    //     require: true,
    // },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        require: true,
    },
    report: {
        type: [{
            user_id: {
                type: mongoose.Types.ObjectId,
                ref: 'user'
            },
            description: String
        }],
        default: []
    },
    // description: {
    //     type: String,
    //     require: true,
    // },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
})

const ReportPost = mongoose.model('reportPost', reportPostSchema);
export default ReportPost;