const express = require('express')
const dotenv = require('dotenv')
const Application = require('../models/applicationSchema')
const { generateApplicationReview } = require('../services/generateReview')
const Job = require('../models/jobSchema')
dotenv.config()

const JOBS_PER_PAGE = process.env.JOBS_PER_PAGE

const allJobs = async (req, res) => {
    const page = Math.max(1, req.query.page || 1)

    const query = {}

    try {
        const skip = (page - 1) * JOBS_PER_PAGE
        const jobCountPromise = Job.countDocuments()

        const jobsPromise = Job.find({ status: true }, {
            title: 1,
            desc: 1,
            jobCover: 1,
            skillsRequired: 1,
            experienceRequired: 1
        }).skip(skip).limit(JOBS_PER_PAGE)

        const [jobCount, jobs] = await Promise.all([jobCountPromise, jobsPromise])

        const pageCount = Math.ceil(jobCount / JOBS_PER_PAGE)

        if (!jobs || jobs.length === 0)
            return res.json({ jobs: [] });

        // console.log(jobs)
        const pagination = {
            jobCount,
            pageCount,
        }

        return res.status(200).json({ jobs: jobs, pagination })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

const APPLICATIONS_PER_PAGE = Number(process.env.APPLICATIONS_PER_PAGE + 6)

const job = async (req, res) => {
    const recruiter = req.recruiter
    const jobId = req.query.jobId
    const page = Math.max(1, req.query.page || 1)

    const query = {}

    if (!recruiter)
        return res.status(401).json({ message: "Unauthenticated" })

    if (!jobId)
        return res.status(400).json({ message: "wrong Request!" })

    // console.log(jobId)
    try {
        const skip = (page - 1) * APPLICATIONS_PER_PAGE
        const job = await Job.findOne({ _id: jobId, createdBy: recruiter.id })

        if (!job)
            return res.status(403).json({ message: "Unauthorized" })

        const applicationCountPromise = Application.countDocuments({ jobId: jobId })

        const applicationsPromise = Application.find(
            { jobId: jobId },
            {
                skills: 1,
                experience: 1,
                atsScore: 1,
                status: 1,
                submittedBy: 1,
                createdAt: 1,
                resume: 1,
                jobId: 1
            }
        ).sort({ atsScore: -1 }).populate("submittedBy", { name: 1, email: 1 }).skip(skip).limit(APPLICATIONS_PER_PAGE)

        const response = await Application.updateMany({ jobId: jobId }, { status: "UnderReview" })

        if (response.modifiedCount !== response.matchedCount)
            return res.status(500).json({ message: "Error updating Status!" })

        const [applicationCount, applications] = await Promise.all([applicationCountPromise, applicationsPromise])

        const pageCount = Math.ceil(applicationCount / APPLICATIONS_PER_PAGE)

        const pagination = {
            applicationCount,
            pageCount
        }

        return res.status(200).json({ applications: applications, pagination })
    } catch (err) {
        return res.status(500).json({ message: "error fetching the applications" })
    }
}

const generateReview = async (req, res) => {
    const recruiter = req.recruiter
    const application = req.body.application
    if (!recruiter)
        return res.status(401).json({ message: "unauthenticated" })
    if (!application || !application.jobId || !application.resume) {
        return res.status(400).json({
            message: "jobId and resume are required"
        });
    }

    try {
        const job = await Job.findById(application.jobId)
        if (job.createdBy.toString() !== recruiter.id)
            return res.status(403).json({ message: "unauthorized" })

        const review = await generateApplicationReview(application.resume, job)

        if (!review)
            return res.status(500).json({ message: "some error occured while generating review" })

        return res.status(201).json({ review: review })

    } catch (err) {
        return res.status(500).json({ error: err })
    }
}


const jobController = {
    allJobs,
    job,
    generateReview
}

module.exports = { jobController }