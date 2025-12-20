const mongoose = require('mongoose')

const ApplicationSchema = new mongoose.Schema({
    skills: {
        type: [String],
        required: true
    },
    experience: {
        type: Number,
        default: 0
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'job'
    },
    status: {
        type: String,
        enum: ["Applied", "UnderProcessing", "Accepted", "Rejected"],
        default: "Applied"
    },
    atsScore: {
        type: Number,
        required: true,

    },
    resume: {
        type: String,
        required: true
    }
}, { timestamps: true, })

ApplicationSchema.index(
    { submittedBy: 1, jobId: 1 },
    { unique: true }
)

ApplicationSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 30 }
)

ApplicationSchema.pre('save', function () {
    if (!this.isModified('skills')) return ;

    this.skills = [...new Set(
        this.skills.map(skill => skill.toLowerCase())
    )];

    return;
});

ApplicationSchema.pre('findOneAndUpdate', function () {
    const update = this.getUpdate();

    if (update?.skills) {
        update.skills = [...new Set(
            update.skills.map(skill => skill.toLowerCase())
        )];
    }

    return;
});

const Application = mongoose.model('application', ApplicationSchema)
module.exports = Application