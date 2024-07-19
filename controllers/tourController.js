const Tour = require("./../models/tourModel.js");
// const APIFeatures = require("./../utils/apiFeatures.js");
const factory = require("./handlerFactory.js");


exports.aliasTopTours = (req, res, next) => {

    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";
    next();
}


// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8")
// go one directory back using ".." because __dirname will return : [ E:\\node_express_mongo\\learn_express\\natours_api\\routes\ ]
// and we know that tours-simple.json file is not in the routes directory that why we go back one directory which is dev-data, otherwise
// we will get "no such file or directory" error.
// );

// Creating a Middleware for checking if id is not greater than tours.length
// exports.checkID = (req, res, next, val) => {
//     console.log(`Tour ID is :: ${val}`);
// if (req.params.id * 1 > tours.length) {
//     return res.status(404).json(
//         {
//             status: "Fail",
//             message: "Invalid ID"
//         }
//     );
// }
//     next();
// };


// Creating a Middleware for checking if the body contains name and price property in it
// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json(
//             {
//                 status: "Failed",
//                 message: "Missing Name OR Price"
//             }
//         );
//     }
//     next()
// }


exports.getAllTours = factory.getAll(Tour);
// ROUTE HANDLERS: GET ALL TOURS :
// exports.getAllTours = async (req, res) => {
//     try {
//         console.log(req.query);
//
//         // BUILD QUERY
//         // // 1) Simple Filtering
//         // const queryObj = {...req.query}; // ... is the spread operator which will create a new object from the req.query object
//         // const excludedFields = ["page", "sort", "limit", "fields"];
//         // excludedFields.forEach(el => delete queryObj[el]); // this will delete all the fields from the queryObj object which are present in the excludedFields array.
//         //
//         // /**
//         //  * const tours = await Tour.find(queryObj);
//         //  *
//         //  * // this find method will return an array of all the documents. and this find method will return a query object which we can chain with other methods. and this find method will return all the documents which matches the queryObj object. and if we pass an empty object then it will return all the documents.
//         //  */
//         //
//         //
//         //     // 2) Advanced Filtering
//         //
//         // let queryStr = JSON.stringify(queryObj); // this will convert the queryObj object to JSON string
//         // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // this will replace all the gte, gt, lte, lt with $gte, $gt, $lte, $lt
//         // console.log(JSON.parse(queryStr)); // this will convert the JSON string to JSON object
//         // let query = Tour.find(JSON.parse(queryStr));
//
//         // // 3. SORTING
//         // if (req.query.sort) {
//         //     const sortBy = req.query.sort.split(",").join(" "); // this will first split the string by comma and then join the string by space
//         //     console.log(sortBy);
//         //     query = query.sort(sortBy); // this will sort the tours according to the query.sort
//         //     // for example if we want to sort the tours according to the price then we will pass this query string in the url : [ http://localhost:3000/api/v2/tours?sort=price ] and this will sort the tours according to the price in ascending order.
//         //     // and if we want to sort the tours according to the price in descending order then we will pass this query string in the url : [ http://localhost:3000/api/v2/tours?sort=-price ] and this will sort the tours according to the price in descending order.
//         // } else {
//         //     query = query.sort("-createdAt"); // this will sort the tours according to the createdAt in descending order.
//         // }
//
//
//         // // 4. FIELD LIMITING
//         // // : field limiting means that we can limit the fields which we want to show in the response. the advantage of this is that the bandwidth will be saved and the response will be faster. and we can do this by passing the query string in the url like this : [ http://localhost:3000/api/v2/tours?fields=name,price,duration,difficulty ] and this will only show the name, price, duration, difficulty fields in the response.
//         //
//         // if (req.query.fields) {
//         //     const fields = req.query.fields.split(",").join(" ");
//         //     query = query.select(fields);
//         // } else {
//         //     query = query.select("-__v"); // this will exclude the __v field from the response
//         // }
//
//         // // 5. PAGINATION
//         // // : pagination means that we can limit the number of documents which we want to show in the response. and we can do this by passing the query string in the url like this : [ http://localhost:3000/api/v2/tours?page=2&limit=10 ] and this will show the 10 documents in the response which are on the 2nd page.
//         // const page = req.query.page * 1 || 1; // this will convert the string to number and if the page query string is not present then it will set the page to 1
//         // const limit = req.query * 1 || 100; // this will convert the string to number and if the limit query string is not present then it will set the limit to 100
//         // const skip = (page - 1) * limit;  // this will calculate the number of documents which we have to skip i.e. if the page is 2 and limit is 10 then we have to skip 10 documents which are on the 1st page.
//         // query = query.skip(skip).limit(limit);
//         //
//         // if (req.query.page) {
//         //     const numTours = await Tour.countDocuments(); // this will count the number of documents in the tours collection
//         //     if (skip >= numTours) throw new Error("This page does not exit");
//         // }
//
//         // EXECUTE QUERY
//         const features = new APIFeatures(Tour.find(), req.query)
//             .filter()
//             .sort()
//             .limitFields()
//             .paginate(0);
//         const tours = await features.query; // this will return all the tours which matches the JSON.parse(queryStr) object
//
//
//         /**
//          * const tours = await Tour.find(); // this find method will return an array of all the documents.
//          */
//
//
//         /**
//          * const tours = await Tour.find()
//          *     .where("duration")
//          *     .equals(5)
//          *     .where("difficulty")
//          *     .equals("easy"); // Method 2.  this will return all the tours with duration 5 and difficulty easy
//          */
//
//         res.status(200).json(
//             {
//                 status: "success",
//                 results: tours.length,
//                 data: {
//                     tours
//                 }
//             }
//         );
//     } catch (e) {
//         res.status(404).json(
//             {
//                 status: "Fail",
//                 message: e.message
//             }
//         )
//     }
// }


