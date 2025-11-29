import userModel from "../models/userModel.js";


export const updateCart = async (req, res) => {
    try {
        const {userId, cartItems} = req.body;

        await userModel.findByIdAndUpdate(userId, { cartItems });
        return res.json({sucess:true, message: "Cart updated successfully"})
        
    } catch (error) {
        return res.json({sucess:false, message: error.message})
    }
}

