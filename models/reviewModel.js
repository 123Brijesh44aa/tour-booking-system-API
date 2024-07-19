const mongoose = require("mongoose");
const Tour = require("./tourModel.js");

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, "Review can not be empty"]
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: "Tour",
            required: [true, "Review must belong to a tour."]
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Review must belong to a user."]
        }
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)


reviewSchema.index({tour: 1, user: 1}, {unique: true}); // this means that a user can only write one review for a tour. and this is called compound indexing. and this is done to prevent duplicate reviews.


reviewSchema.pre(/^find/, function (next) {
    // this.populate(
    //     {
    //         path: "tour",
    //         select: "name"
    //     }
    // ).populate(
    //     {
    //         path: "user",
    //         select: "name photo"
    //     }
    // )

    this.populate(
        {
            path: "user",
            select: "name photo"
        }
    );

    next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    // explain this function : this function will calculate the average rating of the tour after a new review is created, and then it will save the average rating in the database.
    // but why we are passing the tourId
    const stats = await this.aggregate( // "this" represents the current model which is Review
        [
            {
                $match: {tour: tourId}
            },
            {
                $group: {
                    _id: "$tour",
                    nRating: {$sum: 1},
                    avgRating: {$avg: "$rating"}
                }
            }
        ]
    );
    console.log(stats);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.4
        })
    }

};

reviewSchema.post("save", function () {
    // this middleware is used to calculate the average rating of the tour after a new review is created
    // this points to current Review
    this.constructor.calcAverageRatings(this.tour);

});

// findByIdAndUpdate
// findByIdAndDelete

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.clone().findOne(); // here "this" points to the current query
    console.log(this.r);
    next()
});

reviewSchema.post(/^findOneAnd/, async function () {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
})

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;