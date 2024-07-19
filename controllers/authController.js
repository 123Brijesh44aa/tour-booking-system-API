const {promisify} = require("util");
const User = require("./../models/userModel.js");
const jwt = require("jsonwebtoken");
const sendEmail = require("./../utils/emails.js");
const crypto = require("crypto");


const signToken = (id) => {
    return jwt
        .sign(
            {id} // payload: means that the token will contain the id of the user
            , process.env.JWT_SECRET // secret: means that the token will be signed with this secret
            , {expiresIn: process.env.JWT_EXPIRES_IN} // options: means that the token will expire in 90 days
        );
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);

    // Remove the password from the output
    user.password = undefined;

    res.status(statusCode).json(
        {
            status: "Success",
            token,
            data: {
                user
            }
        }
    )
}


exports.signup = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        createSendToken(newUser, 201, res);
    } catch (e) {
        res.status(404).json(
            {
                status: "Failed",
                message: e.message
            }
        )
    }
}


exports.login = async (req, res) => {
    try {

        const {email, password} = req.body;
        /**
         * {email,password} means that we are destructuring the email and password from req.body. this is the same as const email = req.body.email; const password = req.body.password; destructuring is a new feature in ES6 which means that we can extract multiple properties from an object into variables in a single statement. this is the same as const email = req.body.email; const password = req.body.password;
         */

        // 1) check if email and password exist
        if (!email || !password) {
            return res.status(400).json(
                {
                    status: "Failed",
                    message: "Please provide email and password"
                }
            )
        }

        // 2) check if user exists && password is correct
        const user = await User.findOne({email}).select("+password"); // we are using select("+password") because we have set select: false in the password field in the userModel.js file. so we have to use select("+password") to select the password field. if we don't use select("+password") then the password field will not be selected, and then we will not be able to compare the password with the passwordConfirm field.
        const correct = await user.correctPassword(password, user.password);

        if (!user || !correct) {
            return res.status(401).json( // 401 means unauthorized
                {
                    status: "Failed",
                    message: "Incorrect email or password"
                }
            )
        }

        // 3) if everything is ok, send token to client
        createSendToken(user, 200, res);

    } catch (e) {
        res.status(404).json(
            {
                status: "Login Failed",
                message: e.message
            }
        )
    }
}


exports.protect = async (req, res, next) => {
    try {

        // 1) Getting token and check if it's there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }


        if (!token) {
            return res.status(401).json( // 401 means unauthorized
                {
                    status: "Failed",
                    message: "You are not logged in! Please log in to get access"
                }
            )
        }

        // 2) Verification token

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        /**
         * promisify(jwt.verify) will return a function which will return a promise. so we have to call that function with the token and the secret. and then we have to await for the promise to resolve. and then we have to store the result in the decoded variable.
         * promisify() means that we are converting a callback based function into a promise based function.
         * explain jwt.verify() : it is used to verify the token. it takes two arguments. the first argument is the token and the second argument is the secret. it will return the payload if the token is valid. and it will return an error if the token is invalid.
         */
        console.log(decoded);

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json(
                {
                    status: "Error",
                    message: "The user belonging to this token does no longer exist"
                }
            )
        }

        // 4) Check if user changed password after the token was issued

        if (currentUser.changedPasswordAfter(decoded.iat)) {  // iat means the time when the token was issued
            return res.status(401).json(
                {
                    status: "Error",
                    message: "User recently changed Password! Please log in again"
                }
            )
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        // we are storing the user in the req object so that we can use it in the next middleware function
        // but how the previous middleware is connected to the next middleware ?   because we are using next() in the previous middleware function. so when we call next() in the previous middleware function then it will call the next middleware function. and then the next middleware function will be able to access the user from the req object.
        next(); // next leads us to the next middleware function


    } catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json(
                {
                    status: "Error",
                    message: "Your token has expired! Please log in again"
                }
            )
        } else if (error.name === "JsonWebTokenError") {
            res.status(401).json(
                {
                    status: "Error",
                    message: "Invalid Token. Please log in again"
                }
            )
        } else {
            res.status(401).json(
                {
                    status: "Error",
                    message: "Something went wrong! Please try again later or log in again",
                    error: error
                }
            )
        }
    }

}


