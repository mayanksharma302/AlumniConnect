import connectDB from "./db/index.js";
import {app} from "./app.js";
import dotenv from "dotenv";

dotenv.config({
    Path: "./.env"
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
})
.catch((error) => {
    console.error(`Error connecting to the database: ${error.message}`);    
})