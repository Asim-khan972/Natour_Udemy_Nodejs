const express = require("express");
const Review = require("../models/reviewModel");
const AppError = require('./../utils/appError');
const factory= require("./factoryHandle");


/////////////// review controller 


exports.getAllReview =async (req, res)=>{

try{
 let filter={}  
 ////////  ager kio id he t0 only us id k review find kar ke do 
    if(req.params.tourId) filter = {tour : req.params.tourId}
  const reviews = await Review.find(filter);
res.status(200).json({status:"success",results: reviews.length,
data:{reviews}})
 
} catch (error) {
     res.status(400).json({status:"fail to get All reviews", 
message : error
})}
}




exports.createReview =async (req, res)=>{

try{

    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;


  const review = await Review.create(req.body)
res.status(200).json({status:"success",
data:{review}})
 
} catch (error) {
     res.status(400).json({status:"fail to post a reviews", 
message : error
})}
}



exports.getAReview =async (req, res)=>{

try{
  const review = await Review.findById(req.params.id)
res.status(200).json({status:"success",
data:{review}})
 
} catch (error) {
     res.status(400).json({status:"fail to get a review", 
message : error
})}
}


exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);