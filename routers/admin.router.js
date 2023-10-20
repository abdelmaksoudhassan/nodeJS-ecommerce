const express = require('express')
const adminController = require('../controllers/admin.controller')
const authAdmin = require('../middlewares/auth-admin')

const adminRouter = express.Router()

adminRouter.post('/login',adminController.login)
adminRouter.post('/auto-login',adminController.autoLogin)
adminRouter.post('/logout',authAdmin,adminController.logout)
adminRouter.post('/add-admin',authAdmin,adminController.addAdmin)
adminRouter.get('/get-admins',authAdmin,adminController.getAdmins)
adminRouter.delete('/delete-admin/:email',authAdmin,adminController.deleteAdmin)
adminRouter.patch('/change-password',authAdmin,adminController.changePassword)
adminRouter.patch('/change-name',authAdmin,adminController.changeName)
adminRouter.patch('/change-photo',authAdmin,adminController.changePhoto)

module.exports = adminRouter
