import connectDB from "./db/index.js";
import {app} from "./app.js";
import config from "./config/config.js";

connectDB()
.then(() => {
    app.listen(config.PORT, () => {
        console.log(`Server running on port ${config.PORT} and connected to the database successfully.`);
    });
})
.catch((error) => {
    console.error(`Error connecting to the database: ${error.message}`);    
})