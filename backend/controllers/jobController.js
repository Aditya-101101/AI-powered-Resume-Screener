const express = require('express')
const Application = require('../models/applicationSchema')
const Job = require('../models/jobSchema')

const allJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: true }, {
            title: 1,
            desc: 1,
            jobCoverUrl: 1,
            skillsRequired: 1,
            experienceRequired: 1
        })

        if (!jobs || jobs.length === 0)
            return res.json({ jobs: [] });

        return res.status(200).json({ jobs: jobs });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


const job = async (req, res) => {
    const recruiter = req.recruiter
    if (!recruiter)
        return res.status(401).json({ message: "Unauthenticated" })

    const jobId = req.params.jobId

    try {
        const job = await Job.findOne({ _id: jobId, createdBy: recruiter.id })

        if (!job)
            return res.status(404).json({ message: "job not found" })
        
        const applications = await Application.find(
            { jobId: jobId },
            {
                skills: 1,
                experience: 1,
                atsScore: 1,
                status: 1,
                submittedBy: 1,
                createdAt: 1
            }
        ).sort({ atsScore: -1 })

        return res.status(200).json({ applications: applications })
    } catch (err) {
        return res.status(500).json({ message: "error fetching the applications" })
    }
}


const jobController = {
    allJobs,
    job
}

module.exports = { jobController }