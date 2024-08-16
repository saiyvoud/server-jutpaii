import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true,
    },
    bankName: {
        type: String,
        require: true,
    },
    accountName: {
        type: String,
        require: true,
    },
    accountNo: {
        type: String,
        require: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
},{
    timestamps: true
})

const Bank = mongoose.model('bank', bankSchema);
export default Bank; 