import axios from 'axios';
import { Ollama } from 'ollama';

export const generateDraftTicket = async (req, res) => {
    try {
        const { message } = req.body;

        const prompt = "You are supposed to analyze the content, automatically generating a draft ticket complete with a " +
        "suggested title, category, summary, and resolution path, which will allow administrators and support staff to focus on " +
        "resolution rather than categorization and assignment. Return to me in valid JSON format. Escape apostrophes properly. Ensure valid JSON format"+
        "The keys are\n"+
        "1. Title: A concise title\n" +
        "2. Summary: A brief summary of the issue (maximum 4 words)\n" +
        "3. Category: The category of the issue\n" +
        "4. Resolution Path: One best suggested way to resolve the issue\n" +
        "Content: " + message;

        const ollama = new Ollama({ host: 'http://localhost:11434' });

        const response = await ollama.generate({
            model: "llama3.2",
            prompt,
            format: "json",
            options: {
                temperature: 0.1
            }
        });


        const parsed = JSON.parse(response.response);
        
        // Issue Message
        console.log("\nIssue: ", message);

        console.log("\nOllama Raw Response: ", response.response);

        console.log("\nOllama Response")
        console.log("Title: ", parsed.title);
        console.log("Summary: ", parsed.summary);
        console.log("Category: ", parsed.category);
        console.log("Resolution Path: ", parsed.resolution_path);

        res.json(parsed);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
