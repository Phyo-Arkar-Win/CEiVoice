import 'dotenv/config';
import { Ollama } from 'ollama';

const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';


export const computeEmbedding = async (text) => {
    if (!text?.trim()) {
        throw new Error('Cannot create an embedding from empty ticket text.');
    }

    const ollama = new Ollama({ host: OLLAMA_HOST });

    const response = await ollama.embed({
        model: EMBEDDING_MODEL,
        input: text,
    });

    return response.embeddings?.[0];
};
