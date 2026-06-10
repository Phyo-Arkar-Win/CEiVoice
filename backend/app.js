import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalRateLimit } from './middlewares/rateLimiter.js';
import authRoutes from './routes/auth.routes.js';
import ollamaRoutes from './routes/ollama.routes.js';
import healthCheckRoutes from './routes/health-check.routes.js';
import emailRoutes from './routes/email.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import ScopesRoutes from './routes/scopes.routes.js';
import historyLogRoutes from './routes/history-log.routes.js';
import assigneeRoutes from './routes/assignee.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import testRoutes from './routes/test.route.js';

const app = express();

app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(globalRateLimit);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/v1/health', healthCheckRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ai', ollamaRoutes);
app.use('/api/v1/email', emailRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/scopes', ScopesRoutes);
app.use('/api/v1/history', historyLogRoutes);
app.use('/api/v1/assignee', assigneeRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/test', testRoutes);

export default app;
