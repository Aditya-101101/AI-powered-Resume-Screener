const express = require('express')
const dotenv = require('dotenv')
const Recruiter = require('../models/recruiterSchema')
const { createProfile } = require("../services/recruiterAuth");
const Job = require('../models/jobSchema');
const Application = require('../models/applicationSchema')
const { getEmbedding } = require('../services/generateEmbedding');
const { uploadJobCover } = require('../services/cloudinary');
const path = require('path')
const fs = require('fs');
const mongoose = require('mongoose');
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
        return res.status(400).json({ message: "password too weak or short" })

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
    const jobCover = req.file

    if (!recruiter)
        return res.status(401).json({ message: "unauthenticated" })

    let { title, desc, skillsRequired, experienceRequired } = req.body
    title = title?.trim()
    desc = desc?.trim()


    if (!title || !desc)
        return res.status(400).json({ message: "All fields are required!" })

    const expReq = Number(experienceRequired)
    if (Number.isNaN(expReq) || expReq < 0 || expReq > 30)
        return res.status(400).json({ message: "Experience required must be a valid number" })

    try {
        skillsRequired = JSON.parse(skillsRequired)
    } catch {
        return res.status(400).json({ message: "Invalid skills format" })
    }

    if (!Array.isArray(skillsRequired))
        return res.status(400).json({ message: "Wrong field value!" })




    if (desc.length < 20 || desc.length > 1500)
        return res.status(400).json({ message: "Description length error!" })

    if (!jobCover)
        return res.status(400).json({ message: "Job cover is required" })

    try {

        let normalizedSkills = Array.isArray(skillsRequired)
            ? [...new Set(skillsRequired.map(s => s.toLowerCase()))]
            : [];

        const jobEmbeddingData = JSON.stringify({
            title: title,
            skillsRequired: normalizedSkills || [],
            experienceRequired: expReq
        })

        // console.log(jobEmbeddingData)
        const jobEmbedding = await generateEmbedding(jobEmbeddingData)

        if (!jobEmbedding || !Array.isArray(jobEmbedding))
            return res.status(409).json({ message: "Some error occured" })
        // console.log(jobEmbedding)

        if (!jobCover.mimetype.startsWith("image/")) {
            return res.status(400).json({ message: "Invalid file type" });
        }

        if (jobCover.size > 5 * 1024 * 1024) {
            return res.status(400).json({ message: "File too large (max 5MB)" });
        }


        const filePath = path.resolve(jobCover.path)

        const uploaded = await uploadJobCover(filePath)
        // console.log(uploaded)
        if (!uploaded?.secure_url)
            return res.status(500).json({ message: "Job Cover upload failed" });

        const job = await Job.create({
            title: title,
            desc: desc,
            skillsRequired: normalizedSkills || [],
            experienceRequired: expReq || 0,
            jobCover: uploaded.secure_url || null,
            createdBy: recruiter.id,
            embedding: jobEmbedding
        })

        const jobData = {
            title: job.title,
            desc: job.desc,
            skillsRequired: job.skillsRequired,
            experienceRequired: job.experienceRequired,
            jobCover: job.jobCover,
        }

        return res.status(201).json({ job: jobData, message: "Job created Successfully!" })

    } catch (err) {
        console.error("JOB CREATION ERROR:", err);

        if (err.code === 11000) {
            return res.status(400).json({
                message: "Job with similar details can be created only once!"
            });
        }

        return res.status(500).json({
            message: "Failed to create job!"
        })
    } finally {
        if (jobCover?.path && fs.existsSync(jobCover.path)) {
            await fs.promises.unlink(jobCover.path)
        }
    }
}

const JOBS_PER_PAGE = Number(process.env.JOBS_PER_PAGE)

