const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const RecruiterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    recruiterAvatar: {
        type: String,
    },
    role: {
        type: String,
        default: "RECRUITER"
    }

}, { timestamps: true })

RecruiterSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});


RecruiterSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};

const Recruiter = mongoose.model('recruiter', RecruiterSchema)
module.exports = Recruiter