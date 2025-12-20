const express = require('express')
const Recruiter = require('../models/recruiterSchema')
const { createProfile } = require("../services/recruiterAuth");
const Job = require('../models/jobSchema');
const Application = require('../models/applicationSchema')
const { getEmbedding } = require('../services/generateEmbedding');
const { uploadOnCloudinary } = require('../services/cloudinary');
const fs = require('fs')

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

const registerRecruiter = async (req, res) => {
    const { name, email, password, recruiterAvatar } = req.body

    if (!name || !email || !password)
        return res.status(400).json({ message: "All fields are required" })

    const normalizedEmail = email.toLowerCase();

    if (!validEmail(normalizedEmail))
        return res.status(400).json({ message: "please enter correct email" })

    if (!checkStrength(password))
        return res.status(400).json({ message: "password too weak" })

    if (!recruiterAvatar)
        return res.status(400).json({ message: "Avatar is required" })

    try {
        const existingRecruiter = await Recruiter.findOne({ email: normalizedEmail });
        if (existingRecruiter)
            return res.status(409).json({ message: "Email already registered" });

        const recruiter = await Recruiter.create({
            name: name,
            email: normalizedEmail,
            password: password,
            recruiterAvatar: recruiterAvatar
        })
        if (!recruiter)
            return res.status(500).json({ message: "some error saving recruiter" })

        const token = createProfile(recruiter)
        if (!token)
            return res.status(500).json({ message: "Some error occured" })
        return res.cookie("token", token, { sameSite: process.env.ISPROD ? "none" : "lax", secure: process.env.ISPROD, httpOnly: true, maxAge: 10 * 86400 * 1000 }).status(201).json({ message: "Recruiter created successfully" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error registering Recruiter!" })
    }
}

const loginRecruiter = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password)
        return res.status(400).json({ message: "All fields are required" })

    const normalizedEmail = email.toLowerCase();

    if (!validEmail(normalizedEmail))
        return res.status(400).json({ message: "please enter correct email" })

    try {
        const existingRecruiter = await Recruiter.findOne({ email: normalizedEmail });
        if (!existingRecruiter)
            return res.status(401).json({ message: "please enter correct email or password" });

        const checkPassword = await existingRecruiter.comparePassword(password)

        if (checkPassword) {
            const token = createProfile(existingRecruiter)
            return res.cookie("token", token, { sameSite: "lax", secure: true, httpOnly: true, maxAge: 10 * 86400 * 1000 }).status(200).json({ message: "Recruiter loggedin successfully" })
        }

        return res.status(401).json({ message: "please enter correct email or password" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error logging in!" })
    }
}

const logoutRecruiter = async (req, res) => {
    try {
        return res.clearCookie("token").status(200).json({ message: "Recruiter logged out successfully!" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error logging out!" })
    }
}

const createJob = async (req, res) => {
    const recruiter = req.recruiter
    const jobCoverLocalPath = req.file?.jobCover[0]?.path

    if (!recruiter)
        return res.status(401).json({ message: "unauthenticated" })

    let { title, desc, skillsRequired, experienceRequired } = req.body
    title = title?.trim()
    desc = desc?.trim()


    if (!title || !desc)
        return res.status(400).json({ message: "All fields are required!" })

    const expReq = Number(experienceRequired)
    if (Number.isNaN(expReq) || expReq < 0)
        return res.status(400).json({ message: "Experience required must be a valid number" })

    if (!Array.isArray(skillsRequired))
        return res.status(400).json({ message: "Wrong field value!" })

    if (desc.length < 20 || desc.length > 1500)
        return res.status(400).json({ message: "Description length error!" })

    if (!jobCoverLocalPath)
        return res.status(400).json({ message: "Job cover is required" })

    try {

        let normalizedSkills

        if (Array.isArray(skillsRequired)) {
            normalizedSkills = [...new Set(skillsRequired.map(s => s.toLowerCase()))];
        }

        const jobEmbeddingData = JSON.stringify({
            title: title,
            skillsRequired: normalizedSkills || [],
            experienceRequired: expReq
        })

        const jobEmbedding = await generateEmbedding(jobEmbeddingData)
        if (!jobEmbedding || !Array.isArray(jobEmbedding))
            return res.status(409).json({ message: "Some error occured" })

        const jobCover = await uploadOnCloudinary(jobCoverLocalPath)
        if (!jobCover)
            return res.status(500).json({ message: "Error saving jobCover" })

        const job = await Job.create({
            title: title,
            desc: desc,
            skillsRequired: normalizedSkills || [],
            experienceRequired: expReq || 0,
            jobCoverUrl: jobCover.secure_url || null,
            createdBy: recruiter.id,
            embedding: jobEmbedding
        })

        const jobData = {
            title: job.title,
            desc: job.desc,
            skillsRequired: job.skillsRequired,
            experienceRequired: job.experienceRequired,
            jobCoverUrl: job.jobCoverUrl,
        }

        return res.status(201).json({ job: jobData, message: "Job created Successfully!" })

    } catch (err) {
        return res.status(500).json({ message: "Error creating Job!", error: err.message })
    } finally {
        if (jobCoverLocalPath && fs.existsSync(jobCoverLocalPath))
            await fs.promises.unlink(jobCoverLocalPath)
    }
}

const recruiterData = async (req, res) => {
    const recruiter = req.recruiter
    if (!recruiter)
        return res.status(401).json({ message: "Unauthorized!" })

    try {
        const jobs = await Job.find({ createdBy: recruiter.id }).lean()

        const recruiterData = {
            id: recruiter.id,
            name: recruiter.name,
            email: recruiter.email,
            recruiterAvatar: recruiter.recruiterAvatar
        }

        return res.status(200).json({ recruiter: recruiterData, jobs: jobs })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const updateJob = async (req, res) => {
    const recruiter = req.recruiter
    const { setStatus, jobId } = req.body
    if (!recruiter)
        return res.status(401).json({ message: "unauthenticated" })
    if (!(setStatus === false))
        return res.status(409).json({ message: "wrong request" })
    try {
        const response = await Job.updateOne({ createdBy: recruiter.id, _id: jobId, status: true }, { status: setStatus })
        if (response.modifiedCount !== 1)
            return res.status(404).json({ message: "No open job found to update!" })
        return res.status(200).json({ message: "Status updated successfully!" })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const updateApplication = async (req, res) => {
    const recruiter = req.recruiter;
    const { applicationId, applicationStatus } = req.body;

    if (!recruiter)
        return res.status(401).json({ message: "unauthenticated!" });

    if (!applicationId || !applicationStatus)
        return res.status(400).json({ message: "All fields required" });

    if (applicationStatus !== 'Accepted' && applicationStatus !== 'Rejected' && applicationStatus !== 'UnderProcessing')
        return res.status(400).json({ message: "wrong status" })

    try {
        const application = await Application.findById(applicationId)
        if (!application)
            return res.status(404).json({ message: "application not found" })
        const job = await Job.findById(application.jobId)
        if (!job)
            return res.status(404).json({ message: "job not found" })
        if (job.createdBy.toString() !== recruiter.id)
            return res.status(403).json({ message: "unauthorized" })

        if (application.status === 'Accepted' || application.status === 'Rejected')
            return res.status(409).json({ message: "wrong request!" })

        let response
        if (application.status === 'Applied' && applicationStatus === 'UnderProcessing') {
            response = await Application.updateOne(
                {
                    _id: applicationId,
                    jobId: job._id
                },
                { $set: { status: applicationStatus } }
            );
        } else if (application.status === 'UnderProcessing') {

            response = await Application.updateOne(
                {
                    _id: applicationId,
                    jobId: job._id
                },
                { $set: { status: applicationStatus } },
                { new: true }
            )
        }
        else {
            return res.status(409).json({ message: "Invalid Transition" })
        }

        if (response.modifiedCount !== 1)
            return res.status(404).json({ message: "Application not found" });

        return res.status(200).json({
            message: "Status updated successfully"
        });

    } catch (err) {
        return res.status(500).json({ message: "Some error occurred" });
    }
}


const recruiterController = {
    registerRecruiter,
    loginRecruiter,
    logoutRecruiter,
    createJob,
    recruiterData,
    updateJob,
    updateApplication
}

module.exports = { recruiterController }