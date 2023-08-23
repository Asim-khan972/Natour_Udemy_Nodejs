const express = require("express")
const tourController = require("../Controller/tourController")
const authController = require("../Controller/authController")
// const reviewController = require("../Controller/reviewController")
const reviewRoutes = require("./reviewRoutes")


const router = express.Router()

/////// nested routes using            tourId
//http://localhost:3000/api/v1/tours/64dde46df1cc81b6b4463c73/reviews
router.use("/:tourId/reviews", reviewRoutes)

router.param("id", tourController.CheckId) //// it will run only when we have parameter in id 
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route("/tour-stats").get(tourController.getTourStats);

router.route("/").get(tourController.getAllTours).post(  authController.Protect,
    authController.restrictTo('admin', 'lead-guide'), tourController.CreateTour);
router.route("/:id").get(tourController.getTour).patch( authController.Protect,
    authController.restrictTo('admin', 'lead-guide'), tourController.updateTour).delete( 
  authController.Protect,
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.deleteTour)


    router.get("/tours-within/:distance/center/:latlng/unit/:unit", tourController.getToursWithin)

    router.get("/distances/:latlng/unit/:unit", tourController.getDistances)

    // router.route("/:tourId/reviews/").post(authController.Protect, authController.restrictTo("user") , reviewController.createReview)


module.exports = router;
