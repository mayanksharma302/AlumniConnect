import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import config from '../config/config.js';


// Configuration
cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error("File path is required for uploading to Cloudinary");
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // File uploaded successfully, delete the local file
        console.log("Cloudinary upload response:", response);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the local file after upload attempt
        return null; // Return null to indicate failure
    }
}

export default uploadOnCloudinary;