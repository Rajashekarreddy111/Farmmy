import mongoose from "mongoose";

const OrderSchema =new mongoose.Schema({

    userId:{type:String, required:true, ref:'userModel'},
    items:[{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
        quantity:{type:Number, required:true},
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'seller', required: true }
    }],
    adress:{ type: mongoose.Schema.Types.ObjectId, ref:'adress', required:true },
    amount:{type:Number, required:true},
    status:{type:String, default:"Order Placed"},
    paymentType:{type:String, required:true},
    isPaid:{type:Boolean, default:false,required:true},

},{timestamps:true});

const Order= mongoose.models.order ||mongoose.model("order",OrderSchema);

export default Order;