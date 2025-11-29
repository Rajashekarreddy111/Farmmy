import Adress from "../models/Adress.js";


export const addAdress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { adress } = req.body;
        if (!userId || !adress) {
            return res.json({sucess:false, message: "Missing fields"});
        }
        await Adress.create({ ...adress, userId})
        return res.json({sucess:true, message: "Adress added successfully"})
    } catch (error) {
        return res.json({sucess:false, message: error.message})
    }
}

export const getAdress = async (req, res) => {
        try {
            const userId = req.user?.id;
            const adresses = await Adress.find({userId})
            return res.json({sucess:true, adresses})
        } catch (error) {
           return res.json({sucess:false, message: error.message}) 
        }
}