const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
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
        required: true,
    },
    userAvatar: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "USER"
    }

}, { timestamps: true })

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});


UserSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model('user', UserSchema)
module.exports = User