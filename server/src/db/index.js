import mongoose from 'mongoose';
import config from '../config/config.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;