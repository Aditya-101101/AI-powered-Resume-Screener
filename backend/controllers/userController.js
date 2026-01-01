const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const User = require('../models/userSchema')
const { createProfile } = require('../services/userAuth');
const Application = require('../models/applicationSchema');
const Job = require('../models/jobSchema')
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs");
const { getEmbedding } = require('../services/generateEmbedding');
const { checkSimilarity } = require('../services/checkSimilarity');
const { cleanResumeText } = require('../services/textCleaner')
const { uploadOnCloudinary } = require('../services/cloudinary');
const { extractSkillsAndExperience } = require('../services/requiredParams');
dotenv.config()



const generateEmbedding = async (text) => {
    const vec = await getEmbedding(`${text}`);
    return vec
}

const validEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

const checkStrength = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$#!%*?&]{8,}$/;
    return regex.test(password);
}

const registerUser = async (req, res) => {
    const { name, email, password, userAvatar } = req.body

    if (!name || !email || !password)
        return res.status(400).json({ message: "All fields are required" })


    const normalizedEmail = email.toLowerCase();

    if (!validEmail(normalizedEmail))
        return res.status(400).json({ message: "please enter correct email" })

    if (!checkStrength(password))
        return res.status(400).json({ message: "password too weak or short" })

    if (!userAvatar)
        return res.status(400).json({ message: "User Avatar Required!" })

    try {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser)
            return res.status(409).json({ message: "User already exists" });

        const user = await User.create({
            name: name,
            email: normalizedEmail,
            password: password,
            userAvatar: userAvatar
        })
        if (!user)
            return res.status(500).json({ message: "Some error occured" })
        const token = createProfile(user)
        if (!token)
            return res.status(500).json({ message: "some error occured" })
        return res.cookie("token", token, { sameSite: process.env.ISPROD ? "none" : "lax", secure: process.env.ISPROD, httpOnly: true, maxAge: 10 * 86400 * 1000 }).status(201).json({ message: "User created successfully" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error signing user!" })
    }

}


const loginUser = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password)
        return res.status(400).json({ message: "All fields are required" })


    const normalizedEmail = email.toLowerCase();

    if (!validEmail(normalizedEmail))
        return res.status(401).json({ message: "please enter correct email" })

    try {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (!existingUser)
            return res.status(401).json({ message: "please enter correct email or password" });

        const checkPassword = await existingUser.comparePassword(password)

        if (checkPassword) {
            const token = createProfile(existingUser)
            return res.cookie("token", token, { sameSite: process.env.ISPROD ? "none" : "lax", secure: process.env.ISPROD, httpOnly: true, maxAge: 10 * 86400 * 1000 }).status(200).json({ message: "User loggedin successfully" })
        }

        return res.status(401).json({ message: "please enter correct email or password" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error logging in!" })
    }
}

const logoutUser = async (req, res) => {
    try {
        return res.clearCookie("token", { sameSite: process.env.ISPROD ? "none" : "lax", secure: process.env.ISPROD, httpOnly: true, path: '/' }).status(200).json({ message: "User logged out successfully!" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error logging out!" })
    }
}


const uploadApplication = async (req, res) => {
    const user = req.user;
    const resume = req.file;
    const jobId = req.body.jobId;

    if (!user)
        return res.status(401).json({ message: "unauthenticated" });

    if (!jobId)
        return res.status(400).json({ message: "Invalid Job!" });

    if (!resume)
        return res.status(400).json({ message: "Resume is required!" });

    if (resume.mimetype !== "application/pdf")
        return res.status(400).json({ message: "Only PDF files are allowed!" });

    try {

        const job = await Job.findOne({ _id: jobId, status: true });
        if (!job)
            return res.status(404).json({ message: "Job not found!" });

        const alreadyApplied = await Application.findOne({
            jobId,
            submittedBy: user.id
        });

        if (alreadyApplied)
            return res.status(409).json({
                message: "Application can be sent only once!"
            });

        if (!Array.isArray(job.embedding) || job.embedding.length === 0)
            return res.status(500).json({ message: "Job embedding missing!" });

        const filePath = path.resolve(resume.path)

        let buffer
        try {
            buffer = fs.readFileSync(filePath);
        } catch (err) {
            console.error("FILE READ ERROR:", err);
            return res.status(500).json({ message: "Failed to read resume file" });
        }

        let parsedResume
        try {
            parsedResume = await pdfParse(buffer);
        } catch (err) {
            console.error("PDF PARSE ERROR:", err);
            return res.status(400).json({ message: "Unable to parse resume PDF" });
        }

        const text = parsedResume.text;
        // console.log("TEXT LENGTH:", text?.length);

        if (!text || text.length < 100)
            return res.status(400).json({
                message: "Invalid or scanned resume PDF"
            });



        const cleanedText = cleanResumeText(text);

        let resumeJson = {}
        let extracted
        try {
            extracted = await extractSkillsAndExperience(
                cleanedText
            )
            // console.log(extracted)
        } catch (err) {
            console.error("Extraction error:", err);
            return res.status(500).json({
                message: "Failed to extract resume data"
            });
        }
        resumeJson.skills = extracted.skills;
        resumeJson.experience = extracted.experience;


        resumeJson.skills = Array.isArray(resumeJson.skills)
            ? [...new Set(resumeJson.skills.map(s => s.toLowerCase()))]
            : [];

        const exp = Number(resumeJson.experience);
        resumeJson.experience =
            Number.isFinite(exp) && exp >= 0 && exp <= 30 ? exp : 0;


        const resumeEmbedding = await getEmbedding(cleanedText);

        const jobEmbedding = job.embedding;

        // console.log(
        //     "FINAL SHAPES:",
        //     Array.isArray(resumeEmbedding),
        //     resumeEmbedding.length,
        //     Array.isArray(jobEmbedding),
        //     jobEmbedding.length
        // );


        if (!Array.isArray(resumeEmbedding) || !Array.isArray(jobEmbedding)) {
            throw new Error("Invalid embeddings: expected number[]");
        }

        if (resumeEmbedding.length !== jobEmbedding.length) {
            throw new Error(
                `Embedding dimension mismatch: resume=${resumeEmbedding.length}, job=${jobEmbedding.length}`
            );
        }


        const similarity = checkSimilarity(resumeEmbedding, jobEmbedding);

        // console.log(similarity)
        const atsScore = Math.round(
            Math.max(0, Number.isFinite(similarity) ? similarity : 0) * 100
        );

        const uploaded = await uploadOnCloudinary(filePath);
        // console.log(uploaded)
        if (!uploaded?.secure_url)
            return res.status(500).json({ message: "Resume upload failed" });

        const application = await Application.create({
            jobId,
            submittedBy: user.id,
            skills: resumeJson.skills,
            experience: resumeJson.experience,
            resume: uploaded.secure_url,
            atsScore
        });

        return res.status(201).json({
            application: {
                skills: application.skills,
                experience: application.experience,
                status: application.status,
                resume: application.resume,
                atsScore
            },
            message: "Application submitted successfully"
        });

    } catch (err) {
        console.error("UPLOAD APPLICATION ERROR:", err);

        if (err.code === 11000) {
            return res.status(400).json({
                message: "Application can be sent only once!"
            });
        }

        return res.status(500).json({
            message: "Failed to submit application!"
        });
    } finally {
        if (resume?.path && fs.existsSync(resume.path)) {
            await fs.promises.unlink(resume.path);
        }
    }
};


const APPLICATIONS_PER_PAGE = Number(process.env.APPLICATIONS_PER_PAGE)

const userData = async (req, res) => {
    const user = req.user
    const page = Math.max(1, req.query.page || 1)

    const query = {}
    if (!user)
        return res.status(401).json({ message: "Unauthenticated!" })

    try {
        const skip = (page - 1) * APPLICATIONS_PER_PAGE
        const userObjectId = new mongoose.Types.ObjectId(user.id);

        const atsScoresPromise = Application.aggregate([
            { $match: { submittedBy: userObjectId } },
            {
                $group: {
                    _id: null,
                    avgAts: { $avg: "$atsScore" },
                    maxAts: { $max: "$atsScore" },
                    minAts: { $min: "$atsScore" }
                }
            }
        ]);

        const applicationCountPromise = Application.countDocuments({ submittedBy: user.id })
        const acceptedCountPromise = Application.countDocuments({ submittedBy: user.id, status: "Accepted" })
        const rejectedCountPromise = Application.countDocuments({ submittedBy: user.id, status: "Rejected" })
        const underReviewCountPromise = Application.countDocuments({ submittedBy: user.id, status: "UnderReview" })
        const applicationsPromise = Application.find({ submittedBy: user.id }).sort({ atsScore: -1, createdAt: -1 }).lean().populate('jobId', { title: 1, desc: 1 }).skip(skip).limit(APPLICATIONS_PER_PAGE)

        const [applicationCount, applications, acceptedCount, rejectedCount, underReviewCount, atsScores] = await Promise.all([applicationCountPromise, applicationsPromise, acceptedCountPromise, rejectedCountPromise, underReviewCountPromise, atsScoresPromise])

        const atsStats = atsScores[0] || {
            avgAts: 0,
            maxAts: 0,
            minAts: 0
        };

        // console.log(atsStats)

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            userAvatar: user.userAvatar,
            avgScore: atsStats.avgAts,
            highestScore: atsStats.maxAts,
            lowestScore: atsStats.minAts,
        }

        const applicationsData = applications.map(application => ({
            id: application._id,
            skills: application.skills,
            experience: application.experience,
            jobId: application.jobId,
            atsScore: application.atsScore,
            status: application.status,
            resume: application.resume
        }))

        const pageCount = Math.ceil(applicationCount / APPLICATIONS_PER_PAGE)

        const pagination = {
            applicationCount,
            underReviewCount,
            acceptedCount,
            rejectedCount,
            pageCount
        }
        return res.status(200).json({ user: userData, applications: applicationsData, pagination })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const userController = {
    registerUser,
    loginUser,
    logoutUser,
    uploadApplication,
    userData
}

module.exports = { userController }