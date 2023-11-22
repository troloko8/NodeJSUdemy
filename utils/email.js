const nodemailer = require("nodemailer")

const sendEmail = async (options) => {
    // 1) Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            password: process.env.EMAIL_PASSWORD ,
        }
    })

    // 2) Define email options
    const mailOptions = {
        from: 'Nathan Titarman <nathan@natours.io>',
        to: options.email,
        subgect: options.subgect,
        text: options.message,
        html: '<div> </div>'

    }
    // 3) Send email

    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail