// handlerFactory.js - Factory function for creating handlers

// the handlerFactory function will return a controller function which will be used as a controller function in the route handler.

// for example : if we have a route handler like this : router.route("/").get(tourController.getAllTours) then we will replace the tourController.getAllTours with the handlerFactory.getAll(Model) function.

// we have to pass the Model as an argument to the handlerFactory function. because we want to use the Model in the handlerFactory function.

// this will work for all the routes which are using the getAll function. for example : router.route("/").get(tourController.getAllTours) or router.route("/").get(userController.getAllUsers) or router.route("/").get(reviewController.getAllReviews)

// for example , if we want to delete a tour or a user or a review then we will use the deleteOne function of the handlerFactory function. for example : router.route("/:id").delete(tourController.deleteTour) or router.route("/:id").delete(userController.deleteUser) or router.route("/:id").delete(reviewController.deleteReview).


// we will use these handler factory functions in the tourController.js file and in the userController.js file and in the reviewController.js file. because we want to keep our code DRY ( Don't Repeat Yourself ).


const APIFeatures = require("./../utils/apiFeatures.js");

exports.deleteOne = (Model) =>
    async (req, res, next) => { // explain : this function will return a controller function which will be used as a controller function in the route handler. and this function will delete a document from the database.
        try {
            const doc = await Model.findByIdAndDelete(req.params.id);
            if (!doc) {
                return res.status(404).json(
                    {
                        status: "Failed",
                        message: "No document found with that ID"
                    }
                )
            }
            res.status(204).json(
                {
                    status: "Success",
                    data: null
                }
            )
        } catch (e) {
            return res.status(400).json(
                {
                    status: "Failed",
                    message: e.message
                }
            )
        }
    }


exports.updateOne = (Model) =>
    async (req, res, next) => {
        try {
            const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });
            if (!doc) {
                return res.status(404).json(
                    {
                        status: "Failed",
                        message: "No document found with that ID"
                    }
                )
            }
            res.status(200).json(
                {
                    status: "Success",
                    data: {
                        data: doc
                    }
                }
            )
        } catch (e) {
            return res.status(400).json(
                {
                    status: "Failed",
                    message: e.message
                }
            )
        }
    }


exports.createOne = (Model) =>
    async (req, res, next) => {
        try {
            const doc = await Model.create(req.body);
            res.status(201).json(
                {
                    status: "Success",
                    data: {
                        data: doc
                    }
                }
            )
        } catch (e) {
            return res.status(400).json(
                {
                    status: "Failed",
                    message: e.message
                }
            )
        }
    }

exports.getOne = (Model, popOptions) =>
    async (req, res, next) => {
        try {
            let query = Model.findById(req.params.id);
            if (popOptions) query = query.populate(popOptions);
            const doc = await query;
            if (!doc) {
                return res.status(404).json(
                    {
                        status: "Failed",
                        message: "No document found with that ID"
                    }
                )
            }
            res.status(200).json(
                {
                    status: "Success",
                    data: {
                        data: doc
                    }
                }
            )
        } catch (e) {
            return res.status(400).json(
                {
                    status: "Failed",
                    message: e.message
                }
            )
        }
    }


exports.getAll = (Model) =>
    async (req, res, next) => {
        // THIS IS A NESTED GET ENDPOINT : this means that we are getting all the reviews of a specific tour. and this is a nested get endpoint because we are getting all the reviews of a specific tour from the url of that specific tour. for example : if we have an url like this : /api/v1/tours/858sa4md333/reviews then we can access the tourId from the url in the reviewRoutes.js file.
        // for Tours, we don't need to filter  but for reviews we need filter
        try {
            let filter = {};
            if (req.params.tourId) filter = {tour: req.params.tourId};
            const features = new APIFeatures(Model.find(filter), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();
            // const doc = await features.query.explain();
            const doc = await features.query;
            res.status(200).json(
                {
                    status: "Success",
                    results: doc.length,
                    data: {
                        data: doc
                    }
                }
            )
        } catch (e) {
            return res.status(400).json(
                {
                    status: "Failed",
                    message: e.message
                }
            )
        }
    }
