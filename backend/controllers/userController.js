const express = require('express')
const User = require('../models/userSchema')
const { createProfile } = require('../services/userAuth');
const Application = require('../models/applicationSchema');
const Job = require('../models/jobSchema')
const pdfParse = require('pdf-parse')
const fs = require('fs')
const { getEmbedding } = require('../services/generateEmbedding');
const { checkSimilarity } = require('../services/checkSimilarity');
const { extractFields } = require('../services/requiredParams')
const { cleanResumeText } = require('../services/textCleaner')
const { uploadOnCloudinary } = require('../services/cloudinary')

const generateEmbedding = async (text) => {
    const vec = await getEmbedding(`${text}`);
    return vec
}

const validEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

const checkStrength = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
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
        return res.status(400).json({ message: "password too weak" })

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
        return res.cookie("token", token, { sameSite: "lax", secure: true, httpOnly: true, maxAge: 10 * 86400 * 1000 }).status(201).json({ message: "User created successfully" })
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
            return res.cookie("token", token, { sameSite: "lax", secure: true, httpOnly: true, maxAge: 10 * 86400 * 1000 }).status(200).json({ message: "User loggedin successfully" })
        }

        return res.status(401).json({ message: "please enter correct email or password" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error logging in!" })
    }
}

const logoutUser = async (req, res) => {
    try {
        return res.clearCookie("token").status(200).json({ message: "User logged out successfully!" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error logging out!" })
    }
}

const uploadApplication = async (req, res) => {
    const user = req.user;
    const resume = req.file

    if (!user)
        return res.status(401).json({ message: "unauthenticated" });

    const { jobId } = req.body;
    if (!jobId)
        return res.status(400).json({ message: "Invalid Job!" });


    try {
        if (!resume)
            return res.status(400).json({ message: "Resume is required!" });

        if (resume.mimetype !== "application/pdf")
            return res.status(400).json({ message: "Only PDF files are allowed!" });

        const job = await Job.findOne({ _id: jobId, status: true });
        if (!job)
            return res.status(404).json({ message: "Job not found!" });

        if (!job.status)
            return res.status(403).json({ message: "Job closed" })

        const alreadyApplied = await Application.findOne({
            jobId: jobId,
            submittedBy: user.id
        });

        if (alreadyApplied) {
            return res.status(409).json({
                message: "Application can be sent only once!"
            });
        }


        const jobEmbedding = job.embedding;
        if (!jobEmbedding || jobEmbedding.length === 0)
            return res.status(500).json({ message: "Some error occured!" });

        const dataBuffer = await fs.promises.readFile(resume.path)
        const parsedResume = await pdfParse(dataBuffer);
        const text = parsedResume.text;

        if (!text || text.length <= 100)
            return res.status(400).json({ message: "Error parsing resume!" });

        const cleanedText = cleanResumeText(text);

        let resumeJson = {};
        try {
            const raw = await extractFields(cleanedText);
            const jsonStr = raw.substring(
                raw.indexOf("{"),
                raw.lastIndexOf("}") + 1
            );
            resumeJson = JSON.parse(jsonStr);

            if (Array.isArray(resumeJson.skills)) {
                resumeJson.skills = [...new Set(resumeJson.skills.map(s => s.toLowerCase()))];
            }
        } catch {
            return res.status(500).json({ message: "Failed to extract resume data" });
        }

        if (!Array.isArray(resumeJson.skills) || resumeJson.skills.length === 0) {
            return res.status(400).json({ message: "Invalid resume data!" });
        }

        const exp = Number(resumeJson.experience);
        if (Number.isNaN(exp) || exp < 0 || exp > 30)
            return res.status(400).json({ message: "Invalid resume data!" })



        const resumeEmbedding = await generateEmbedding(cleanedText);
        const similarity = checkSimilarity(resumeEmbedding, jobEmbedding)
        const atsScore = Math.round(
            Math.max(0, Number.isFinite(similarity) ? similarity : 0) * 100
        );

        const resumePath = await uploadOnCloudinary(resume.path)

        if (!resumePath)
            return res.status(500).json({ message: "resume upload failed" })

        const application = await Application.create({
            jobId: jobId,
            submittedBy: user.id,
            skills: resumeJson.skills || [],
            experience: Number(resumeJson.experience),
            resume: resumePath.secure_url,
            atsScore: atsScore
        });

        const applicationData = {
            skills: application.skills,
            experience: application.experience,
            status: application.status,
            resume: resumePath.secure_url,
            atsScore: atsScore
        }

        return res.status(201).json({
            application: applicationData,
            message: "Application submitted successfully"
        });

    } catch (err) {

        if (err.code === 11000) {
            return res.status(400).json({
                message: "Application can be sent only once!"
            });
        }

        return res.status(500).json({
            message: "Failed to submit application!"
        })
    } finally {
        if (resume?.path && fs.existsSync(resume.path))
            await fs.promises.unlink(resume.path);
    }
}


const userData = async (req, res) => {
    const user = req.user
    if (!user)
        return res.status(401).json({ message: "Unauthenticated!" })

    try {
        const applications = await Application.find({ submittedBy: user.id }).sort({ atsScore: -1 }).lean()

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            userAvatar: user.userAvatar
        }

        const applicationsData = applications.map(application => ({
            skills: application.skills,
            experience: application.experience,
            jobId: application.jobId,
            atsScore: application.atsScore,
            status: application.status,
            resume: application.resume
        }));

        return res.status(200).json({ user: userData, applications: applicationsData })
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