const express = require("express");
const userController = require("./../controllers/userController.js");
const authController = require("./../controllers/authController.js");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);

router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

router.use(authController.protect); // this is a middleware, and it will protect/authorize all the routes which are coming after this middleware. so this middleware will run first and then all the routes which are coming after this middleware will run .because the sequence of the middleware function is very important, and it matters the most. so now we can remove the authController.protect middleware from all the routes which are coming after this middleware.

router.route("/updateMyPassword").patch(authController.updatePassword);

router.get("/me", userController.getMe, userController.getUser);

router.route("/updateMe").patch(userController.updateMe);

router.route("/deleteMe").delete(userController.deleteMe);


router.use(authController.restrictTo("admin")); // now only admin can access all the routes which are coming after this middleware.

router.route("/")
    .get(userController.getAllUsers) // only admin can get all the users
    .post(userController.createUser); // only admin can create a new user

router.route("/:id")
    .get(userController.getUser) // only admin can get a specific user
    .patch(userController.updateUser) // only admin can update a specific user
    .delete(userController.deleteUser); // only admin can delete a specific user


module.exports = router;