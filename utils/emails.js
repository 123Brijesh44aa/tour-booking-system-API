const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // 1) create a transporter
    const transporter = nodemailer.createTransport(
        /**
         * we are using mailtrap.io to send emails.
         * we have created an account on mailtrap.io, and then we have created a new inbox. then we have copied the username and password from the mailtrap.io, and then we have pasted it here. we have also copied the host and port from the mailtrap.io, and then we have pasted it here. it is used to send emails in development mode.
         */
        {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }


        }
    )

    // 2) define the email options
    const mailOptions = {
        from: "Brijesh Mourya <hello@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
    }

    // 3) actually send the email with nodemailer
    await transporter.sendMail(mailOptions); // this will return a promise, so we have to use await here.
    
}


module.exports = sendEmail;