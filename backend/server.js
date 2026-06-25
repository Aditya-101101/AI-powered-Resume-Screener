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
const { redirectController } = require("./controllers/redirectController");
dotenv.config();

const PORT = process.env.PORT || 5000;
ConnectDB();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.CORS_ORIGIN_DEV
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

if (!process.env.ISPROD) {
    setInterval(() => {
        const m = process.memoryUsage()
        console.log(
            `RSS: ${(m.rss / 1024 / 1024).toFixed(1)}MB | ` +
            `Heap: ${(m.heapUsed / 1024 / 1024).toFixed(1)}MB`
        )
    }, 5000)
}

app.use("/user", checkUserAuth("token"), userRoute);
app.use("/recruiter", checkRecruiterAuth("token"), recruiterRoute);
app.use("/jobs", jobRoute);


app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get("/", checkUserAuth("token"), checkRecruiterAuth("token"), redirectController);




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
