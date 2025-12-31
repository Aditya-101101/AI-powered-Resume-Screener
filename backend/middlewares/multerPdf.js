const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, "../public/tempResume");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/tempResume')
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
    else {
        cb(new Error('Invalid file field'), false);
    }
}

const upload = multer({
    storage: storage, fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
})

module.exports = { upload }