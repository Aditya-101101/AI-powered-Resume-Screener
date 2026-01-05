const mongoose = require('mongoose')

const FeedbackSchema = new mongoose.Schema({
    feedback: {
        type: [String],
        required: true,
        trim: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'job',
        required: true
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'application',
        required: true,
        unique: true
    }

}, { timestamps: true })

FeedbackSchema.index(
    { applicationId: 1, jobId: 1 },
    { unique: true }
)

FeedbackSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 40 }
)

const Feedback = mongoose.model('feedback', FeedbackSchema)
module.exports = Feedback