import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
    order_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
        require: true
    },
    priceTotal: {
        type: Number,
        require: true
    },
    bill:{
        type: String,
        require: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
})

const Payment = mongoose.model('payment', paymentSchema);
export default Payment;