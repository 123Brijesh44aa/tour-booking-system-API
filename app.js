const express = require("express");
const app = express();
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const tourRouter = require("./routes/tourRoutes.js");
const userRouter = require("./routes/userRoutes.js");
const reviewRouter = require("./routes/reviewRoutes.js");


// MIDDLEWARES

// 1) GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet()); // helmet is a package which will set some http headers for security reasons

/**
 * Param Middleware :
 * Param Middleware is middleware that only runs for certain parameters
 */

// Using 3rd Party Middleware
// Development Logging
console.log("Environment is : " + process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Rate Limiting
const limiter = rateLimit( // limiter is a middleware which will limit the number of requests from a single IP
    {
        max: 100, // this means that a user can make 100 requests from the same IP in 1 hour,
        windowMs: 60 * 60 * 1000, // windowMs is used to specify the time in milliseconds
        message: "Too many requests from this IP, please try again in an hour!"
    }
)

app.use("/api", limiter); // this means that this limiter middleware will only apply to the routes which starts with /api


app.use(express.json({limit: "10kb"})); // this [express.json ] here is middleware. express.json() is a middleware that will modify the incoming request data into json format. and limit is used to limit the size of the data which is coming from the client. if the size of the data is greater than 10kb then it will not be accepted by the server.


// Data Sanitization against NoSQL query injection
app.use(mongoSanitize()); // this middleware will remove all the $ signs from the request data. because $ sign is used to write mongodb operators, and we don't want the user to write mongodb operators in the request data. so we will remove all the $ signs from the request data.

// Data Sanitization against XSS
app.use(xss()); // this middleware will remove all the malicious html code from the request data. protect from cross site scripting attacks.


// Prevent Parameter Pollution
app.use(hpp( // hpp stands for http parameter pollution
    {
        whitelist: ["duration", "ratingsQuantity", "ratingsAverage", "maxGroupSize", "difficulty", "price"]
    }
)) // this middleware will remove all the duplicate parameters from the request data. for example if we have a query like this : /api/v2/tours?sort=duration&sort=price then this middleware will remove the duplicate sort parameter from the request data. and it will only keep the last sort parameter .


// Serving Static Files using built in middleware of express
app.use(express.static(`${__dirname}/public`));

// Creating our own MiddleWare
// the Order of Middleware matters in node.js
// suppose if I put this middleware between the "api/v2/tours" and "api/v2/tours/:id" then this middleware will apply only on the "api/v2/tours" route , because the order of middleware matters the most.


// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers);
    next();
})

/**
 * WHAT IS MIDDLEWARE :
 * and middleware is basically a function that can modify the incoming request data
 * it's called middleware because it stands between,in the middle of the request and the response .
 * so it's just a step that the request goes through while its being processed.
 * and the step the requests go through, in this example
 * is simply that the data from the body is added to it.
 * so it's added to the request object by using this middleware.
 */

/**
 * app.get("/", (req, res) => {
 *     res.status(200).send({message: "Hello From the Server side", app: "Natours"});
 * });
 *
 * app.post("/", (req, res) => {
 *     res.send("You can post to this endpoint...");
 * });
 */


/**
 * HANDLING GET REQUESTS ( GETTING ALL TOURS FROM tours-simple.json file )
 * app.get("/api/v2/tours", getAllTours);
 *
 * HANDLING POST REQUESTS ( CREATING NEW TOUR AND STORING IT TO THE tours-simple.json FILE )
 * app.post("/api/v2/tours", createTour);
 *
 * RESPONDING TO URL PARAMETERS ( GETTING SINGLE TOUR USING ID )
 * app.get("/api/v2/tours/:id", getTour);
 *
 * HANDLING PATCH REQUESTS
 * app.patch("/api/v2/tours/:id", updateTour);
 *
 * HANDLING DELETE REQUESTS
 * app.delete("/api/v2/tours/:id", deleteTour);
 */


// Creating and Mounting Multiple Routers
app.use("/api/v2/tours", tourRouter);
app.use("/api/v2/users", userRouter);
app.use("/api/v2/reviews", reviewRouter);

app.all("*", (req, res) => {
    /**
     * this will run for all the http methods and the sequence of this middleware is very important because if we put this middleware at the top then it will run for all the routes and the routes which are below this middleware will not run.
     */
    res.status(404).json(
        {
            status: "Failed",
            message: `Can't find ${req.originalUrl} on this server!`
        }
    );

});

module.exports = app;



