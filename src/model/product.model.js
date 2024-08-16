import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        // require: true,
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
    },
    name: {
        type: String,
        require: true,
    },
    content: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        require: true,
    },
    image: {
        type: Array,
        default: '',
        // require: true
    },
    description: {
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

const Product = mongoose.model('product', productSchema);
Product.createIndexes({comment: 'text'})
export default Product;

