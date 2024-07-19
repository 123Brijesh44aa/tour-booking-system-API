const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
const Tour = require("./../../models/tourModel.js");
const User = require("./../../models/userModel.js");
const Review = require("./../../models/reviewModel.js");
dotenv.config({path: "./config.env"});

const DB_PASSWORD = process.env.DATABASE_PASSWORD;
const DB = process.env.DATABASE.replace("<DATABASE_PASSWORD>", DB_PASSWORD);


mongoose.connect(DB, {       // this connect() method returns a Promise
    useNewUrlParser: true,
    useUnifiedTopology: true

    // Deprecated
    // useCreateIndex: true,
    // useFindAndModify: false
})
    .then(() => {
        console.log("DB connection successful!");
    });


// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users);
        await Review.create(reviews);
        console.log("Data Successfully Loaded!");
    } catch (e) {
        console.log(e);
    }
    process.exit(); // this will exit the application

}

// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data Successfully Deleted!");
    } catch (e) {
        console.log(e);
    }
    process.exit(); // this will exit the application

}

if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}
console.log(process.argv);