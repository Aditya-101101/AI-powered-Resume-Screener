const pdfParse = require('pdf-parse');
const axios = require('axios');
const { cleanResumeText } = require('../services/textCleaner');
const { extractSkillsAndExperience, normalizeJobSkills } = require('../services/requiredParams');

const SCORING_CONFIG = {
    MAX_EXP_SCORE: 10,
    MAX_SKILL_SCORE: 20,
    THRESHOLDS: {
        STRONG: 24,
        MODERATE: 16
    }
};


const fetchAndParseResume = async (resumeUrl) => {
    try {
        const response = await axios.get(resumeUrl, { responseType: "arraybuffer" });
        const parsed = await pdfParse(response.data);
        return cleanResumeText(parsed.text);
    } catch (error) {
        throw new Error(`Failed to process resume: ${error.message}`);
    }
};


const calculateExperienceScore = (required, actual) => {
    const gap = required - actual;
    let multiplier = 2;
    if (gap <= 0) return SCORING_CONFIG.MAX_EXP_SCORE;
    if (required <= 2 && actual < required / 2)
        multiplier = 4;
    const penalty = gap * multiplier;
    return Math.max(0, SCORING_CONFIG.MAX_EXP_SCORE - penalty);
};


const analyzeSkills = (candidateSkills, jobSkills) => {

    const candidateSkillSet = new Set(candidateSkills.map(s => s.toLowerCase()));

    let matchCount = 0;
    jobSkills.forEach(skill => {
        if (candidateSkillSet.has(skill.toLowerCase())) {
            matchCount++;
        }
    });

    const missingCount = jobSkills.length - matchCount;
    let score = 0;


    if (missingCount <= 2) score = SCORING_CONFIG.MAX_SKILL_SCORE;
    else if (missingCount <= 5) score = 13;
    else score = Math.max(0, 20 - missingCount * 2);

    return { matchCount, totalSkills: jobSkills.length, score };
};

const generateFeedbackText = (expScore, skillMatchRatio, totalScore) => {
    let experienceText;
    if (expScore >= 8) experienceText = "Candidate meets or exceeds the required experience.";
    else if (expScore >= 4) experienceText = "Candidate experience is slightly below the requirement.";
    else experienceText = "Candidate experience is significantly below the requirement.";

    let skillsText;
    if (skillMatchRatio === 1) skillsText = "All required skills are present in the resume.";
    else if (skillMatchRatio >= 0.5) skillsText = "Candidate matches a good portion of the required skills.";
    else skillsText = "Candidate matches only a few or none of the required skills.";

    let overallText;
    if (totalScore >= SCORING_CONFIG.THRESHOLDS.STRONG) overallText = "Strong Fit";
    else if (totalScore >= SCORING_CONFIG.THRESHOLDS.MODERATE) overallText = "Moderate Fit";
    else overallText = "Weak Fit";

    return { experience: experienceText, skills: skillsText, overall: overallText };
};


const generateApplicationReview = async (resumeUrl, job) => {
    try {
        const cleanedText = await fetchAndParseResume(resumeUrl);
        const extracted = extractSkillsAndExperience(cleanedText);
        // console.log(extracted)
        // console.log(job)
        const expRequired = Number(job.experienceRequired) || 0;
        const expCandidate = Number(extracted.experience) || 0;
        const jobSkills = normalizeJobSkills(job.skillsRequired)
        // console.log(jobSkills)
        const skillAnalysis = analyzeSkills(extracted.skills || [], jobSkills || []);
        const experienceScore = (skillAnalysis.matchCount <= skillAnalysis.totalSkills * 0.3 ? 0 : calculateExperienceScore(expRequired, expCandidate));

        const totalScore = experienceScore + skillAnalysis.score;

        const textualReview = generateFeedbackText(
            experienceScore,
            skillAnalysis.matchCount / skillAnalysis.totalSkills,
            totalScore
        );

        return {
            numericReview: {
                experienceScore,
                skillsScore: skillAnalysis.score,
                totalScore
            },
            textualReview,
            meta: {
                matchedSkills: skillAnalysis.matchCount,
                totalSkills: skillAnalysis.totalSkills,
                extractedExperience: expCandidate
            }
        };

    } catch (error) {
        console.error("Error generating review:", error);
        return { error: error.message };
    }
};

module.exports = { generateApplicationReview };