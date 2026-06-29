import dotenv from "dotenv";
dotenv.config();

if(!process.env.PORT || !process.env.CORS_ORIGIN || !process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error("Missing required environment variables. Please check your .env file.");
}

if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("GOOGLE_CLIENT is not defined in enviroment variable")
}

if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in enviroment variable")
}

if(!process.env.GOOGLE_REFRESH_TOKEN){
    throw new Error("GOOGLE_REFRESH_TOKEN is not defined in enviroment variable")
}

if(!process.env.GOOGLE_USER){
    throw new Error("GOOGLE_USER is not defined in enviroment variable")
}

const config = {
    PORT: process.env.PORT || 3000,
    CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/AlumniConnect",
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER: process.env.GOOGLE_USER
}

export default config;