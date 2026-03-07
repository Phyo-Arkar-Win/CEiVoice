import nodemailer from "nodemailer";
import { confirmationEmailTemplate } from "./confirmationEmail.js";
import { updateStatusEmailTemplate } from "./updateStatusEmail.js";

const getTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendConfirmationEmail = async (email, issue) => {
    const transporter = getTransporter();
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Confirmation of Issue Report",
        html: confirmationEmailTemplate(issue)
    }
    await transporter.sendMail(mailOptions);
}

export const sendStatusUpdateEmail = async (email, ticket) => {
    const transporter = getTransporter();
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Update on Your Ticket: ${ticket.title}`,
        html: updateStatusEmailTemplate(ticket)
    };
    await transporter.sendMail(mailOptions);
};

export default sendConfirmationEmail;