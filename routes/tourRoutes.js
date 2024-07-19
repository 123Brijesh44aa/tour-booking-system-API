const express = require("express");
const tourController = require("./../controllers/tourController.js");
const authController = require("./../controllers/authController.js");
const reviewRouter = require("./../routes/reviewRoutes.js");


const router = express.Router();


// POST /tour/858sa4md333/reviews : it means that we are posting a review to a specific tour
// GET /tour/24ad3s45/reviews : it means that we are getting all the reviews of a specific tour
// GET /tour/234fda34d/reviews/94ssa3saf : it means that we are getting a specific review of a specific tour


router.use("/:tourId/reviews", reviewRouter); // this line of code means that if we get a request to this route then we will use the reviewRouter which is coming from the reviewRoutes.js file. and this line of code means that we are mounting a router.
// for example : if we get a request to this route : /api/v1/tours/858sa4md333/reviews then we will use the reviewRouter which is coming from the reviewRoutes.js file.

// router.param("id", tourController.checkID)

// Create a checkBody middleware
// check if body contains the name and price property
// if not, send back 404 ( bad request )
// add it to the post handler stack


router.route("/top-5-cheap").get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);

router.route("/monthly-plan/:year").get(authController.protect, authController.restrictTo("admin", "lead-guide", "guide"), tourController.getMonthlyPlan);

router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// tour-within/233/center/-40,45/unit/mi

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router.route("/")
    .get(
        // authController.protect // we want to publicize the getAllTours route so that everyone can see all the tours that why we are not using authController.protect middleware here.
        tourController.getAllTours
    )/**
 * authController.protect will run first and then tourController.getAllTours will run. because we have written authController.protect first and then tourController.getAllTours. so the order of the middleware functions is very important.
 */
    .post(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.createTour); // we want that authorized uses and admin and lead-guide can create a tour

router.route("/:id")
    .get(tourController.getTour)
    .patch(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.updateTour)
    .delete(
        authController.protect
        , authController.restrictTo("admin", "lead-guide")
        , tourController.deleteTour);


module.exports = router;