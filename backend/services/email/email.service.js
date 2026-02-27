import nodemailer from "nodemailer";
import { ticketEmailTemplate } from "./emailTemplate.js";

const getTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendEmail = async (email, issue) => {
    const transporter = getTransporter();
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Confirmation of Issue Report",
        html: ticketEmailTemplate(issue)
    }
    await transporter.sendMail(mailOptions);
}

export default sendEmail;