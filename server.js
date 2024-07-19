const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});

const app = require("./app.js");

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

// console.log(process.env);

// SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});