const recruiterData = async (req, res) => {
    const recruiter = req.recruiter
    const page = Math.max(1, req.query.page || 1)

    const query = {}

    if (!recruiter)
        return res.status(401).json({ message: "Unauthorized!" })

    try {
        const skip = (page - 1) * JOBS_PER_PAGE

        const recruiterId = new mongoose.Types.ObjectId(recruiter.id)

        const jobsStatsPromise = Job.aggregate([
            {
                $match: { createdBy: recruiterId }
            },
            {
                $lookup: {
                    from: "applications",
                    foreignField: "jobId",
                    localField: '_id',
                    as: "total_applications"
                }
            },
            {
                $addFields: {
                    totalApplications: { $size: "$total_applications" },

                    acceptedApplications: {
                        $size: {
                            $filter: {
                                input: "$total_applications",
                                as: "apps",
                                cond: { $eq: ["$$apps.status", "Accepted"] }
                            }
                        }
                    },
                    rejectedApplications: {
                        $size: {
                            $filter: {
                                input: "$total_applications",
                                as: "apps",
                                cond: { $eq: ["$$apps.status", "Rejected"] }
                            }
                        }
                    },
                    applicationsRemainingToReview: {
                        $size: {
                            $filter: {
                                input: "$total_applications",
                                as: "apps",
                                cond: { $in: ["$$apps.status", ["Applied", "UnderReview"]] }
                            }
                        }
                    },
                    applicationsSubmittedToday: {
                        $size: {
                            $filter: {
                                input: "$total_applications",
                                as: "apps",
                                cond: {
                                    $gte: ["$$apps.createdAt", {
                                        $dateTrunc: {
                                            date: "$$NOW",
                                            unit: "day"
                                        }
                                    }]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    totalApplications: 1,
                    acceptedApplications: 1,
                    rejectedApplications: 1,
                    applicationsRemainingToReview: 1,
                    applicationsSubmittedToday: 1
                }
            }
        ])
        const jobCountPromise = Job.countDocuments({ createdBy: recruiter.id })
        const jobOpenCountPromise = Job.countDocuments({ createdBy: recruiter.id, status: true })
        const jobCloseCountPromise = Job.countDocuments({ createdBy: recruiter.id, status: false })
        const jobsPromise = Job.find({ createdBy: recruiter.id }).lean().sort({ status: -1, createdAt: -1 }).skip(skip).limit(JOBS_PER_PAGE)

        const [jobCount, jobs, jobsOpen, jobsClosed, jobsStats] = await Promise.all([jobCountPromise, jobsPromise, jobOpenCountPromise, jobCloseCountPromise, jobsStatsPromise])

        // console.log(jobsStats)

        const recruiterData = {
            id: recruiter.id,
            name: recruiter.name,
            email: recruiter.email,
            recruiterAvatar: recruiter.recruiterAvatar
        }

        // console.log(jobsStats)


        let jobsData = jobs.map(job => ({
            id: job._id,
            title: job.title,
            desc: job.desc,
            skillsRequired: job.skillsRequired.sort((a, b) => a.length - b.length),
            jobCover: job.jobCover,
            experienceRequired: job.experienceRequired,
            status: job.status
        }))

        jobsData = jobsData.map(job => {
            const stat = jobsStats.find(
                s => s._id.toString() === job.id.toString()
            )

            return {
                ...job,
                stats: stat || {
                    totalApplications: 0,
                    acceptedApplications: 0,
                    rejectedApplications: 0,
                    applicationsRemainingToReview: 0,
                    applicationsSubmittedToday: 0
                }
            }
        })

        const applicationsStats = {
            totalApplications: 0,
            acceptedApplications: 0,
            rejectedApplications: 0,
            applicationsRemainingToReview: 0,
            applicationsSubmittedToday: 0
        }
        // console.log(applicationsStats)

        applicationsStats.totalApplications = jobsStats.reduce((acc, job) => acc + job.totalApplications, 0)
        applicationsStats.acceptedApplications = jobsStats.reduce((acc, job) => acc + job.acceptedApplications, 0)
        applicationsStats.rejectedApplications = jobsStats.reduce((acc, job) => acc + job.rejectedApplications, 0)
        applicationsStats.applicationsRemainingToReview = jobsStats.reduce((acc, job) => acc + job.applicationsRemainingToReview, 0)
        applicationsStats.applicationsSubmittedToday = jobsStats.reduce((acc, job) => acc + job.applicationsSubmittedToday, 0)

        const pageCount = Math.ceil(jobCount / JOBS_PER_PAGE)

        const pagination = {
            jobCount,
            pageCount,
            jobsData,
            jobsClosed,
            jobsOpen,
            applicationsStats
        }

        return res.status(200).json({ recruiter: recruiterData, pagination })
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

    if (applicationStatus !== 'Accepted' && applicationStatus !== 'Rejected')
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
        if (application.status === 'UnderReview') {

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