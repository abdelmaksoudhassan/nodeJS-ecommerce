const Admin = require('../database/models/admin.model')
const Person = require('../database/models/person.model')
const {uploadAdminPhoto,deleteImage,handValidationError} = require('../functions/functions')
const _ = require('lodash')
const {compare} = require('bcryptjs')

const login = async (req,res,next) =>{
    const {email,password} = req.body
    try{
        const admins = await Admin.find({email})
        if(_.isEmpty(admins)){
            return res.status(404).json({
                message: `email ${email} not found`
            })
        }
        const admin = admins[0]
        const equaled = await admin.checkPassword(password)
        if(!equaled){
            return res.status(401).json({
                message: 'wrong password'
            })
        }
        const token = await admin.generateToken()
        res.status(200).json({admin,token})
        next()
    }
    catch(err){
        res.status(500).send(err)
    }
}

const logout = (req,res,next) =>{
    const admin = req.admin
    try{
        if(admin){
            res.status(200).json({
                message: 'user logged out'
            })
            next()
        }
    }
    catch(err){
        res.status(500).json(err)
    }
}

const autoLogin = async (req,res,next) =>{
    const token = req.header('Token')
    try{
        const admin = await Admin.findByToken(token)
        res.status(200).json(admin)
        next()
    }
    catch(err){
        res.status(500).send(err)
    }
}

const addAdmin = async (req,res,next) => {
    const {email,password} = req.body
    try{
        let persons = await Person.find({email})
        if(! _.isEmpty(persons)){
            return res.status(406).send({
                message: `${email} already used`
            })
        }
        const admin = await Admin.create({email,password})
        res.status(201).json({
            message: `admin with email ${email} added succssfully`
        })
        next()
    }
    catch(e){
        if(e.errors){
            return res.status(406).json(handValidationError(e))
        }
        res.status(500).send(e)
    }
}

const getAdmins = (req,res,next) =>{
    const myEmail = req.admin.email
    Admin.find({email:{$ne:myEmail}}).then(docs=>{
        res.send(docs)
        next()
    }).catch(err=>{
        res.status(500).json(err)
    })
}
const changePassword = async (req,res,next) =>{
    const {oldPassword,newPassword} = req.body
    try{
        const same = await compare(oldPassword,req.admin.password)
        if(! same){
            return res.status(401).send({
                message: "wrong password"
            })
        }
        req.admin.password = newPassword
        await req.admin.save()
        res.status(200).send({
            message: 'password updated'
        })
        next()
    }catch(e){
        if(e.errors){
            return res.status(406).json(handValidationError(e))
        }
        res.status(500).send(e)
    }
}

const changeName = async (req,res,next) =>{
    const admin = req.admin
    const {firstName,lastName} = req.body
    try{
        admin.firstName = firstName
        admin.lastName = lastName
        const updatedAdmin = await admin.save()
        res.json(updatedAdmin)
        next()
    }catch(e){
        if(e.errors){
            return res.status(406).json(handValidationError(e))
        }
        res.status(500).json(e)
    }
}

const changePhoto = (req,res,next) =>{
    const admin = req.admin
    const oldImage = admin.image
    uploadAdminPhoto(req, res, function (err) {
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
        admin.image = req.file.path
        admin.save().then(doc=>{
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

const deleteAdmin = async(req,res,next)=>{
    const _id = req.params.id
    try{
        const deleted = await Admin.deleteOne({_id})
        if(deleted.deletedCount == 0){
            return res.status(404).json({
                message: `admin with id ${id} not found`
            })
        }
        res.status(200).send({
            message: `${email} account deleted`
        })
        next()
    }catch(e){
        console.log(e)
        res.status(500).json(e)
    }
}

module.exports = {
    login,
    autoLogin,
    addAdmin,
    logout,
    getAdmins,
    changePassword,
    changeName,
    changePhoto,
    deleteAdmin,
}
