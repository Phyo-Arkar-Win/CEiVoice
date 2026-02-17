import express from 'express';
import cors from 'cors';
// import ollamaRoutes from './routes/ollama.routes.js';
import healthCheckRoutes from './routes/healthCheck.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// app.use('/api/health', healthCheckRoutes);
// app.use('/api/AI', ollamaRoutes);

export default app;
