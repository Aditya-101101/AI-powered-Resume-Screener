const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

const createProfile = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        userAvatar: user.userAvatar,
        role: user.role
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