exports.restrictTo = (...roles) => {
    // what is (...roles) ?
    // it means that we can pass multiple arguments to this function. and then all the arguments will be stored in the roles array.
    return (req, res, next) => {
        // roles ["admin", "lead-guide"]. role="user"
        if (!roles.includes(req.user.role)) {
            return res.status(403).json( // 403 means forbidden which means that the user is not allowed to perform this action
                {
                    status: "Error",
                    message: "You do not have permission to perform this action"
                }
            )
        }
        next();
    }
}


exports.forgotPassword = async (req, res) => {
    // 1) Get user based on POSTed email address
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(404).json(
            {
                status: "Error",
                message: "There is no user with email address"
            }
        )
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save(validateBeforeSave = false); // we are passing validateBeforeSave = false because we don't want to validate the user before saving it to the database. because we are only saving the passwordResetToken and passwordResetExpires fields to the database. we are not saving the password field to the database. so we don't need to validate the user before saving it to the database.

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/api/v2/users/resetPassword/${resetToken}`; // we are using req.protocol because we want to use the same protocol as the current request. if the current request is http then we want to use http. if the current request is https then we want to use https. we are using req.get("host") because we want to use the same host as the current request. if the current request is localhost:3000 then we want to use localhost:3000. if the current request is natours.com then we want to use natours.com. we are using /api/v2/users/resetPassword/${resetToken} because we want to send the reset token to the user's email address, after that the user will click on the link in the email, and then he will be redirected to the reset password page. and then he will enter the new password, and then he will reset the password.
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}. \nIf you didn't forget your password, please ignore this email!`;

    try {

        await sendEmail(
            {
                email: user.email,
                subject: "Your password reset token (valid for 10 min)",
                message: message
            }
        );

        res.status(200).json(
            {
                status: "Success",
                message: "Token send to email!"
            }
        )
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validationBeforeSave: false});

        return res.status(500).json(
            {
                status: "Error",
                message: "There was an error sending the email. Try again later!"
            }
        )
    }
}

exports.resetPassword = async (req, res) => {
    try {

        // 1) Get user based on the token
        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex"); // this will encrypt the token, and then we will compare it with the encrypted token stored in the database.

        // now we will find the user based on the encrypted token stored in the database.
        const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}}); // $gt means greater than. so we are checking if the passwordResetExpires field is greater than the current time or not. if it is greater than the current time then it means that the token has not expired yet. if it is not greater than the current time then it means that the token has expired. eg: passwordResetExpires: 07:00:00 and Date.now(): 07:30:00. so 07:00:00 is less than 07:30:00. so the token has expired. eg: passwordResetExpires: 07:30:00 and Date.now(): 07:00:00. so 07:30:00 is greater than 07:00:00. so the token has not expired yet.

        // 2) If token has not expired, and there is user, set the new password
        if (!user) {
            return res.status(400).json(
                {
                    status: "Error",
                    message: "Token is invalid or has expired"
                }
            )
        }

        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        // 3) Update changedPasswordAt property for the user


        // 4) Log the user in, send JWT
        createSendToken(user, 200, res);

    } catch (error) {
        res.status(500).json(
            {
                status: "Error",
                message: error.message
            }
        )
    }
}


// Updating the password of the logged-in user

// jab hum password ko update karte ha to pahle usko apna pahle wala password enter karne ke liye bolte ha aur jab hum password ko update karte ha to hume 3 cheeze dhyan me rakhni hoti ha. 1) hume pahle wala password enter karne ke liye bolna hota ha. 2) hume pahle wala password aur naya password same nahi hona chahiye. 3) hume naya password aur naya passwordConfirm same hona chahiye.

exports.updatePassword = async (req, res, next) => {
    try {

        // 1) Get user from collection
        const user = await User.findById(req.user.id).select("+password");

        // 2) Check if Posted password is correct
        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            // if the password entered by the user is not equal to the password stored in the database then we will return an error.
            return res.status(401).json(
                {
                    status: "Error",
                    message: "Your current password is wrong"
                }
            )
        }

        // 3) if so, update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();

        // User.findByIdAndUpdate will not work as intended!

        // 4) Log user in, send JWT
        createSendToken(user, 200, res);

    } catch (error) {
        res.status(500).json(
            {
                status: "Error",
                message: error.message
            }
        )
    }

}














