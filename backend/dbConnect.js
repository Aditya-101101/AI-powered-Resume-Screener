const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const MONGO_URI = process.env.MONGO_URI

const ConnectDB = async () => {
    try {
        mongoose.connect(`${MONGO_URI}`)
            .then(console.log("Mongo database connected successfully"))
    } catch (err) {
        console.log("error connecting database: ", err.message)
    }
}

module.exports = { ConnectDB }