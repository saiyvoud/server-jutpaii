import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    entitle: {
        type: String,
        default: ''
    },
    isPublish: {
        type: Boolean,
        default: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
},{
    timestamps: true
})

const Category = mongoose.model('category', categorySchema);
export default Category;