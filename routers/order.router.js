const express = require('express')
const authUser = require('../middlewares/auth-user')
const authAdmin = require('../middlewares/auth-admin')
const order = require('../controllers/order.controller')

const orderRouter= express.Router()

orderRouter.post('/order',authUser,order.makeOrder)
orderRouter.get('/my-orders',authUser,order.myOrders)
orderRouter.get('/all-orders',order.getOrders)
orderRouter.delete('/order/:id',authAdmin,order.removeOrder)
orderRouter.delete('/all-orders',authAdmin,order.removeAllOrders)

module.exports = orderRouter