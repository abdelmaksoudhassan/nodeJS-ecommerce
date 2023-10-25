const User = require('../database/models/user.model')
const Person = require('../database/models/person.model')
const {uploadUserPhoto,deleteImage,handValidationError} = require('../functions/functions')
const _ = require('lodash')
const {compare} = require('bcryptjs')

const signUp = async (req,res,next) => {
    const {email,password} = req.body
    try{
        let users = await Person.find({email})
        if(! _.isEmpty(users)){
            return res.status(404).send({
                message: `${email} already used`
            })
        }
        const user = await User.create({email,password})
        res.status(201).json({
            message: 'new user registered'
        })
        next()
    }
    catch(e){
        if(e.errors){
            return res.status(422).json(handValidationError(e))
        }
        res.status(500).json(e)
    }
}

const login = async (req,res,next) =>{
    const {email,password} = req.body
    try{
        const users = await User.find({email})
        if(_.isEmpty(users)){
            return res.status(404).send({
                message: `email ${email} not found`
            })
        }
        const user = users[0]
        await user.checkPassword(password)
        const token = await user.generateToken()
        res.setHeader('Token',token).status(200).json(user)
        next()
    }
    catch(e){
        res.status(500).send(e)
    }
}

const logOut = (req,res,next) =>{
    const user = req.user
    try{
        if(user){
            res.status(200).json({
                message: 'user logged out'
            })
            next()
        }
    }
    catch(e){
        res.status(500).json(e)
    }
}

const autoLogin = async (req,res,next) =>{
    const token = req.header('Token')
    try{
        const user = await User.findByToken(token)
        res.json(user)
        next()
    }
    catch(e){
        res.status(500).send(e)
    }
}

const changePassword = async (req,res,next) =>{
    const {oldPassword,newPassword} = req.body
    try{
        const same = await compare(oldPassword,req.user.password)
        if(!same){
            return res.status(401).send({
                message: "wrong password"
            })
        }
        req.user.password = newPassword
        await req.user.save()
        res.status(200).send({
            message: 'password updated'
        })
        next()
    }catch(e){
        if(e.errors){
            return res.status(406).json(handValidationError(e))
        }
        res.status(500).json(e)
    }
}

const changeName = async (req,res,next) =>{
    const user = req.user
    const {firstName,lastName} = req.body
    try{
        user.firstName = firstName
        user.lastName = lastName
        const updatedUser = await user.save()
        res.json(updatedUser)
    }catch(e){
        if(e.errors){
            return res.status(406).json(handValidationError(e))
        }
        res.status(500).json(e)
    }
}

const changePhoto = (req,res,next) =>{
    const user = req.user
    const oldImage = user.image
    uploadUserPhoto(req, res, function (err) {
        if (err) {
            return res.status(406).send({
                message: 'file validation error',
                ...err
            })
        }
        if(!req.file){
            return res.status(406).send({
                message: 'file must be choosen'
            })
        }
        user.image = req.file.path
        user.save().then(doc=>{
            if(oldImage){
                deleteImage(oldImage)
            }
            res.json(doc)
            next()
        }).catch(e=>{
            res.status(500).json(e)
        })
    })
}

const deleteMyAccount = (req,res,next)=>{
    const {email,image} = req.user
    User.deleteOne({email}).then(()=>{
        deleteImage(image)
        res.status(200).send({ 
            message: `${email} account deleted`
        })
        next()
    }).catch(e=>{
        res.status(500).json(e)
    })
}

module.exports = {
    signUp,
    login,
    autoLogin,
    logOut,
    changePassword,
    changeName,
    changePhoto,
    deleteMyAccount,
}
