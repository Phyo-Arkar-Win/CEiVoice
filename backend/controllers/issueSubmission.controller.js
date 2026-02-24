import generateDraftTicket from "../services/ollama.service.js";
import sendEmail from "../services/email/email.service.js";

const handleIssueSubmission = async (req, res) => {
    const { email, issue } = req.body;
    if (!issue) {
        return res.status(400).json({ error: "Missing message in request body" });
    }
    try {
        await generateDraftTicket(issue);
        await sendEmail(email, issue);
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export default handleIssueSubmission;