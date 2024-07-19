const User = require("./../models/userModel.js");
const factory = require("./handlerFactory.js");


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(element => {
        if (allowedFields.includes(element))
            newObj[element] = obj[element];
    });
    return newObj;
};


exports.getMe = (req, res, next) => {
    req.params.id = req.user.id; // this req.user.id is coming from the protect middleware which is running before this middleware.
    // and this getMe is used to get the current user data who are logged in.
    next();
}

// ROUTE HANDLERS:

// UPDATE ME: UPDATE THE CURRENT USER DATA
exports.updateMe = async (req, res, next) => {
    try {

        // 1) Create error if user Posts password data
        if (req.body.password || req.body.passwordConfirm) {
            return res.status(400).json(
                {
                    status: "Error",
                    message: "This route is not for password updates. Please use /updateMyPassword"
                }
            )
        }


        // 2) Filtered out unwanted fields names that are not allowed to be updated
        const filteredBody = filterObj(req.body, "name", "email");

        // 3) Update user document
        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            // filteredBody is the object which contains the fields which we want to update
            new: true, // this means that the updated document will be returned
            runValidators: true
        })

        res.status(200).json(
            {
                status: "Success",
                data: {
                    user: updatedUser
                }
            }
        )
    } catch (e) {
        res.status(400).json(
            {
                status: "Error",
                message: e.message
            }
        )
    }
}


//  DELETE ME: DEACTIVATE THE USER ACCOUNT
exports.deleteMe = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {active: false});

        res.status(204).json(
            {
                status: "Success",
                data: null
            }
        )
    } catch (e) {
        res.status(400).json(
            {
                status: "Error",
                message: e.message
            }
        )
    }
}


exports.createUser = (req, res) => {
    res.status(500).json(
        {
            status: "error",
            message: "This route is not defined! Please use /signup instead"
        }
    );
};


exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
// don't update passwords with this
exports.updateUser = factory.updateOne(User); // only administrators can update the user data

exports.deleteUser = factory.deleteOne(User); // only administrators can delete the user data

