const _ = require('lodash')
const Order = require('../database/models/order.model')
const {isValidObjectId} = require('mongoose')
const io = require('../socket-io/socket')

const makeOrder = async (req,res,next)=>{
    const user = req.user
    if(_.isEmpty(user.cart)){
        return res.status(400).json({
            message: 'empty cart'
        })
    }
    try{
        const order = await Order.addOrder(user)
        res.json(order)
        io.getIO().emit('newOrder',order)
        next()
    }catch(e){
        console.log(e)
        res.status(500).json(e)
    }
}

const getOrders = async (req,res,next) =>{
    const page = +req.query.page
    const limit = +req.query.count
    try{
        const total = await Order.count()
        const orders = await Order.find().populate('userId').populate('products.productId').limit(limit).skip((page-1)*limit)
        res.json({
            orders,
            currentPage:page,
            hasNextPage: limit*page<total,
            hasPreviousPage: page>1,
            nextPage: ((total/(limit*page) >1) ? page+1 : null),
            previousPage: (page>1 ? page-1 : null ),
            lastPage:Math.ceil(total/limit),
            total
        })
        next()
    }catch(err){
        res.status(500).json(err)
    }
}

const myOrders = async (req,res,next) =>{
    const {_id} = req.user
    try{
        const orders = await Order.find({userId:_id}).sort({createdAt: -1}).populate('products.productId')
        res.send(orders)
        next()
    }catch(err){
        res.status(500).json(err)
    }
}

const removeOrder = async (req,res,next)=>{
    const {id} = req.params
    if(!isValidObjectId(id)){
        return res.status(400).json({
            message: 'invalid order id'
        })
    }
    try{
        const deleted = await Order.findOneAndDelete({_id:id})
        if(! deleted){
            return res.status(404).json({
                message: `order with id ${id} not found`
            })
        }
        res.json(deleted)
        io.getIO().emit('removeOrder',id)
        next()
    }catch(err){
        res.status(500).json(err)
    }
}

const removeAllOrders = (req,res,next) =>{
    Order.deleteMany().then(()=>{
        res.json({
            message: 'all orders removed'
        })
        io.getIO().emit('removeAllOrders')
    }).catch(err=>{
        res.status(500).json(err)
    })
}

module.exports = {
    makeOrder,
    myOrders,
    getOrders,
    removeOrder,
    removeAllOrders
}
