const mongoose = require('mongoose')
const {deleteImage} = require('../../functions/functions')
const Product = require('../../database/models/product.model')
const io = require('../../socket-io/socket')

const orderSchema = mongoose.Schema({
    products : [{
        productId:{
            required:true,
            ref:'Product',
            type:mongoose.Schema.Types.ObjectId
        },
        quantity:{
            required:true,
            type:Number
        }
    }],
    userId:{
        required:true,
        ref:'User',
        type:mongoose.Schema.Types.ObjectId
    }
},{
    timestamps:true,
    versionKey: false
})
orderSchema.statics.addOrder =  async function(user){
    const products = []
    const productsId = user.cart.map(item=>{return item.productId._id}) //get all products in cart
    await Product.find({_id:{$in:productsId}}).cursor().eachAsync(async(product)=>{ //loop all products in cart
        // get quantity for all products in cart
        const neededQuantity = user.cart.find(item=>{
            return item.productId._id.toString() === product._id.toString()
        }).quantity
        //if it last piece in store remove it
        if(neededQuantity == product.quantity){
            const removed = await Product.findOneAndDelete({_id:product._id})
            removed.images.forEach(image=>{deleteImage(image)});
            io.getIO().emit('deleteProduct',product._id)
        }else if(neededQuantity < product.quantity){ 
            product.quantity -= neededQuantity
            await product.save()
            io.getIO().emit('updateProductQuantity',{id:product._id,newQuantity:product.quantity})
        }
        products.push({productId:product._id,quantity:neededQuantity}) //add product to order
    })
    const newOrder = new Order({ //create order
        products,
        userId:user._id
    })
    user.cart = []
    await user.save()
    return await newOrder.save()
}
const Order = mongoose.model('Order',orderSchema)
module.exports = Order
