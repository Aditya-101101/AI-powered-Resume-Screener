const pdfParse = require('pdf-parse')
const axios = require('axios')
const { cleanResumeText } = require('../services/textCleaner')
const { extractSkillsAndExperience } = require('../services/requiredParams')


const generateApplicationReview = async (resumeUrl, job) => {

    const resume = await axios.get(resumeUrl, { responseType: "arraybuffer" })
    const parsedResume = await pdfParse(resume)
    const text = parsedResume.text
    const cleanedText = cleanResumeText(text)
    const extracted = extractSkillsAndExperience(cleanedText)
    console.log(parsedResume)
    console.log(text)
    console.log(cleanedText)
    console.log(extracted)

}

module.exports = { generateApplicationReview }