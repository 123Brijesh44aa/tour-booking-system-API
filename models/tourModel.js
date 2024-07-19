const mongoose = require("mongoose");
const slugify = require("slugify");
// const User = require("./userModel.js");


const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "A tour must have a name"],
            unique: true,
            maxLength: [40, "A tour name must have less or equal than 40 characters"],
            minLength: [10, "A tour name must have more or equal than 10 characters"],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, "A tour must have a duration"]
        },
        maxGroupSize: {
            type: Number,
            required: [true, "A tour must have a group size"]
        },
        difficulty: {
            type: String,
            required: [true, "A tour must have a difficulty"],
            enum: {
                values: ["easy", "medium", "difficult"],
                message: "Difficulty is either: easy, medium, difficult"
            }
        },
        ratingsAverage: {
            type: Number,
            default: 4.4,
            min: [1, "Rating must be above 1.0"],
            max: [5, "Rating must be below 5.0"],
            set: val => Math.round(val * 10) / 10 // eg: 4.666666666666667 => 46.66666666666667 => 47 => 4.7
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, "A tour must have a price"]
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // this function only works on document creation and not on document update
                    // this only points to the current document on NEW document creation
                    return val < this.price; // this will return true if the priceDiscount is less than the price
                    // priceDiscount should always be less than the price
                },
                message: "Discount price ({VALUE}) should be below regular price"
            }
        },
        summary: {
            type: String,
            trim: true,
            required: [true, "A tour must have a description"]
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, "A tour must have a cover image"]
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false // this will not show the createdAt field in the response
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            /**
             * GeoJSON :
             * GeoJSON is a format for encoding a variety of geographic data structures. A GeoJSON object may represent a geometry, a feature, or a collection of features. GeoJSON supports the following geometry types: Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, and GeometryCollection.
             */
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number], // longitude first and then latitude
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: "Point",
                    enum: ["Point"]
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        // guides: Array
        guides: [
            {
                // this is called child referencing, here we are referencing the user documents inside the tour document
                type: mongoose.Schema.ObjectId,
                ref: "User"
            }
        ],
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    } // toJSON and toObject are used to show the virtual properties in the response
);

// tourSchema.index({price:1});

tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});

tourSchema.index({startLocation: "2dsphere"}); // this is used to create a geospatial index on the startLocation field. and this is used to calculate the distance between two points on the earth. and this is used to find the tours within a certain distance from a certain point on the earth.

// this will create an index on the price field in ascending order, it is used to improve the performance of the query, and it is also called single field index.


// VIRTUAL PROPERTIES

// -  not persisted in the database
// virtual properties are not stored in the database but are calculated using some other value

tourSchema.virtual("durationWeeks").get(function () {
    return this.duration / 7; // here we did not use the arrow function because we need the keyword to point to the current document and not the current function
});


// VIRTUAL POPULATE
tourSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() but not on .insertMany()
// it is also called pre save hooks which means that it will run before the document is saved to the database and not before the request is sent to the server

tourSchema.pre("save", function (next) {
    this.slug = slugify(this.name, {lower: true})// "this" points to the current document, this.slug is the slug property of the current document, and it is used to store the slugified version of the name property of the current document.
    next();
})


// Modelling Tour Guides: Embedding
// tourSchema.pre("save", async function (next) {
//     /**
//      * explanation:
//      *
//      * only works on document creation and not on document update.
//      *
//      * this.guides is an array of user ids. and we want to replace this array of user ids with an array of user objects. so we will use the map method to loop over the array of user ids, and then we will use the findById method to find the user object with the given id. and then we will store the user object in the guides array. and then we will use the await Promise.all method to wait for all the promises to resolve. and then we will store the result of the Promise.all method in the guides array.
//
//      * this function will run before the document is saved to the database and not before the request is sent to the server.
//      * we want to embed the user documents inside the tour document. and we are using reference documents in the user model because we want to store the tour ids inside the user document.
//      * when we create tour documents then we will store the user ids inside the guides array. and then we will use the populate method to populate the guides array with the user documents.
//      *
//      */
//
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })

// tourSchema.pre("save", function (next) {
//     console.log("Will save document...");
//     next();
// })
//
// tourSchema.post("save", function (doc, next) {
//     console.log(doc);
//     next();
// })


// QUERY MIDDLEWARE : runs before or after a certain query is executed, and it is also called pre find hooks. It is used to manipulate the query before it is executed. it will before the find query is executed and not before the request is sent to the server

tourSchema.pre(/^find/, function (next) { // this will run for all the find queries ( find, findOne, findOneAndUpdate, findOneAndDelete, etc. )
    // tourSchema.pre("find", function (next) { // this will run only for the find query and not for findOne query
    this.find({secretTour: {$ne: true}}); // it will return all the documents where the secretTour property is not equal to true

    this.start = Date.now();
    next();
})


tourSchema.pre(/^find/, function (next) {
    this.populate({ // this populates method will populate the guides array with the user documents
        path: "guides",
        select: "-__v -passwordChangedAt" // this means that this field will not be shown in the output when we will get the data from the database.
    })
    next();
})

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    // console.log(docs);
    next();
})


// AGGREGATION MIDDLEWARE : runs before or after an aggregation pipeline is executed, and it is also called pre aggregate hooks. It is used to manipulate the aggregation pipeline before it is executed. it will before the aggregation pipeline is executed and not before the request is sent to the server

// tourSchema.pre("aggregate", function (next) {
//     this.pipeline().unshift({$match: {secretTour: {$ne: true}}}); // this will add the $match stage at the beginning of the aggregation pipeline. this unshift method is used to add an element at the beginning of an array
//     console.log(this.pipeline());
//     next();
// })


const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;