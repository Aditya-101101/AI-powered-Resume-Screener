const { getProfile } = require('../services/recruiterAuth')

function checkRecruiterAuth(cookie) {

    return (req, res, next) => {
        const token = req.cookies[cookie]
        if (!token)
            return next()

        const payload = getProfile(token)

        if (!payload) return next()

        if (payload.role === 'RECRUITER')
            req.recruiter = payload


        return next()
    }
}

module.exports = { checkRecruiterAuth }