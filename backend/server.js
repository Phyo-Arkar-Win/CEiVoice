import dotenv from "dotenv";
dotenv.config();

import connectDB from './config/db.js';
import app from "./app.js";

<<<<<<< HEAD
const PORT = process.env.PORT;
=======
const PORT = process.env.PORT || 5000;
>>>>>>> 9870920 (SUPAnig)

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`);
});

