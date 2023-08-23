const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({ path: './config.env' });


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

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
try{   User.create(users, { validateBeforeSave: false });
         Tour.create(tours)}catch(error){
          console.log(error)
         }
// console.log(users)
// console.log(reviews)


// IMPORT DATA INTO DB

    //  Review.create(reviews)
  
      
      console.log("suceesssssssss")
    // await Review.create(reviews);
    
const importData = async () => {
  try {
    await Tour.create(tours);
    // await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};



// importData();

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    // await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
