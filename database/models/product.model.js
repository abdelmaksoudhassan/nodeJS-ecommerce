const mongoose = require('mongoose')
const {Schema} = require('mongoose')

require('dotenv').config({path:'./vars.env'})

const minNameLength = process.env.MIN_NAME_LENGTH
const maxNameLength = process.env.MAX_NAME_LENGTH
const lettersNumbersSpaces_regEx = /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/

const productSchema = new Schema({
    title:{
        required:[true,'this field is required'],
        type:String,
        minlength: [minNameLength,`this field must be minimum ${minNameLength}`],
        maxlength: [maxNameLength,`this field must be maximum ${maxNameLength}`],
        trim:true,
        validate:{
            validator:(value)=>{
                return lettersNumbersSpaces_regEx.test(value)
            },
            message:'this field support letters or numbers or spaces or underscore'
        }
    },
    price:{
        required:[true,'this field is required'],
        type:Number
    },
    quantity:{
        required:[true,'this field is required'],
        type:Number,
        integer:true
    },
    categoryId:{
        type:Schema.Types.ObjectId,
        required:[true,'every product must belongs to category'],
        ref:'Category'
    },
    description:[{
        type:String
    }],
    images:[{
        required:true,
        type:String
    }],
    publisherId:{
        type:Schema.Types.ObjectId,
        required:[true,'every product must have owner'],
        ref:'Admin'
    }
},{
    timestamps:true,
    versionKey: false
})
productSchema.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});
const Product = mongoose.model('Product',productSchema)
module.exports = Product