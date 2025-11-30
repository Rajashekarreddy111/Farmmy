import Adress from "../models/Adress.js";


export const addAdress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { adress } = req.body;
        if (!userId) {
            return res.json({success:false, message: "Not authenticated"});
        }
        if (!adress) {
            return res.json({success:false, message: "Address data is required"});
        }
        await Adress.create({ ...adress, userId})
        return res.json({success:true, message: "Address added successfully"})
    } catch (error) {
        return res.json({success:false, message: error.message})
    }
}

export const getAdress = async (req, res) => {
        try {
            const userId = req.user?.id;
            const adresses = await Adress.find({userId})
            return res.json({success:true, adresses})
        } catch (error) {
           return res.json({success:false, message: error.message}) 
        }
}