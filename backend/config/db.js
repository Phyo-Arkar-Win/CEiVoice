// import mongoose from 'mongoose';

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI, {
//         });
//         console.log('MongoDB connected');
//     } catch (error) {
//         console.error('MongoDB connection error:', error);
//         process.exit(1);
//     }
// };

// export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log("MONGO_URI:", process.env.MONGO_URI);

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to:", conn.connection.host);
        console.log("Database:", conn.connection.name);
    } catch (error) {
        console.error("DB ERROR:");
        console.error(error);
    }
};

export default connectDB;

