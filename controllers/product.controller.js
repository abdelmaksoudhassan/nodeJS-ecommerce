const Product = require('../database/models/product.model')
const {isValidObjectId} = require('mongoose')
const {deleteImage,handValidationError,uploadProductImages} = require('../functions/functions')
const io = require('../socket-io/socket')

const addProduct = (req,res,next) =>{
    const publisherId = req.admin._id
    uploadProductImages(req,res,function(err){
        if (err) {
            return res.status(406).send({
                message: 'file validation error',
                ...err
            })
        }
        if(req.files.length == 0){
            return res.status(406).json({
                message: 'upload at least one photo'
            })
        }
        const images = [] 
        req.files.forEach(img=>images.push(img.path))
        const {title,price,description,categoryId,quantity} = req.body
        const product = new Product({title,price,description,categoryId,quantity,images,publisherId})
        product.save().then(doc=>{
            res.json(doc)
            io.getIO().emit('addProduct',doc)
            next()
        }).catch(e=>{
            images.forEach(path=>deleteImage(path))
            if(e.errors){
                return res.status(406).json(handValidationError(e))
            }
            res.status(500).send(e)
        })
    })
}

const getProduct = async (req,res,next) =>{
    const {id} = req.params
    if(!isValidObjectId(id)){
        return res.status(400).send({
            message: 'invalid product id'
        })
    }
    try{
        const product = await Product.findById(id).populate('categoryId').populate('publisherId').exec()
        if(!product){
            return res.status(404).send({
                message: `product with id ${id} not exist`
            })
        }
        res.json(product)
        next()
    }
    catch(e){
        res.status(500).json(e)
    }
}
const deleteProduct = async (req,res,next) => {
    const {id} = req.params
    if(!isValidObjectId(id)){
        return res.status(400).send({
            message: 'invalid product id'
        })
    }
    try{
        const deleted = await Product.findOneAndDelete({_id:id})
        if(! deleted){
            return res.status(404).json({
                message: `product with id ${id} not found`
            })
        }
        deleted.images.forEach(path=>deleteImage(path))
        res.json({
            message: `product deleted`
        })
        io.getIO().emit('deleteProduct',id)
        next()
    }catch(err){
        return res.status(500).json(err)
    }
}
const editProduct = (req,res,next)=>{
    const {id} = req.params
    if(!isValidObjectId(id)){
        return res.status(400).send({
            message: 'invalid product id'
        })
    }
    const {_id} = req.admin
    uploadProductImages(req,res,async function(err){
        if (err) {
            return res.status(406).send({
                message: 'file validation error',
                ...err
            })
        }
        if(req.files){
            var newImages = []
            req.files.forEach(img=>newImages.push(img.path))
        }
        try{
            const {title,price,quantity,categoryId,description} = req.body
            const updated = await Product.findOneAndUpdate({ _id:id, publisherId: _id},{
                $set:{ title, price, quantity, categoryId, description },
                $addToSet:{ images:{ $each : newImages } }
            },{ new:true }).populate('categoryId').populate('publisherId').exec()
            if(!updated){
                return res.status(404).json({
                    message: `product with id ${id} not found`
                })
            }
            res.json(updated)
            io.getIO().emit('editProduct',updated)
            next()
        }catch(err){
            newImages.forEach(path=>deleteImage(path))
            if(err.errors){
                return res.status(406).json(handValidationError(err))
            }
            res.status(500).send(err)
        }
    })
}

const getAdminProducts = async (req,res,next) =>{
    const page = +req.query.page // + converts string to number
    const limit = +req.query.count
    const publisherId = req.admin._id
    try{
        const total = await Product.count({publisherId})
        const products = await Product.find({publisherId}).populate('categoryId').limit(limit).skip((page-1)*limit)
        res.json({
            products,
            currentPage:page,
            hasNextPage: limit*page<total,
            hasPreviousPage: page>1,
            nextPage: ((total/(limit*page) >1) ? page+1 : null),
            previousPage: (page>1 ? page-1 : null ),
            lastPage:Math.ceil(total/limit),
            total
        })
        next()
    }
    catch(err){
        res.status(500).json(err)
    }
}
const getAllProducts = async (req,res,next)=>{
    const page = + req.query.page
    const limit = + req.query.count
    try{
        const total = await Product.count()
        const products = await Product.find().populate('categoryId').populate('publisherId').limit(limit).skip((page-1)*limit)
        res.json({
            products,
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

module.exports = {
    addProduct,
    getProduct,
    deleteProduct,
    editProduct,
    getAdminProducts,
    getAllProducts
}
