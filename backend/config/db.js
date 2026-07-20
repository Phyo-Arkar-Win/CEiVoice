import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to:", conn.connection.host);
        console.log("Database:", conn.connection.name);
    } catch (error) {
        console.error("DB ERROR:");
        console.error(error);
        throw error;
    }
};

export default connectDB;

