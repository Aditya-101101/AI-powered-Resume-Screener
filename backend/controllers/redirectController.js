const redirectController = async (req, res) => {
    const { user, recruiter } = req

    if (user) {
        return res.status(200).json({
            loggedIn: true,
            role: "USER"
        })
    }

    if (recruiter) {
        return res.status(200).json({
            loggedIn: true,
            role: "RECRUITER"
        })
    }

    return res.status(401).json({ message: "unauthorized" })
}

module.exports = { redirectController }
