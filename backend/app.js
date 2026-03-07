import express from 'express';
import cors from 'cors';
import ollamaRoutes from './routes/ollama.routes.js';
import healthCheckRoutes from './routes/healthCheck.routes.js';
import loginRoutes from './routes/login.routes.js';
import signupRoutes from './routes/signup.routes.js';
import emailRoutes from './routes/email.routes.js';
import issueSubmissionRoutes from './routes/issueSubmission.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import recruitAssigneeRoutes from './routes/recruitAssignee.routes.js';
import ScopesRoutes from './routes/scopes.routes.js';
import assigneeRoutes from './routes/assignee.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/health', healthCheckRoutes);
app.use('/api/AI', ollamaRoutes);
app.use('/login', loginRoutes);
app.use('/signup', signupRoutes);
app.use('/email', emailRoutes);
app.use('/submit', issueSubmissionRoutes);
app.use('/tickets', ticketRoutes);
app.use('/recruit', recruitAssigneeRoutes);
app.use('/scopes', ScopesRoutes);
app.use('/assignee', assigneeRoutes);

export default app;
