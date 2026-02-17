import dotenv from 'dotenv';
dotenv.config();

// import connectDB from './config/db.js';
import app from "./app.js";

const PORT = process.env.PORT;

// Connect to MongoDB
// connectDB();

app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`);
});
