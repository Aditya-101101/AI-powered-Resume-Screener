const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true,
    },
    skillsRequired: {
        type: [String],
    },
    jobCoverUrl: {
        type: String,
        // default: '/uploads/profilePic.png'
    },
    experienceRequired: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recruiter'
    },
    status: {
        type: Boolean,
        default: true
    },
    embedding: [Number]

}, { timestamps: true })

JobSchema.pre('save', function () {
  if (!this.isModified('skillsRequired')) return;

  if (!Array.isArray(this.skillsRequired)) {
    this.skillsRequired = [];
    return;
  }

  this.skillsRequired = [
    ...new Set(this.skillsRequired.map(skill => skill.toLowerCase()))
  ];
});


const Job = mongoose.model('job', JobSchema)
module.exports = Job