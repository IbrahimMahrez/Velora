require("dotenv").config();

const nodemailer = require("nodemailer");

console.log("📧 EMAIL CONFIG");
console.log("USER_EMAIL:", process.env.USER_EMAIL);
console.log("USER_APP EXISTS:", Boolean(process.env.USER_APP));

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_APP,
    },

    tls: {
        rejectUnauthorized: false,
    },
});

transporter.verify((error) => {
    if (error) {
        console.error(
            "❌ SMTP CONNECTION FAILED:",
            error.message
        );
    } else {
        console.log("✅ SMTP SERVER IS READY");
    }
});

const sendEmail = async (to, subject, html) => {
    console.log("📧 Sending email...");
    console.log("📨 To:", to);

    const info = await transporter.sendMail({
        from: `"Velora" <${process.env.USER_EMAIL}>`,
        to,
        subject,
        html,
    });

    console.log(
        "✅ Email sent successfully:",
        info.messageId
    );

    return info;
};

module.exports = sendEmail;