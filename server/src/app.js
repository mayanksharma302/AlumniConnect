import express, {json} from "express";
import cors from "cors";

const app = express();

// Configuaration for cross origin resource sharing
app.use(cors({
    origin: "*",
    credentials: true,
}))
// Configuration for accepting the data from forms
app.use(express.json());
// Configuration for accepting the data from URL
app.use(express.urlencoded({ extended: true }));
// Configuration for to store assets in public folder
app.use(express.static("public"));

export { app };