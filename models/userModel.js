const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: [true, "Please tell us your name"]
        },
        email: {
            type: String,
            require: [true, "Please enter your email"],
            validate: [validator.isEmail, "Please enter a valid email"],
            unique: true
        },
        photo: String,
        role: {
            type: String,
            enum: ["user", "guide", "lead-guide", "admin"],
            default: "user"
        },
        password: {
            type: String,
            require: [true, "Please enter your password"],
            minLength: 8,
            select: false // it will be saved in the database but it will not be shown in the output when we will get the data from the database. it is always a good idea to hide the password from the output. because if someone gets access to our database then he will be able to see the password of all the users. so it is always a good idea to hide the password from the output.
        },
        passwordConfirm: {
            type: String,
            require: [true, "Please Confirm your password"],
            validate: {
                validator: function (el) {
                    // this will only work on CREATE and SAVE
                    return el === this.password; // this will return true if the value of passwordConfirm is equal to the value of this.password
                },
                message: "Password are not the same"
            }
        },
        passwordChangedAt: Date, // this will be used to check if the user changed the password after the token was issued or not
        passwordResetToken: String, // this will be used to reset the password
        passwordResetExpires: Date, // this means that the password reset token will expire after some time for security reasons
        active: {
            type: Boolean,
            default: true,
            select: false // this means that this field will not be shown in the output when we will get the data from the database.
        }
    }
);


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // this means that if the password is not modified then return next() and then exit from this function. will it work on create? yes it will work on create because when we create a new document then the password will be modified. will it work on update? no it will not work on update because when we update a document then the password will not be modified. but why it won't work on update? because when we update a document then we only update the name, email and photo. we don't update the password.

    // hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 8);
    // delete passwordConfirm filed
    this.passwordConfirm = undefined;

    next();

});


userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});


// QUERY MIDDLEWARE :
userSchema.pre(/^find/, function (next) {
    // this points to the current query
    // this will run before every find query
    this.find({active: {$ne: false}}); // this will show only those documents which have active field equal to true.
    next();
})


// INSTANCE METHOD :

// this method will be available on all the documents of the collection. we will use this method to compare the password entered by the user with the password stored in the database.
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword); // this will return true if the password entered by the user is equal to the password stored in the database.
}

// Check if the user changed the password after the token was issued or not
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) { // JWTTimeStamp is the time when the token was issued

    /**
     * EXPLAIN THE WHOLE APPROACH :
     * we will check if the passwordChangedAt field is present or not. if it is present then we will check if the passwordChangedAt field is greater than the JWTTimeStamp or not. if it is greater than the JWTTimeStamp then it means that the user changed the password after the token was issued. if it is not greater than the JWTTimeStamp then it means that the user did not change the password after the token was issued.
     */

    if (this.passwordChangedAt) {
        // JWTTimeStamp is in seconds and passwordChangedAt is in milliseconds, so we have to convert the passwordChangedAt to seconds
        const changedTimeStamp = parseInt((this.passwordChangedAt.getTime() / 1000), 10);
        return changedTimeStamp > JWTTimeStamp; // TRUE MEANS CHANGED
    }

    // FALSE MEANS NOT CHANGED
    return false;
}


userSchema.methods.createPasswordResetToken = function () {
    /**
     * EXPLAIN THE WHOLE APPROACH :
     * we will create a random string of 32 characters, and then we will encrypt it, and then we will send it to the user. and then we will save the encrypted string in the database. and then when the user will send the encrypted string to the server then we will decrypt it, and then we will compare it with the encrypted string stored in the database. if both the strings are equal then we will allow the user to change the password. and then we will delete the encrypted string from the database.
     */
    const resetToken = crypto.randomBytes(32).toString("hex"); // this will generate a random string of 32 characters
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex"); // this will encrypt the resetToken string, and then we will save the encrypted string in the database.
    console.log({resetToken}, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // this means that the password reset token will expire after 10 minutes
    return resetToken; // this will be sent to the user, we will send the unencrypted token through email.
}

const User = mongoose.model("User", userSchema);

module.exports = User;