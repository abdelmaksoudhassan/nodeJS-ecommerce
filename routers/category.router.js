const express = require('express')
const authAdmin = require('../middlewares/auth-admin')
const category = require('../controllers/category.controller')

const categoryRouter = express.Router()

categoryRouter.post('/category',authAdmin,category.addCategory)
categoryRouter.patch('/category/:id',authAdmin,category.editCategory)
categoryRouter.delete('/category/:id',authAdmin,category.deleteCategory)
categoryRouter.get('/categories',category.getCategories)

module.exports = categoryRouter