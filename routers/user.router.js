const express = require('express')
const userController = require('../controllers/user.controller')
const authUser = require('../middlewares/auth-user')

const userRouter = express.Router()

userRouter.post('/signup',userController.signUp)
userRouter.post('/login',userController.login)
userRouter.post('/auto-login',userController.autoLogin)
userRouter.post('/logout',authUser,userController.logOut)
userRouter.patch('/change-password',authUser,userController.changePassword)
userRouter.patch('/change-name',authUser,userController.changeName)
userRouter.patch('/change-photo',authUser,userController.changePhoto)
userRouter.delete('/delete-my-account',authUser,userController.deleteMyAccount)

module.exports = userRouter