const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        cb(null, `${file.fieldname}-${Date.now()}.${ext}`)
    }
})

const fileFilter = (req, file, cb) => {

    if (file.fieldname === 'resume') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for resume'), false);
        }
    }
    else if (file.fieldname === 'userAvatar') {
        const allowedImages = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedImages.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG/PNG images are allowed for avatar'), false);
        }
    }
    else if (file.fieldname === 'recruiterAvatar') {
        const allowedImages = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedImages.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG/PNG images are allowed for avatar'), false);
        }
    }
    else {
        cb(new Error('Invalid file field'), false);
    }
}

const upload = multer({
    storage: storage, fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

module.exports = { upload }