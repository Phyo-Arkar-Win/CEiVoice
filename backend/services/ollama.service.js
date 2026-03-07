import { Ollama } from 'ollama';
import Ticket from '../models/ticket.js';
import Scope from '../models/scope.js';

const AIGenerateDraftTicket = async (email, issue, user) => {
    const scopes = await Scope.find({}, 'name');
    const scopeList = scopes.map(scope => scope.name).join(', ');

    const prompt = `
You are an AI service desk assistant responsible for analyzing a user's support request and generating a structured helpdesk ticket draft.

Your goal is to help administrators focus on resolution instead of categorization.

Analyze the user's message and produce a structured ticket containing a suggested title, category, summary, and resolution path.

IMPORTANT RULES:
- Return ONLY valid JSON. Do not include explanations, comments, or text outside the JSON.
- Escape apostrophes and special characters properly.
- Ensure the JSON is syntactically valid.
- Base your output strictly on the user's message. Do not invent details that are not implied.
- If some information is unclear, make the most reasonable assumption but keep wording neutral.

Output JSON structure:

{
  "title": string,
  "summary": string,
  "category": string,
  "resolution_path": [string]
}

Field requirements:

1. title
- Maximum 100 characters
- Concise and specific
- Clearly reflects the main issue or request

2. summary
- Maximum 500 characters
- Capture key facts from the user's request
- Include the user's goal or expected outcome
- Avoid speculation

3. category
Choose the most appropriate category based on the request. Choose from the following list of categories:
${scopeList}
If none apply, choose the closest logical category.

4. resolution_path
Provide 1–3 actionable steps or resources support staff could take to resolve the request.
Each step must be short, practical, and relevant.

User Request Message:
${issue}
`;

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

    const newTicket = await Ticket.create({
        email: email,
        issue: issue,
        title: parsed.title,
        summary: parsed.summary,
        category: parsed.category,
        resolution_path: parsed.resolution_path,
        original_message: issue,
        creator: user
    });
    
    return newTicket
};


export const AIMergeDraftTicket = async (tickets) => {
const scopes = await Scope.find({}, 'name');
const scopeList = scopes.map(scope => scope.name).join(', ');
const ticketList = tickets.map((ticket, index) => `
    Ticket ${index + 1}
    Title: ${ticket.title}
    Summary: ${ticket.summary}
    Category: ${ticket.category}
    Resolution Path: ${(ticket.resolution_path)}
`).join("\n");
const prompt = `
You are an AI service desk assistant responsible for consolidating multiple helpdesk tickets into a single ticket draft.

The tickets have already been selected by the user for merging. Your task is only to synthesize their information into one clear and coherent ticket.

---------------------
INSTRUCTIONS
---------------------
- Combine the information from all tickets into a single issue description.
- Remove duplicate or redundant details.
- Preserve important facts and context.
- Do NOT invent new information that is not implied by the tickets.
- If some details conflict, choose the most neutral wording.

---------------------
STRICT OUTPUT RULES
---------------------
- Return ONLY valid JSON.
- Do NOT include explanations or text outside the JSON.
- Ensure the JSON is syntactically valid.

---------------------
OUTPUT FORMAT
---------------------
{
  "title": string,
  "summary": string,
  "category": string,
  "resolution_path": [string]
}

---------------------
FIELD REQUIREMENTS
---------------------

title
- Maximum 100 characters
- Concise and clearly describe the merged issue.

summary
- Maximum 500 characters
- Summarize the key issue based on all tickets.
- Include the user's goal or expected outcome.

category
Choose the most appropriate category from the following list:
${scopeList}

resolution_path
Provide 1–3 short actionable steps support staff could take to resolve the issue.

---------------------
SELECTED TICKETS
---------------------
${ticketList}
`;

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

    // const newTicket = await Ticket.create({
    //     email: email,
    //     issue: issue,
    //     title: parsed.title,
    //     summary: parsed.summary,
    //     category: parsed.category,
    //     resolution_path: parsed.resolution_path,
    //     original_message: issue,
    //     creator: user
    // });
    
    // return newTicket
    console.log("Merged Ticket Draft:", parsed);
};

export default AIGenerateDraftTicket;