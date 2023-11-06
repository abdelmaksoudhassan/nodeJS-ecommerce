const Category = require('../database/models/category.model')
const {handValidationError} = require('../functions/functions')
const _ = require('lodash')
const {isValidObjectId} = require('mongoose')
const io = require('../socket-io/socket')

const addCategory= async (req,res,next)=>{
    const {title} = req.body
    try{
        const categories = await Category.find({title})
        if(_.isEmpty(categories)){
            const category = await Category.create({title})
            res.status(201).json(category)
            io.getIO().emit('addCategory',category)
            next()
        }else{
            return res.status(406).json({
                message: `category with title ${title} already exist`
            })
        }
    }catch(err){
        if(err.errors){
            return res.status(406).json(handValidationError(err))
        }
        res.status(500).send(err)
    }
}

const editCategory= async (req,res,next)=>{
    const {id} = req.params
    const {title} = req.body
    if(!isValidObjectId(id)){
        return res.status(400).send({
            message: 'invalid category id'
        })
    }
    try{
        const updated = await Category.findOneAndUpdate(
            { _id: id },{
                $set: { title }
            },{
                runValidators: true
            }
        )
        if(! updated){
            return res.status(404).json({
                message: `category with id ${id} not found`
            })
        }
        res.json({
            message: 'category updated'
        })
        io.getIO().emit('editCategory',updated)
        next()
    }catch(err){
        if(err.errors){
            return res.status(406).json(handValidationError(err))
        }
        return res.status(500).send(err)
    }
}

const deleteCategory= async (req,res,next)=>{
    const {id} = req.params
    if(!isValidObjectId(id)){
        return res.status(400).send({
            message: 'invalid category id'
        })
    }
    try{
        const deleted = await Category.deleteOne({_id:id})
        if(deleted.deletedCount == 0){
            return res.status(404).json({
                message: `category with id ${id} not found`
            })
        }
        res.json({ 
            message: `category deleted`
        })
        io.getIO().emit('deleteCategory',id)
        next()
    }catch(err){
        res.status(500).send(err)
    }
}

const getCategories = async(req,res,next) =>{
    try{
        const categories = await Category.find()
        res.send(categories)
        next()
    }catch(err){
        return res.status(500).send(err)
    }
}

module.exports = {
    addCategory,
    editCategory,
    deleteCategory,
    getCategories
}
