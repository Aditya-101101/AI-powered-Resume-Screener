const express = require('express')
const dotenv = require('dotenv')
const { ConnectDB } = require('./dbConnect')
const app = express()
const userRoute = require('./routes/user')
const recruiterRoute = require('./routes/recruiter')
const jobRoute = require('./routes/job')
const { checkUserAuth } = require('./middlewares/userAuthentication')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { checkRecruiterAuth } = require('./middlewares/recruiterAuthentication')
dotenv.config()

const PORT = process.env.PORT
ConnectDB()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: `${process.env.CORS_ORIGIN}`,
    credentials: true
}))

app.use('/user', checkUserAuth("token"), userRoute)
app.use('/recruiter', checkRecruiterAuth("token"), recruiterRoute)
app.use('/jobs', jobRoute)

app.listen(PORT, () => {
    console.log("server started on port:", PORT)
})