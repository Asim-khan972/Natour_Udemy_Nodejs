const express = require("express")
const tourRoutes = require("./Routes/tourRoutes")
const userRoutes = require("./Routes/userRoutes")
const reviewRoutes = require("./Routes/reviewRoutes")
const app = express();
const AppError = require('./utils/appError')
const errorHandler = require("./Controller/errorController")
const rateLimit = require('express-rate-limit')
const helmet = require("helmet")
const path = require("path");
const exp = require("constants");
app.use(express.json())  //// middleware to use json data
app.use(express.static(`${__dirname}/public`))
const pug = require('pug');
const viewRouter = require('./Routes/viewRoutes');



app.set("view engine","pug")
app.set("views", path.join(__dirname, "views"))

app.use(express.static(path.join(__dirname, "public")))

const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 28
};

app.use(helmet())
////////////////  

/////////// routes



app.use('/', viewRouter);
app.use("/api/v1/tours", tourRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/reviews", reviewRoutes)






app.use((req, res, next)=>{
  req.requestTime = new Date().toISOString();
  // console.log(req.headers)
})



const apiLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message:"too many request from this ip address please try later "
})


app.use('/api', apiLimiter)


app.all("*", (req, res, next)=>{
  next(new AppError(`cant find ${req.originalUrl} on this server`))
})

app.use((err, req, res, next)=>{
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status, 
    message : err.message
  })
})


app.use(errorHandler)
/////////// server listening 

module.exports = app;
