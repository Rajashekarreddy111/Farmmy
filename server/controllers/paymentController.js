import Stripe from 'stripe';
import Order from '../models/order.js';
import Product from '../models/Product.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const { items, adress } = req.body;
    if(!items || items.length === 0){
      return res.json({ success:false, message:'No items' });
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

    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      adress,
      amount,
      paymentType: 'ONLINE',
      isPaid: false,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      metadata: { userId: req.user.id, orderId: String(order._id) },
      automatic_payment_methods: { enabled: true }
    });

    return res.json({ success:true, clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (error) {
    return res.json({ success:false, message: error.message });
  }
}

export const confirmOrderPaid = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.json({ success:false, message:'Order not found' });
    order.isPaid = true;
    await order.save();
    return res.json({ success:true });
  } catch (error) {
    return res.json({ success:false, message:error.message });
  }
}


