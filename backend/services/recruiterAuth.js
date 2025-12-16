const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

const createProfile = (recruiter) => {
    const payload = {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        recruiterAvatar: recruiter.recruiterAvatar,
        role: recruiter.role
    }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' })
    return token

}

const getProfile = (token) => {
    if (!token) return null
    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        return payload;
    } catch (err) {
        return null;
    }
}

module.exports = {
    createProfile,
    getProfile
}