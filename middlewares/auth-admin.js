const Admin = require('../database/models/admin.model')

const authAdmin = async(req,res,next) => {
    try{
        const token = req.header('Token')
        if(! token){
            return res.status(401).send({
                message: 'unauthorized request'
            })
        }
        let admin = await Admin.findByToken(token)
        if(! admin){
            return res.status(401).send({
                message: 'unauthorized request'
            })
        }
        req.admin = admin
        next()
    }
    catch(err){
        res.status(500).send(err)
    }
}

module.exports = authAdmin
