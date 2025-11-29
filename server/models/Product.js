import mongoose from 'mongoose';


const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: Array,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    offerPrice: {
        type: Number,
        required: true
    },

    image:{
        type: Array,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    instock: {
        type: Boolean,
        default: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seller',
        required: true
    },

},{timestamps: true});

const Product = mongoose.models.product || mongoose.model('product', ProductSchema);

export default Product;

