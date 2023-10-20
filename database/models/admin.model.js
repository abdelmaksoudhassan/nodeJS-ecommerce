const {Schema} = require('mongoose')
const {deleteImage} = require('../../functions/functions')
const Person = require('./person.model')

const adminSchema = new Schema()

adminSchema.pre('deleteOne',{ query: true, document: false },function(next){
    let image = this.getQuery()['image']
    deleteImage(image)
    next()
})
var Admin = Person.discriminator('Admin',adminSchema)
module.exports = Admin