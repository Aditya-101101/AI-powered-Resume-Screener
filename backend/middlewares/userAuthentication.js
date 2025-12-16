const { getProfile } = require('../services/userAuth')

function checkUserAuth(cookie) {

    return (req, res, next) => {
        const token = req.cookies[cookie]
        if (!token)
            return next()

        const payload = getProfile(token)

        if (!payload) return next()

        if (payload.role === 'USER')
            req.user = payload


        return next()
    }
}

module.exports = { checkUserAuth }