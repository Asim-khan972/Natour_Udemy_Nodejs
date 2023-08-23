const express = require("express")
const fs = require('fs');
const Tour = require("../models/tourModel")
const APIFeatures= require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const factoryHandle = require ("./factoryHandle")

const data = fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`) 
//// 
const tours = JSON.parse(data);    //// String => object
///////// router params 
//// this is will run every controller who have id in its url 
/////// this function will run first then next controller is to performs task 
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';next();};
//// check id 
exports.CheckId = (req, res, next , val)=>{
    console.log(`Tour id is :  ${val} `)
 ////// value represent id that is in url 
    const id = req.params.id*1;
if(id>tours.length){return res.status(404).json({status:"Invalid Id "})}next();}
//////////  get allllllllll 
exports.getAllTours  =  async(req, res)=>{
    console.log(req.query)
 try {
    // EXECUTE QUERY
    ///object  =         class constructor 1st value and query
     //                                datasets  , commands 
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query; ////// this returns all the 

res.status(200).json({status:"success",results: tours.length,
data:{tours}})
 
} catch (error) {
     res.status(400).json({status:"fail", 
message : error
})}}

/////////////////  get with id 

exports.getTour = async (req, res)=>{

    
 try {
     const id = req.params.id;
    const tour = await Tour.findById(id).populate("reviews");

     if(!tour){
        return next(new AppError(`No tour is found for this ID `, 404))
     }
res.status(200).json({status:"success",results: tour.length,
data:{tour}})
 
}
 catch (error) {
     res.status(400).json({status:"fail", 
message : error
})}}
///////// post
exports.CreateTour =async (req, res)=>{
try {
    const newTour = await Tour.create(req.body) /////// only that data is send to database which is define in schema 
    /// diffrence btween save and Create 

    res.status(200).json({status:"success" , data:{
        tour: newTour
    }})
} catch (error) {
    res.status(400).json({status:"fail", 
message : error
})}}
////////// patch 
// exports.updateTour =async(req, res)=>{

//      try {
//      const id = req.params.id;
//     const tour = await Tour.findByIdAndUpdate(id, req.body, {
//         new: true, 
//         runValidators: true
//     })
//       if(!tour){
//         return next(new AppError(`No tour is found for this ID `, 404))
//      }

// res.status(200).json({status:"success",results: tour.length,
// data:{tour}})
 
// }
//  catch (error) {
//      res.status(400).json({status:"fail", 
// message : error
// })


//  }
// }
exports.updateTour= factoryHandle.updateOne(Tour);
exports.deleteTour = factoryHandle.deleteOne(Tour);
/////////  delete tour 
// exports.deleteTour =async(req, res)=>{

//      try {
//      const id = req.params.id;
//     const tour = await Tour.findByIdAndDelete(id);
//   if(!tour){
//         return next(new AppError(`No tour is found for this ID `, 404))
//      }
// res.status(200).json({status:"successfully delete",results: tour.length,
// data:{tour}})
 
// }
//  catch (error) {
//      res.status(400).json({status:"fail to delete", 
// message : error
// })
//  }
// }
exports.getTourStats = async(req, res)=>{
        try {
     const stats = await Tour.aggregate([{
     $match :{ratingsAverage : {$gte: 2}  }},
              //// field    : action 
     {
        $group:{
       _id : null, 
       /// label :   action : field
       avgratings : {$avg: "$ratingsAverage"},
       avgprice : {$avg :"$price" }, 
       sumPrice : {$sum: "$price"}
        } }
        , {
            $sort: {avgprice : 1}
        }
     ])


res.status(200).json({status:"successfully getStats",
data:{stats}})
 
}
 catch (error) {
     res.status(400).json({status:"fail to get stats", 
message : error
})}}
exports.getMonthlyPlan = async(req, res)=>{ 
     try {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
}



// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi

exports.getToursWithin=async(req, res , next)=>{
 try {
    const {distance,latlng,unit }= req.params;

    const [lat , lng]= latlng.split(",");

      const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

      if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

 const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
 
} catch (error) {
     res.status(400).json({status:"fail", 
message : error
})}}


exports.getDistances = async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
}