//import axios from 'axios';
//import { Ollama } from 'ollama';

export const generateDraftTicket = async (req, res) => {
    try {
        const { message } = req.body;
        const ollama = new Ollama({ host: 'http://localhost:11434' });
        const response = await ollama.chat({
            model: "llama3.2",
            prompt: message,
            format: "json"
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}