exports.createTour = factory.createOne(Tour);
// exports.createTour = async (req, res) => {
//     try {
//
//         const newTour = await Tour.create(req.body);
//         res.status(201).json(
//             {
//                 status: "success",
//                 data: {
//                     tour: newTour
//                 }
//             }
//         );
//     } catch (e) {
//         res.status(404).json(
//             {
//                 status: "Fail",
//                 message: e.message
//             }
//         )
//     }
// }


exports.getTour = factory.getOne(Tour, {path: "reviews"});
// exports.getTour = async (req, res) => {
//     try {
//
//
//         /**
//          * these [ /:id/:x/:y ] are parameters and all the parameters are required,
//          * if we want to make parameter optional then we have to do this : [ /:id/:x/:y? ], here y is an optional parameter
//          * console.log(req.params);
//          *
//          * const id = req.params.id * 1; // here we are converting string id to int id
//          * const tour = tours.find(element => element.id === id)
//          */
//
//
//         const tour = await Tour.findById(req.params.id).populate("reviews");
//         // populate method is used to populate the guides field with the user documents. and this populates method will return a query object which we can chain with other methods. and this populates method will return all the documents which matches the queryObj object. and if we pass an empty object then it will return all the documents.
//         // Tour.findOne({_id: req.params.id})
//
//         if (!tour) {
//             return res.status(404).json(
//                 {
//                     status: "Fail",
//                     message: "Invalid ID"
//                 }
//             )
//         }
//
//         res.status(200).json(
//             {
//                 status: "Success",
//                 data: {
//                     tour
//                 }
//             }
//         )
//     } catch (e) {
//         res.status(404).json(
//             {
//                 status: "Fail",
//                 message: e.message
//             }
//         )
//     }
// }


exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = async (req, res) => {
//     try {
//
//         const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//             new: true, // this will return the new updated document
//             runValidators: true // this will run all the validators again
//         })
//         res.status(200).json(
//             {
//                 status: "success",
//                 data: {
//                     tour: updatedTour // this will return the new updated document
//
//                 }
//             }
//         )
//     } catch (e) {
//         res.status(404).json(
//             {
//                 status: "Fail",
//                 message: e.message
//             }
//         )
//     }
// }


exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = async (req, res) => {
//     try {
//         const tour = await Tour.findByIdAndDelete(req.params.id);
//         if (!tour) {
//             return res.status(404).json(
//                 {
//                     status: "Fail",
//                     message: "Invalid ID"
//                 }
//             )
//         }
//         res.status(204).json(
//             {
//                 status: "success",
//                 data: null
//             }
//         )
//     } catch (e) {
//         res.status(404).json(
//             {
//                 status: "Fail",
//                 message: e.message
//             }
//         )
//     }
// }


// AGGREGATION PIPELINE : MATCHING AND GROUPING :


exports.getTourStats = async (req, res) => {
    try {

        const stats = await Tour.aggregate(
            [
                {
                    $match: {ratingsAverage: {$gte: 4.5}}
                },
                {
                    $group: {
                        // _id: "$difficulty",
                        // _id: "$ratingsAverage",
                        _id: {$toUpper: "$difficulty"},
                        numRatings: {$sum: "$ratingsQuantity"},
                        numTours: {$sum: 1},
                        avgRating: {$avg: "$ratingsAverage"},
                        avgPrice: {$avg: "$price"},
                        minPrice: {$min: "$price"},
                        maxPrice: {$max: "$price"},
                    }
                },
                {
                    $sort: {avgPrice: 1} // this will sort the documents according to the avgPrice in ascending order
                },
                {
                    $match: {_id: {$ne: "EASY"}} // this will exclude the documents which have _id = EASY
                }
            ]
        )

        res.status(200).json(
            {
                status: "success",
                data: {
                    stats
                }
            }
        )

    } catch (e) {
        res.status(404).json(
            {
                status: "Fail",
                message: e.message
            }
        )
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {

        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates"
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-01`)
                    }
                }
            },
            {
                $group: {
                    _id: {$month: "$startDates"},
                    numTourStarts: {$sum: 1},
                    tours: {$push: "$name"}
                }
            },
            {
                $addFields: {month: "$_id"}
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {numTourStarts: -1}
            },
            {
                $limit: 12
            }
        ]);
        res.status(200).json(
            {
                status: "success",
                data: {
                    plan
                }
            }
        )

    } catch (e) {
        res.status(404).json(
            {
                status: "Fail",
                message: e.message
            }
        )
    }
}

// explanation : aggregation pipeline is basically a way of displaying the data in a more complex way. and we can do this by using the aggregate method.
// and this aggregate method takes an array of stages.
// and each stage is an object.
// and each object is a certain operation that we want to perform on the data.
// and the data will then pass through these stages one by one in the order that we define them.
// and each stage can take some options.
//
// and the first stage that we will use is the match stage. and this match stage will basically filter out the documents.
//
// and the second stage that we will use is the group stage. and this group stage will basically group the documents together using some accumulator.
//
// and the third stage that we will use is the sort stage. and this sort stage will basically sort the documents.
//
// and the fourth stage that we will use is the project stage.
//
// and this project stage will basically project the fields.
//
// example :
//        if we want to display the average price of all the tours then we can do this by using the aggregate method. and this aggregate method will return a query object which we can chain with other methods. and this aggregate method will return an array of all the documents which matches the queryObj object. and if we pass an empty object then it will return all the documents.


// GEO SPATIAL QUERIES : FINDING TOURS WITHIN A CERTAIN DISTANCE FROM A CERTAIN POINT : /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/-40,45/unit/mi

exports.getToursWithin = async (req, res) => {
    try {
        const {distance, latlng, unit} = req.params;
        const [lat, lng] = latlng.split(",");
        const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1; // 3963.2 is the radius of the earth in miles and 6378.1 is the radius of the earth in kilometers , and radius is the distance between the center point and the edge of the circle.

        if (!lat || !lng) {
            return res.status(400).json(
                {
                    status: "Failed",
                    message: "Please provide latitude and longitude in the format lat,lng."
                }
            )
        }
        const tours = await Tour.find(
            {
                startLocation: {
                    $geoWithin: {
                        $centerSphere: [
                            [lng, lat], // this is the center point
                            radius
                        ]
                    }
                }
            }
        );
        res.status(200).json(
            {
                status: "Success",
                results: tours.length,
                data: {
                    data: tours
                }
            }
        )
    } catch (e) {

    }
}


exports.getDistances = async (req, res) => {
    try {
        const {latlng, unit} = req.params;
        const [lat, lng] = latlng.split(",");
        if (!lat || !lng) {
            return res.status(400).json(
                {
                    status: "Failed",
                    message: "Please provide latitude and longitude in the format lat,lng.",
                }
            )
        }
        const distances = await Tour.aggregate(
            [
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [lng * 1, lat * 1]
                        },
                        distanceField: "distance"
                    }
                }
            ]
        );
        res.status(200).json(
            {
                status: "Success",
                data: {
                    data: distances
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