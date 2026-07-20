// import dotenv from "dotenv";
// dotenv.config();

// import connectDB from './config/db.js';
// import app from "./app.js";

// const PORT = process.env.PORT || 50001;

// // Connect to MongoDB
// connectDB();

// app.listen(PORT, () => {
//     console.log(`Server up and running on port ${PORT}`);
// });


import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 50001;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server up and running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
};
console.log("SERVER STARTING");
startServer();
