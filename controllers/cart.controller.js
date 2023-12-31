const {isValidObjectId} = require('mongoose')
const Product = require('../database/models/product.model')

const addToCart = async (req,res,next) =>{
    const user = req.user
    const {productId} = req.params
    if(!isValidObjectId(productId)){
        return res.status(400).json({
            message: 'invalid product id'
        })
    }
    try{
        const product = await Product.findById(productId)
        if(!product){
            return res.status(404).json({
                message: `product with id ${productId} not found`
            })
        }
        const userData = await user.addToCart(product)
        const {cart} = userData
        res.json(cart)
        next()
    }catch(err){
        return res.status(500).send(err)
    }
}

const decreaseQuantity = async (req,res,next) =>{
    const user = req.user
    const {productId} = req.params
    if(!isValidObjectId(productId)){
        return res.status(400).json({
            message: 'invalid product id'
        })
    }
    try{
        const product = await Product.findById(productId)
        if(! product){
            return res.status(404).json({
                message: `product with id ${productId} not found`
            })
        }
        const userData = await user.decreaseQuantity(product)
        const {cart} = userData
        res.json(cart)
        next()
    }catch(err){
        console.log(err)
        res.status(500).send(err)
    }
}
const removeFromCart = async (req,res,next) =>{
    const user = req.user
    const {productId} = req.params
    if(!isValidObjectId(productId)){
        return res.status(400).json({
            message: 'invalid product id'
        })
    }
    try{
        const userData = await user.removeFromCart(productId)
        const {cart} = userData
        res.json(cart)
        next()
    }catch(err){
        res.status(500).send(err)
    }
}
const clearCart = (req,res,next) =>{
    const user = req.user
    user.clearCart().then(()=>{
        res.send({cart:[]})
        next()
    }).catch(e=>{
        res.status(500).json(e)
    })
}
const getCart = (req,res,next) =>{
    const user = req.user
    user.cartDetails().then(userData=>{
        res.json(userData)
        next()
    }).catch(e=>{
        res.status(500).json(e)
    })
}
module.exports = {
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getCart
}
