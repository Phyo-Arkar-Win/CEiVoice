import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

const app = express();

// Connect to MongoDB
connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server up and running on port ${process.env.PORT}`);
});