const express = require("express");
const dotenv = require("dotenv");
const { ConnectDB } = require("./dbConnect");
const app = express();
const userRoute = require("./routes/user");
const recruiterRoute = require("./routes/recruiter");
const jobRoute = require("./routes/job");
const { checkUserAuth } = require("./middlewares/userAuthentication");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { checkRecruiterAuth } = require("./middlewares/recruiterAuthentication");
dotenv.config();

const PORT = process.env.PORT || 5000;
ConnectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use("/user", checkUserAuth("token"), userRoute);
app.use("/recruiter", checkRecruiterAuth("token"), recruiterRoute);
app.use("/jobs", jobRoute);


app.get("/", (req, res) => {
    res.send("Server Running")
});


// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Server Error",
    });
});


app.listen(PORT, () => {
    console.log("server started on port:", PORT);
});
