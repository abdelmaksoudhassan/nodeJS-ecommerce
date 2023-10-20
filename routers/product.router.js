const express = require('express')
const productController = require('../controllers/product.controller')
const authAdmin = require('../middlewares/auth-admin')

const productRouter = express.Router()

productRouter.post('/product',authAdmin,productController.addProduct)
productRouter.get('/product/:id',productController.getProduct)
productRouter.delete('/product/:id',authAdmin,productController.deleteProduct)
productRouter.patch('/product/:id',authAdmin,productController.editProduct)
productRouter.get('/admin-products',authAdmin,productController.getAdminProducts)
productRouter.get('/all-products',productController.getAllProducts)

module.exports = productRouter