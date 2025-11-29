import express from "express";
import { addAdress, getAdress } from "../controllers/AdressController.js";
import userAuth from "../middleware/userAuth.js";

const adressRouter = express.Router();

adressRouter.post("/add",userAuth,addAdress);
adressRouter.get("/get",userAuth,getAdress);


export default adressRouter;