const express = require("express");
const { promisify } = require('util');
const User  = require("../models/userModel");
var jwt = require('jsonwebtoken');
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const crypto = require('crypto');



const signInToken = id =>{
   return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES 
     });
}

const createSendToken = (user, statusCode, res) => {
  const token = signInToken(user._id);
//   console.log(token)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  console.log(cookieOptions)

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};


exports.SignUp =async (req, res, next)=>{

try {
    const newUser  = await User.create({
        name : req.body.name, 
        email: req.body.email, 
        password: req.body.password, 
        confirmPassword: req.body.confirmPassword, 
        role: req.body.role
    }) 
     var token = signInToken(newUser._id);
  createSendToken(newUser, 201, res);
} catch (error) {
    res.status(400).json({status:"fail", 
message : error
})
}

}


exports.Login =async (req, res, next)=>{

try {
   
   const {email , password } = req.body;
     //////// to check email 

   if(!email || !password){
     next(new AppError(`Please provide email and password `, 400))
   }

 //////// get the user data from database 
   const user = await User.findOne({email}).select("+password");
      //////// check password 
// console.log(user)
      const correct =await user.correctPassword(password, user.password);

    //   console.log(correct)
 if (!user || !correct) {
    return next(new AppError('Incorrect email or password', 401));
  }



   ////// token 

//    const token = signInToken(user._id);

  createSendToken(user, 201, res);
} catch (error) {
    res.status(400).json({status:"fail to login ", 
message : error
})
}

}

 ///////////////  
exports.Protect =async (req, res, next)=>{

try {
  
 let token;   /////// it will get bearer token from headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; //// get the token value
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }



 // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

// console.log(decoded)

 // 3) Check if user still exists// someone create user and get token then delete the user
  const currentUser = await User.findById(decoded.id);
//    console.log(currentUser)
if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

//   console.log(currentUser.changedPasswordAfter(decoded.iat))
 // 4) Check if user changed password after the token was issued
//   if (currentUser.changedPasswordAfter(decoded.iat)) { /////// if return false go next otherwise error
//     return next(
//       new AppError('User recently changed password! Please log in again.', 401)
//     );
//   }


req.user = currentUser;
/////// reach safe here
    next();
} catch (error) {
    res.status(400).json({status:"fail to protect", 
message : error
})
}

}

///////////// function to restrict 
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};
 /////////////////              ////////////////////////////////
 


exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
};






//////////////////////////
exports.resetPassword =async (req, res, next)=>{

try {

  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    console.log(hashedToken)
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  console.log(user)

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);

//    const token = signInToken(user._id);


    // res.status(200).json({status:"success" ,token })
        
} catch (error) {
    res.status(400).json({status:"fail to reset password", 
message : error
})
}}






//////////////////////////
exports.updatePassword =async (req, res, next)=>{

try {
// 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
     

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
        
} catch (error) {
    res.status(400).json({status:"fail to update password", 
message : error
})
}}