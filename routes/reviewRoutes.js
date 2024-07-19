const express = require("express");
const reviewController = require("./../controllers/reviewController.js");
const authController = require("./../controllers/authController.js");

const router = express.Router({mergeParams: true}); // this line of code means that we are merging the url parameters from the tourRoutes.js file and the reviewRoutes.js file. so that we can access the tourId from the tourRoutes.js file in the reviewRoutes.js file.
// for example : if we have an url like this : /api/v1/tours/858sa4md333/reviews then we can access the tourId from the url in the reviewRoutes.js file.


// POST /tour/858sa4md333/reviews : it means that we are posting a review to a specific tour
// GET /tour/24ad3s45/reviews : it means that we are getting all the reviews of a specific tour
// GET /tour/234fda34d/reviews/94ssa3saf : it means that we are getting a specific review of a specific tour


router.use(authController.protect);

router.route("/")
    .get(reviewController.getAllReviews) // only
    .post(authController.restrictTo("user"), reviewController.setTourUserIds, reviewController.createReview);

router
    .route("/:id")
    .get(reviewController.getReview)
    .delete(authController.restrictTo("user", "admin"), reviewController.deleteReview)
    .patch(authController.restrictTo("user", "admin"), reviewController.updateReview)

module.exports = router;