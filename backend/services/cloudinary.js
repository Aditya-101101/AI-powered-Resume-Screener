const cloudinary = require('cloudinary').v2;
const fs = require('fs')

cloudinary.config({
    cloud_name: 'my_cloud_name',
    api_key: 'my_key',
    api_secret: 'my_secret'
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        if (fs.existsSync(localFilePath))
            fs.unlinkSync(localFilePath);
        return response
    } catch (err) {
        if (fs.existsSync(localFilePath))
            fs.unlinkSync(localFilePath);
        return null
    }
}

module.exports = { uploadOnCloudinary }