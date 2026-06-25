const { checkSimilarity } = require("./checkSimilarity");
const { normalizeJobSkills } = require("./requiredParams");

const WEIGHTS = {
    skills: 40,
    experience: 25,
    education: 10,
    keywords: 10,
};

const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "for", "to", "of", "in", "on", "at", "with",
    "is", "are", "was", "be", "by", "as", "we", "you", "your", "our", "will",
    "have", "has", "had", "this", "that", "from", "who", "can", "able", "work",
    "team", "role", "job", "position", "looking", "join", "us", "etc",
]);

const EDUCATION_LEVELS = [
    { level: 5, patterns: [/\bph\.?d\b/, /\bdoctorate\b/, /\bdoctoral\b/] },
    { level: 4, patterns: [/\bmaster'?s?\b/, /\bmba\b/, /\bm\.?tech\b/, /\bm\.?s\.?\b/, /\bpost\s*graduate\b/] },
    { level: 3, patterns: [/\bbachelor'?s?\b/, /\bb\.?tech\b/, /\bb\.?e\.?\b/, /\bb\.?sc\b/, /\bundergraduate\b/, /\bgraduate\s+degree\b/] },
    { level: 2, patterns: [/\bdiploma\b/, /\bassociate\b/] },
    { level: 1, patterns: [/\bhigh\s*school\b/, /\b12th\b/, /\b10th\b/, /\bhsc\b/, /\bssc\b/] },
];

function flattenEmbedding(data) {
    if (!Array.isArray(data)) return null;
    if (data.length === 0) return null;
    if (typeof data[0] === "number") return data;
    if (Array.isArray(data[0])) {
        const vectors = data.filter(Array.isArray);
        if (!vectors.length) return null;
        const dim = vectors[0].length;
        const averaged = new Array(dim).fill(0);
        for (const vec of vectors) {
            for (let i = 0; i < dim; i++) averaged[i] += vec[i];
        }
        return averaged.map((v) => v / vectors.length);
    }
    return null;
}

function analyzeSkillMatches(candidateSkills, jobSkills) {
    const originalSkills = jobSkills || [];
    if (!originalSkills.length) return [];

    const candidateSet = new Set(
        (candidateSkills || []).map((s) => s.toLowerCase().trim())
    );

    return originalSkills.map((skill) => {
        const normalized = normalizeJobSkills([skill])[0] || skill.toLowerCase();
        return {
            skill: formatSkillLabel(skill),
            matched: candidateSet.has(normalized),
        };
    });
}

function formatSkillLabel(skill) {
    if (!skill) return skill;
    return skill
        .split(/[\s-/]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function getMissingKeywords(resumeText, job) {
    const keywords = extractJobKeywords(job);
    const resumeLower = resumeText.toLowerCase();

    return keywords
        .filter((kw) => !resumeLower.includes(kw))
        .map((kw) => formatSkillLabel(kw))
        .slice(0, 8);
}

function buildExperienceSummary(candidateYears, requiredYears) {
    const required = Number(requiredYears) || 0;
    const candidate = Number(candidateYears) || 0;
    return { required, candidate };
}

function generateSuggestions({
    matchedSkills,
    experience,
    missingKeywords,
    resumeText,
    educationScore,
}) {
    const suggestions = [];
    const missingSkillNames = matchedSkills
        .filter((s) => !s.matched)
        .map((s) => s.skill);

    for (const skill of missingSkillNames.slice(0, 3)) {
        suggestions.push(`Add ${skill} experience`);
    }

    if (experience.required > 0 && experience.candidate < experience.required) {
        if (experience.candidate < 2) {
            suggestions.push("Mention internship projects");
        } else {
            suggestions.push(
                `Highlight experience closer to the required ${experience.required} years`
            );
        }
    }

    const hasProjects =
        /\bprojects?\b/i.test(resumeText) ||
        /internship/i.test(resumeText);

    if (!hasProjects && experience.candidate < experience.required) {
        suggestions.push("Mention internship projects");
    }

    for (const keyword of missingKeywords.slice(0, 2)) {
        suggestions.push(`Include "${keyword}" in your skills or project descriptions`);
    }

    if (educationScore < WEIGHTS.education * 0.5) {
        suggestions.push("Add relevant education details to strengthen your profile");
    }

    return [...new Set(suggestions)].slice(0, 6);
}

function buildAtsExplanation({
    resumeText,
    candidateSkills,
    candidateExperience,
    job,
    breakdown,
}) {
    const matchedSkills = analyzeSkillMatches(candidateSkills, job.skillsRequired);
    const experience = buildExperienceSummary(
        candidateExperience,
        job.experienceRequired
    );
    const missingKeywords = getMissingKeywords(resumeText, job);
    const suggestions = generateSuggestions({
        matchedSkills,
        experience,
        missingKeywords,
        resumeText,
        educationScore: breakdown.education,
    });

    return {
        matchedSkills,
        experience,
        missingKeywords,
        suggestions,
    };
}

function scoreSkills(candidateSkills, jobSkills) {
    const normalizedJob = normalizeJobSkills(jobSkills || []);
    if (!normalizedJob.length) return WEIGHTS.skills;

    const candidateSet = new Set(
        (candidateSkills || []).map((s) => s.toLowerCase().trim())
    );

    let matched = 0;
    for (const skill of normalizedJob) {
        if (candidateSet.has(skill)) matched++;
    }

    const ratio = matched / normalizedJob.length;
    return Math.round(ratio * WEIGHTS.skills);
}

function scoreExperience(candidateYears, requiredYears) {
    const required = Number(requiredYears) || 0;
    const candidate = Number(candidateYears) || 0;

    if (required === 0) return WEIGHTS.experience;
    if (candidate >= required) return WEIGHTS.experience;

    const gap = required - candidate;
    const penalty = Math.min(gap * 5, WEIGHTS.experience);
    return Math.max(0, WEIGHTS.experience - penalty);
}

function detectEducationLevel(text) {
    const lower = text.toLowerCase();
    for (const { level, patterns } of EDUCATION_LEVELS) {
        if (patterns.some((p) => p.test(lower))) return level;
    }
    return 0;
}

function extractEducationText(resumeText) {
    const lines = resumeText.split("\n");
    let capturing = false;
    const collected = [];

    for (const line of lines) {
        const lower = line.toLowerCase().trim();
        if (/^education\b/.test(lower)) {
            capturing = true;
            continue;
        }
        if (capturing && /^(experience|skills?|projects?|achievements?|certifications?)\b/.test(lower)) {
            break;
        }
        if (capturing) collected.push(line);
    }

    return collected.length ? collected.join(" ") : resumeText;
}

function inferRequiredEducation(job) {
    const text = `${job.title || ""} ${job.desc || ""}`.toLowerCase();
    return detectEducationLevel(text);
}

function scoreEducation(resumeText, job) {
    const educationText = extractEducationText(resumeText);
    const candidateLevel = detectEducationLevel(educationText);
    const requiredLevel = inferRequiredEducation(job);

    if (requiredLevel === 0) {
        return candidateLevel > 0 ? WEIGHTS.education : Math.round(WEIGHTS.education * 0.7);
    }
    if (candidateLevel >= requiredLevel) return WEIGHTS.education;
    if (candidateLevel === 0) return 0;

    const ratio = candidateLevel / requiredLevel;
    return Math.round(ratio * WEIGHTS.education);
}

function extractJobKeywords(job) {
    const raw = [
        job.title || "",
        job.desc || "",
        ...(job.skillsRequired || []),
    ].join(" ");

    const tokens = raw
        .toLowerCase()
        .replace(/[^a-z0-9+#/.\s-]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

    return [...new Set(tokens)];
}

function scoreKeywordDensity(resumeText, job) {
    const keywords = extractJobKeywords(job);
    if (!keywords.length) return WEIGHTS.keywords;

    const resumeLower = resumeText.toLowerCase();
    let matched = 0;

    for (const keyword of keywords) {
        if (resumeLower.includes(keyword)) matched++;
    }

    const densityRatio = matched / keywords.length;
    return Math.round(densityRatio * WEIGHTS.keywords);
}

function scoreEmbeddingSimilarity(resumeEmbedding, jobEmbedding) {
    const resumeVec = flattenEmbedding(resumeEmbedding);
    const jobVec = flattenEmbedding(jobEmbedding);

    if (!resumeVec || !jobVec || resumeVec.length !== jobVec.length) {
        return 0;
    }

    const similarity = checkSimilarity(resumeVec, jobVec);
    const clamped = Math.max(0, Math.min(1, Number.isFinite(similarity) ? similarity : 0));
    return Math.round(clamped * WEIGHTS.keywords);
}

function scoreKeywords(resumeText, job, resumeEmbedding, jobEmbedding) {
    const densityScore = scoreKeywordDensity(resumeText, job);
    const embeddingScore = scoreEmbeddingSimilarity(resumeEmbedding, jobEmbedding);

    return Math.min(WEIGHTS.keywords, Math.round((densityScore + embeddingScore) / 2));
}

function calculateAtsScore({
    resumeText,
    candidateSkills,
    candidateExperience,
    resumeEmbedding,
    job,
}) {
    const breakdown = {
        skills: scoreSkills(candidateSkills, job.skillsRequired),
        experience: scoreExperience(candidateExperience, job.experienceRequired),
        education: scoreEducation(resumeText, job),
        keywords: scoreKeywords(resumeText, job, resumeEmbedding, job.embedding),
    };

    const rawScore =
        breakdown.skills +
        breakdown.experience +
        breakdown.education +
        breakdown.keywords;

    const explanation = buildAtsExplanation({
        resumeText,
        candidateSkills,
        candidateExperience,
        job,
        breakdown,
    });

    return {
        score: rawScore,
        breakdown,
        explanation,
    };
}

module.exports = {
    calculateAtsScore,
    flattenEmbedding,
    WEIGHTS,
};
