const nodemailer = require("nodemailer")
const pug = require("pug")
const { convert } = require("html-to-text")

module.exports = class Email {
    constructor(
        user,
        url        
    ) {
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.url = url
        this.from = `Nathan Titarman <${process.env.EMAIL_FROM}>`
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            })
        } else {
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            })
        }
    }

    // send the actual email
    async send(template, subject) {
        // 1) Render HTML based on a pug template
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject
            }
        )

        // 2) Define an email options
        const mailOptions = {
            from: process.env.NODE_ENV === 'production' ? process.env.SENDGRID_EMAIL_FROM : this.from,
            to: this.to,
            subject,
            text: convert(html),
            // text: htmlToText.htmlToText(html),
            html
        }

        // 3) Create a treansport and send email
        await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family')
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minuites)')
    }
}

// const sendEmail = async (options) => {
//     // 1) Create transporter
//     // const transporter = nodemailer.createTransport({
//     //     host: process.env.EMAIL_HOST,
//     //     port: process.env.EMAIL_PORT,
//     //     auth: {
//     //         user: process.env.EMAIL_USERNAME,
//     //         pass: process.env.EMAIL_PASSWORD
//     //     }
//     // })

//     // 2) Define email options
//     const mailOptions = {
//         from: `Nathan Titarman <${process.env.EMAIL_FROM}>`,
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//         html: '<div> </div>'
//     }


//     // 3) Send email
//     await transporter.sendMail(mailOptions)
// }

// module.exports = sendEmail