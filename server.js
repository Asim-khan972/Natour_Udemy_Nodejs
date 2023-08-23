const app = require("./app")
const mongoose = require('mongoose');
const dotenv = require("dotenv")
dotenv.config("/.env");



process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT;

const dbName = 'natours';

// Connect to MongoDB
mongoose.connect(`mongodb://0.0.0.0:27017/natours`);

// Get the default connection
const db = mongoose.connection;

// Handle connection events
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log(`Connected to "${dbName}" database`);
})

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});



app.listen(port , ()=>{
    console.log(`App is running on PORT :  ${port}`)
})