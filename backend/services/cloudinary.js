const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv')
const path=require('path')
dotenv.config()
const fs = require('fs')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const ext = path.extname(localFilePath).slice(1).toLowerCase();
        const options = {
            resource_type: "raw",
            folder: "resumes",
            access_mode: "public",
            use_filename: true,
            unique_filename: true,
        };
        if (ext === "pdf") options.format = "pdf";

        const response = await cloudinary.uploader.upload(localFilePath, options);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;
    } catch (err) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Cloudinary upload failed:", err);
        return null;
    }
};

const uploadJobCover = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
            folder: "job_covers",
            transformation: [
                { width: 1200, height: 630, crop: "fill" }
            ]
        });

        await fs.promises.unlink(localFilePath);

        return response;

    } catch (err) {
        if (fs.existsSync(localFilePath)) {
            await fs.promises.unlink(localFilePath);
        }
        throw err;
    }
};


module.exports = { uploadOnCloudinary, uploadJobCover }