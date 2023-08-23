const AppError = require ("../utils/appError");

exports.deleteOne = Model =>async(req, res)=>{

     try {
     const id = req.params.id;
    //  console.log(id)
    const One = await Model.findByIdAndDelete(id);
    console.log(One)
  if(!One){  return next(new AppError(`No One is found for this ID `, 404))
     }res.status(200).json({status:"successfully delete",data:{One}})
}catch (error) {res.status(400).json({status:"fail to delete", message : error})}
}




exports.updateOne = Model =>async(req, res)=>{

     try {
     const id = req.params.id;
    const doc = await Model.findByIdAndUpdate(id, req.body, {
        new: true, 
        runValidators: true
    })
      if(!doc){
        return next(new AppError(`No doc is found for this ID `, 404))
     }
     console.log(id , doc)

res.status(200).json({status:"success",
data:{doc}})
 
}
 catch (error) {
     res.status(400).json({status:"fail", 
message : error
})


 }
}