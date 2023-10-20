# nodeJS-ecommerce
real time ecommerce backend application developed using nodeJS and mongoDB

# used packages
1-bcryptjs: to secure password,
2-body-parser: to access data from HTTP requests and process form submissions,
3-dotenv: to access environment variables,
4-express: for request and middleware handling,
5-jsonwebtoken: for authentication and authorization,
6-lodash: functional helper library,
7-mongoose: to access database,
8-multer: for file uploading,
9-socket.io: to make real time application,
10-validator: to validate form imput fields,

# application routes
1- Admin:
- profile router: login , auto login , logout , add admin , get admins , delete admin , change password , change name , change photo
- category router: add category , edit category , delete category , get all categories , get category
- product router: add product , modify product , delete product

2- User:
- profile router: signup , login , auto login , logout , change password , change name , change photo , delete my account
- product router: get products , get product details
- cart router: add to cart , remove from cart , get cart , clear cart
- order router: add order , get order details , get all orders , delete order , delete my orders
