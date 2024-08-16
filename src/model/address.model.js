// import mongoose from "mongoose";
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    province: {
        type: String,
        require: true,
    },
    district: {
        type: String,
        require: true,
    },
    village: {
        type: String,
        require: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
})

const Address = mongoose.model('address', addressSchema);
export default Address;