import express from 'express';
import AuthSeller from '../middleware/AuthSeller.js';
import { addProduct, changeStock, productById, productList, myProducts } from '../controllers/ProductController.js';
import {upload }from '../configs/multer.js';

const productRouter = express.Router();

productRouter.post('/add', upload.array('images'), AuthSeller, addProduct);
productRouter.get('/list',productList);
productRouter.get('/id',productById);
productRouter.post('/stock',AuthSeller,changeStock);
productRouter.get('/mine',AuthSeller,myProducts);

export default productRouter; 