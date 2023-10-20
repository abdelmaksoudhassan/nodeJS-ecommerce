const {Schema} = require('mongoose')
const Product =require('./product.model')
const Person = require('./person.model')

const userSchema = new Schema({
    cart:[{
        productId:{
            type:Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            required:true,
            type:Number
        }
    }]
})
userSchema.methods.addToCart = function(product){
    const productIndex = this.cart.findIndex(item=>{
        return(item.productId.toString() === product._id.toString())
    })
    const updatedCart = [...this.cart]
    let newQuantity = 1
    if(productIndex >= 0){
        if(updatedCart[productIndex].quantity+1 > product.quantity){
            return Promise.reject(new Error('You have purchased the available quantity'))
        }
        newQuantity = updatedCart[productIndex].quantity + 1
        updatedCart[productIndex].quantity = newQuantity
    }else{
        updatedCart.push({productId:product._id,quantity:newQuantity})
    }
    this.cart = updatedCart
    return this.save()
}
userSchema.methods.cartDetails = function(){
    const productIds = this.cart.map(i => { return i.productId });
    return Product.find({ _id: {$in:productIds}}).then(products=>{
        return products.map(item=>{
            return {
                ...item._doc,
                orderQuantity:this.cart.find(i=>{
                    return (i.productId.toString() === item._id.toString()) 
                }).quantity
            }
        })
    }).catch(e=>{
        return e
    })
}
userSchema.methods.removeFromCart = function(id){
    const updatedCart = this.cart.filter(item=>item.productId.toString() !== id.toString())
    this.cart = updatedCart
    return this.save()
}
userSchema.methods.clearCart = function(){
    this.cart = []
    return this.save()
}
userSchema.methods.decreaseQuantity = function(product){
    const updatedCart = [...this.cart]
    const productIndex = updatedCart.findIndex(item=>item.productId.toString() === product._id.toString())
    if(productIndex === -1){
        return Promise.reject(new Error('product with this id doesn\'t exist in cart'))
    }
    if(updatedCart[productIndex].quantity-1 === 0 ){
        updatedCart.splice(productIndex,1)
    }else{
        updatedCart[productIndex].quantity -= 1
    }
    this.cart = updatedCart
    return this.save()
}
var User = Person.discriminator('User',userSchema)

module.exports = User