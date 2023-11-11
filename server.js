const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
var cors = require('cors');

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
const io = require('./socket-io/socket').init(server,{
    cors: {
      origin: ['http://localhost:5173','http://localhost:5174'],
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true
    }
})

const port = process.env.PORT || 3000

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//     res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Token, Token');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// });
app.use(cors({
        origin: ['http://localhost:5173','http://localhost:5174'],
        methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
        credentials: true,
        allowedHeaders: ['Content-Type, Authorization, User-Token, Token']
    })
);
app.use('/',express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/user',userRouter)
app.use('/admin',adminRouter)
app.use(categoryRouter)
app.use(productRouter)
app.use(cartRouter)
app.use(orderRouter)
app.get('/',(req,res,next)=>{
    res.send('welcome from server')
    next()
})

io.on('connection',(socket)=>{
    const {id} = socket
    console.log(`new user connected via socket with id ${id}`)

    socket.on('join',(params)=>{
        const {room} = params
        socket.join(room);
        socket.broadcast.to(room).emit('newAdminJoined');
    })

    socket.on('disconnect',(msg)=>{
        console.log(`user with socket id ${id} ${msg}`)
    })
})

server.listen(port,()=>{
    console.log(`server connected on port ${port}`)
})
