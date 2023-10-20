const User = require('../database/models/user.model')

const authUser = async(req,res,next) => {
    const token = req.header('token')
    if(! token){
        return res.status(401).send({
            message: 'unauthorized request'
        })
    }
    try{
        const user = await User.findByToken(token)
        if(! user){
            return res.status(401).send({
                message: 'unauthorized request'
            })
        }
        req.user = user
        next()
    }
    catch(err){
        res.status(500).send(err)
    }
}

module.exports = authUser