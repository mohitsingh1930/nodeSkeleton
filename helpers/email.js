const nodemailer = require('nodemailer');
const ejs = require('ejs');
// const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(email, url, otp, userId) {
    this.to = email;
    this.userId = userId;
    // this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.otp = otp;
    this.from = `Team Kajneeti<${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production' && process.env.EMAIL_TRANSPORT !== 'mailtrap') {
      //sendGrid implementation.
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      // service: 'Gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      //Activate in gmail "less secure app" option
    });
  }

  async send(template, subject) {
    //1) Render HTML based on a ejs template.

    const html = await ejs.renderFile(
      `${__dirname}/../views/emails/${template}.ejs`,
      {
        firstName: this.firstName,
        url: this.url,
        otp: this.otp,
				userId: this.userId,
				candidateName: this.candidateName,
				candidatePassword: this.candidatePassword
        // subject,
      }
    );

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // text: htmlToText.fromString(html),
    };

    //3) Create a transport and send email.
    await this.newTransport().sendMail(mailOptions);
    // await transporter.sendMail(mailOptions);
  }

  async sendWelcome(candidateName, candidatePassword) {

		console.log("send welcome")
		const html = await ejs.renderFile(
      `${__dirname}/../views/emails/welcome.ejs`,
      {
				candidateName,
				candidatePassword
      }
    );

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: "New candidate",
      html,
      // text: htmlToText.fromString(html),
		};

		console.log("Mail options: ", mailOptions)

    //3) Create a transport and send email.
    let result = await this.newTransport().sendMail(mailOptions);
		console.log("email result", result)

  }

  async sendPasswordReset() {
    await this.send(
      'resetPassword',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
