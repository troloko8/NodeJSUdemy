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
            return 1
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
            from: this.from,
            to: this.to,
            subject,
            text: convert(html),
            // text: htmlToText.htmlToText(html),
            html
        }

        // 3) Create a treansport and send email
        await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome(template, subject) {
        await this.send('welcome', 'Welcome to the Natours Family')
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