const express = require("express")
const reviewController = require("../Controller/reviewController")
const authController = require("../Controller/authController")
const router = express.Router({mergeParams:true})  /// for nested routes 


router.use(authController.Protect)
 router.get("/", reviewController.getAllReview).post("/", authController.restrictTo("user") ,reviewController.createReview)
   router.get("/:id", reviewController.getAReview)

   router.delete("/:id", authController.restrictTo("user", "admin"),reviewController.deleteReview)
   router.patch("/:id",authController.restrictTo("user", "admin"),reviewController.updateReview)
module.exports = router;