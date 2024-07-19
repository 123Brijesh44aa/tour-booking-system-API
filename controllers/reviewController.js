const Review = require("./../models/reviewModel.js");
const factory = require("./handlerFactory.js");


// exports.getAllReviews = async (req, res) => {
//     // THIS IS A NESTED GET ENDPOINT : this means that we are getting all the reviews of a specific tour. and this is a nested get endpoint because we are getting all the reviews of a specific tour from the url of that specific tour. for example : if we have an url like this : /api/v1/tours/858sa4md333/reviews then we can access the tourId from the url in the reviewRoutes.js file.
//     try {
//         let filter = {};
//         if (req.params.tourId) {
//             filter = {tour: req.params.tourId};
//         } // if the request.params.tourId exists then we will find the reviews of that specific tour. and if the request.params.tourId does not exist then we will find all the reviews.
//
//         const reviews = await Review.find(filter); /*" WE CAN POPULATE BY POPULATE METHOD HERE AND WE CAN CREATE A PRE FIND MIDDLEWARE IN REVIEW MODEL TO POPULATE TOUR AND USER ".populate("tour").populate("user")*/
//         res.status(200).json(
//             {
//                 status: "Success",
//                 results: reviews.length,
//                 data: {
//                     reviews
//                 }
//             }
//         )
//     } catch (e) {
//         res.status().json(
//             {
//                 status: "Failed",
//                 message: e.message
//             }
//         )
//     }
// }
exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = (req, res, next) => {
    // ALLOW NESTED ROUTES : the use of this function is to allow nested routes. for example : if we want to post a review to a specific tour then we will use this function to allow nested routes, and then we will use the url of the tour to post a review to that specific tour.
    if (!req.body.tour) req.body.tour = req.params.tourId; // explain : this line of code means that if the body of the request does not contain the tour property then we will set the tour property to the tourId which is coming from the url. it is a hack to make sure that the user cannot manipulate the tour property in the body of the request. and we are doing this because we want to make sure that the user can only post a review to a specific tour.
    if (!req.body.user) req.body.user = req.user.id; // explain : this line of code means that if the body of the request does not contain the user property then we will set the user property to the id of the current user. it is a hack to make sure that the user cannot manipulate the user property in the body of the request. and we are doing this because we want to make sure that the user can only post a review to a specific tour. and this "id" is coming from the protect middleware which is running before this middleware.
    next();
}

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);