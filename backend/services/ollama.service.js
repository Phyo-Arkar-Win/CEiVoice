import axios from 'axios';
import { Ollama } from 'ollama';

export const generateDraftTicket = async (req, res) => {
    try {
        const { message } = req.body;

        const prompt = "You are supposed to analyze the user's request message, automatically generating a draft ticket complete with a " +
        "suggested title, category, summary, and resolution path, which will allow administrators and support staff to focus on " +
        "resolution rather than categorization and assignment. Return to me in valid JSON format. Escape apostrophes properly. Ensure valid JSON format"+
        "The keys are\n"+
        "1. title: (Max 100 characters) A concise title. The suggested Title must accurately reflect the core issue described in the user's request message.\n" +
        "2. summary: (Max 500 characters) The Summary must capture all key facts and the user's ultimate goal mentioned in the user's request message.\n" +
        "3. category: The category of the request\n" +
        "4. resolution_path: This suggestion must propose 1-3 actionable steps or resources relevant to the request.\n" +
        "Request Message: " + message;

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
        console.log("\nRequest Message: ", message);

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
