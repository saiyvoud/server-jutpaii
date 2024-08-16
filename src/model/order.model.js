import mongoose from "mongoose";
import { OrderStatus } from "../services/message.js";

const orderSchema = new mongoose.Schema({
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'room',
        // require: true,
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        // required: true,
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    status: {
        type: String,
        default: OrderStatus.Await
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    type_payment: {
        type: String,
        require: true
        // default: ''
    },
    name: {
        type: String,
        require: true
    },
    phoneNumber: {
        type: String,
        require: true
    },
    address: {
        province: {
            type: String,
            default: ''
            // require: true
        },
        distict: {
            type: String,
            default: ''
            // require: true
        },
        village: {
            type: String,
            default: ''
            // require: true
        }
    },
    express: {
        type: String,
        default: ''
    },
    seller: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
})

const Order = mongoose.model('order', orderSchema);
export default Order;