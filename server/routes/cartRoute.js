import express from "express";
import { updateCart } from "../controllers/CartController.js";
import userAuth from "../middleware/userAuth.js";


const cartRouter=express.Router();

cartRouter.post("/update",userAuth,updateCart);

export default cartRouter;