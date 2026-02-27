import generateDraftTicket from "../services/ollama.service.js";
import sendEmail from "../services/email/email.service.js";
import User from "../models/user.js";

const handleIssueSubmission = async (req, res) => {
    const { email, issue } = req.body;
    let user = await User.findOne({ email });
    if (!issue) {
        return res.status(400).json({ error: "Missing message in request body" });
    }
    try {
        await generateDraftTicket(email, issue, user);
        await sendEmail(email, issue);
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export default handleIssueSubmission;