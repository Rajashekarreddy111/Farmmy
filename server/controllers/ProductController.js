import {v2 as cloudinary} from 'cloudinary';
import Product from '../models/Product.js';


export const addProduct = async(req, res) => {

    try {
        let productData=JSON.parse(req.body.productData)

        const images=req.files
 
        let imagesUrl= await Promise.all(
            images.map( async (item) => {
                let result= await cloudinary.uploader.upload(item.path, {
                    resource_type: "image"});
                return result.secure_url
            })
        )

        await Product.create({
            ...productData,
            image: imagesUrl,
            seller: req.seller.id
        })

        return res.json({sucess:true, message: "Product added successfully"})
    } catch (error) {
        return res.json({sucess:false, message: error.message})
    }
}


export const productList = async(req, res) => {
    try {
        const { sellerId, category } = req.query;
        const filter = {};
        if (sellerId) filter.seller = sellerId;
        if (category) filter.category = category;
        const products=await Product.find(filter)
        return res.json({sucess:true, products})
    } catch (error) {
        return res.json({sucess:false, message: error.message})
    }
}


export const productById = async(req, res) => {
    try {
        const {id} =req.body;
        const product=await Product.findById(id);
        return res.json({sucess:true, product})
    } catch (error) {
        return res.json({sucess:false, message: error.message})
    }
}


export const changeStock = async(req, res) => {
    try {
        const {id,instock} =req.body;
        const product = await Product.findOne({_id: id, seller: req.seller.id});
        if(!product){
            return res.json({sucess:false, message: "Not authorized"})
        }
        await Product.findByIdAndUpdate(id, {instock})
        return res.json({sucess:true, message: "Stock changed successfully"})
    } catch (error) {
        return res.json({sucess:false, message: error.message})
    }
}

export const myProducts = async (req, res) => {
    try {
        const sellerId = req.seller?.id;
        if (!sellerId) return res.json({sucess:false, message:'Not authenticated'});
        const products = await Product.find({ seller: sellerId }).sort({createdAt:-1});
        return res.json({sucess:true, products});
    } catch (error) {
        return res.json({sucess:false, message:error.message});
    }
}