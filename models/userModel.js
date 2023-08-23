const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');



// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required:[true,"please provide your name "]
  },
  email: {
    type: String,
    required: [true,"please provide your email "],
    unique: true,
    lowercase: true,
    validate:[validator.isEmail, "Please provide valid email"]
  },
  password: {
    type: String,
    required: [true,"please provide your password "],
    minlength:8, 
  },
  confirmPassword: {
    type: String,
     required: [true,"please Confirm  your password "]
     ,
    validate: function () { /////// this only works on model.save() and create()
      return this.password === this.confirmPassword;
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  photo: {
    type: String,
    default: 'default-user.jpg', // Default profile photo
  }
  ,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }

});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});


///////// it works between user enter data and send to database 
userSchema.pre('save', async function(next){
if(!this.isModified("password")) return next(); /// if password is not modified

this.password = await bcrypt.hash(this.password, 12);
this.confirmPassword = undefined;

next();

})
userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

///////// instance method 

userSchema.methods.correctPassword = async function(userLoginPassword , userSignInPassword){
    return await bcrypt.compare(userLoginPassword, userSignInPassword)
}


userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {  ////// password change then 
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );         //// 100         < 200
            /// time at created < time at password change    
            console.log(JWTTimestamp , changedTimestamp) 
    return JWTTimestamp < changedTimestamp;  ///// return true 
  }

  // False means NOT changed
  return false;
};
/////// 




userSchema.methods.createPasswordResetToken = function(){
 const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

//   console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;

}




// Create a User model using the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
