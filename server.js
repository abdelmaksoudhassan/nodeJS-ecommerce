const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')

const userRouter = require('./routers/user.router')
const adminRouter = require('./routers/admin.router')
const categoryRouter = require('./routers/category.router')
const productRouter = require('./routers/product.router')
const cartRouter = require('./routers/cart.router')
const orderRouter = require('./routers/order.router')

require('./database/connection')
require('dotenv').config({ path:'./vars.env' })

const app = express()
const server = http.createServer(app)
const io = require('./socket-io/socket').init(server)

const port = process.env.PORT || 3000

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/user',userRouter)
app.use('/admin',adminRouter)
app.use(categoryRouter)
app.use(productRouter)
app.use(cartRouter)
app.use(orderRouter)
app.get('/',(req,res,next)=>{
    res.send('welcome from server')
})

io.on('connection',(socket)=>{
    const {id} = socket
    console.log(`new user connected via socket with id ${id}`)

    socket.on('disconnect',(msg)=>{
        console.log(`user with socket id ${id} ${msg}`)
    })
})

server.listen(port,()=>{
    console.log(`server connected on port ${port}`)
})
