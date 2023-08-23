const express = require("express");
const User = require("../models/userModel");
const AppError = require('./../utils/appError');
const factory = require("./factoryHandle");









const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};



/////////////// User controller 


exports.getAllUsers =async (req, res)=>{

try{
  const users = await User.find();
res.status(200).json({status:"success",results: users.length,
data:{users}})
 
} catch (error) {
     res.status(400).json({status:"fail to get All users", 
message : error
})}
}
    

exports.deleteMe =async (req, res)=>{

try{
const deleteUser = await User.findByIdAndUpdate(req.user.id ,{active: false})

 res.status(204).json({
    status: 'success',
    data: null
  });
 
} catch (error) {
     res.status(400).json({status:"fail to delete user ", 
message : error
})}
}











exports.updateMe =async (req, res)=>{

try{

  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email'); ///// user can only update email and name 

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });


} catch (error) {
     res.status(400).json({status:"fail to patch update me ", 
message : error
})}





}


exports.getUser =async (req, res)=>{

  try{
  id = req.user.id;
  const user = await User.findById(id);
  if(!user){
            return next(new AppError(`No tour is found for this ID `, 404))  }


              res.status(404).json({user})

  }catch (error) {
     res.status(400).json({status:"fail", 
message : error
})}

}







exports.CreateUser = (req, res)=>{
  res.status(404).json({status:"This route is not define still but will define sooooon "})
}
exports.updateUser = (req, res)=>{
  res.status(404).json({status:"This route is not define still but will define sooooon "})
}
exports.deleteUser = factory.deleteOne(User);
// exports.updateMe = factory.updateOne(User)



exports.getMe = async(req, res, next)=>{
req.params.id = req.user.id

  next();
}
