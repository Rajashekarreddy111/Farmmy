import Order from "../models/order.js";
import Product from "../models/Product.js";


export const placeOrderCOD = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { items, adress } = req.body;
        if(!userId || items.length===0 || !adress){
            return res.json({sucess:false, message: "All fields are required"})
        }

        const products = await Promise.all(items.map(item => Product.findById(item.productId)));
        let amount = 0;
        const orderItems = items.map((item, index) => {
            const product = products[index];
            if (!product) return null;
            amount += product.offerPrice * item.quantity;
            return {
                product: product._id,
                quantity: item.quantity,
                seller: product.seller
            };
        }).filter(Boolean);

        amount+=Math.floor(amount*0.02);
        await Order.create({userId, items: orderItems, adress, amount, paymentType: "COD", isPaid: false})
        return res.json({sucess:true, message: "Order placed successfully"})

    } catch (error) {
        return res.json({sucess:false, message: error.message})
    }
}

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.json({sucess:false, message: "Not authenticated"})
        }
        const orders = await Order.find({
            userId,
            $or:[{paymentType: "COD"},{isPaid: true}]
        }).populate("items.product adress").sort({createdAt: -1});
        return res.json({sucess:true, orders})
    } catch (error) {
        return res.json({sucess:false, message: error.message})
    }
}


export const getAllOrders = async (req, res) => {
    try {
        const sellerId = req.seller?.id;
        const orders = await Order.find({
            $or:[{paymentType: "COD"},{isPaid: true}],
            'items.seller': sellerId
        }).populate("items.product adress").sort({createdAt: -1});
        // Keep only items for this seller
        const filtered = orders.map(o => ({
            ...o.toObject(),
            items: o.items.filter(i => String(i.seller) === String(sellerId))
        }));
        return res.json({sucess:true, orders: filtered})
    } catch (error) {
        return res.json({sucess:false, message: error.message})
    }
}