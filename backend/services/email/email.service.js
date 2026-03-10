import nodemailer from "nodemailer";
import { confirmationEmailTemplate } from "./confirmationEmail.js";
import { updateNewEmailTemplate } from "./updateStatusEmail.js";

const getTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendConfirmationEmail = async (email, ticket) => {
    console.log(ticket)
    const transporter = getTransporter();
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Confirmation of Issue Report",
        html: confirmationEmailTemplate(ticket)
    }
    await transporter.sendMail(mailOptions);
}

export const sendUpdateEmail = async (email, ticket) => {
    let status = ticket.status;
    if (status === 'New' || status === 'Solved' || status === 'Failed') {
        const transporter = getTransporter();
        let template;
        if (status === 'New') {
            template = updateNewEmailTemplate(ticket);
        }
        else if (status === 'Solved') {
            template = updateSolvedEmailTemplate(ticket);
        }
        else if (status === 'Failed') {
            template = updateFailedEmailTemplate(ticket);
        }
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Update on Your Ticket: ${ticket.title}`,
            html: template
        };
        await transporter.sendMail(mailOptions);
    }
};


export default sendConfirmationEmail;