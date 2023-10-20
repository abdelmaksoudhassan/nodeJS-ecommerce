const mongoose = require('mongoose')
const {Schema} = require('mongoose')
const validator = require('validator').default
const bcrypt = require('bcryptjs')
require('dotenv').config({path: './vars.env'})
const jwt = require('jsonwebtoken')

const minPasswordLength = process.env.MIN_PASSWORD_LENGTH
const minNameLength = process.env.MIN_NAME_LENGTH
const maxNameLength = process.env.MAX_NAME_LENGTH
const rounds = process.env.ROUNDS
const secretKey = process.env.SECRET_KEY

const baseOptions = {
    discriminatorKey: 'persontype',
    collection: 'persons',
    timestamps:true,
    versionKey: false
  };
const personSchema = new Schema({
    firstName:{
        type:String,
        minlength: [minNameLength,`this field must be minimum ${minNameLength}`],
        maxlength: [maxNameLength,`this field must be maximum ${maxNameLength}`],
        trim:true,
        validate:{
            validator:(value)=>{
                return validator.isAlpha(value)
            },message:'this field must be letters only'
        }
    },
    lastName:{
        minlength: [minNameLength,`this field must be minimum ${minNameLength}`],
        maxlength: [maxNameLength,`this field must be maximum ${maxNameLength}`],
        type:String,
        trim:true,
        validate:{
            validator:(value)=>{
                return validator.isAlpha(value)
            },message:'this field must be letters only'
        }
    },
    email:{
        required:[true,'this field is required'],
        type:String,
        trim:true,
        validate:{
            validator:(value)=>{
                return validator.isEmail(value)
            },message:'this field must be in email valid format'
        }
    },
    password:{
        required:[true,'this field is required'],
        type:String,
        minlength: [minPasswordLength,`this field must be minimum ${minPasswordLength}`]
    },
    image:{
        type:String,
    }
},baseOptions)
personSchema.methods.toJSON = function(){
    const personObject = this.toObject()
    delete personObject.password
    return personObject
}
personSchema.pre('save',async function(next){
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(rounds)
        const hashedPassword = await bcrypt.hash(this.password,salt)
        this.password = hashedPassword
    }
    next()
})
personSchema.methods.checkPassword = function(password){
    return new Promise(async (resolve,reject)=>{
        const same = await bcrypt.compare(password,this.password)
        if(!same){
            return reject({message: 'wrong password'})
        }
        return resolve()
    })
}
personSchema.methods.generateToken = async function(){
    const token = jwt.sign({id:this._id},secretKey)
    return token
}
personSchema.statics.findByToken = async function(token){
    const data = await jwt.verify(token,secretKey)
    const person = await this.findById(data.id)
    return person
}
var Person = mongoose.model('Person',personSchema)
module.exports = Person