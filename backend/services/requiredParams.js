
function normalize(skill) {
    return skill
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/java script/g, "javascript")
        .replace(/mongo db/g, "mongodb")
        .replace(/tailwind css/g, "tailwindcss")
        .replace(/rubyon rails/g, "ruby on rails")
        .replace(/tensor flow/g, "tensorflow")
        .replace(/py torch/g, "pytorch")
        .replace(/j query/g, "jquery")
        .replace(/\.js\b/g, ".js")
        .replace(/[.]+$/, "")
        .trim();
}


function looksLikeSkill(token) {
    if (!token) return false;

    if (token.length < 1 || token.length > 25) return false;

    if (token.split(" ").length > 3) return false;

    if (/[,:;]/.test(token)) return false;
    if (/\d+%/.test(token)) return false;
    if (/\b(ing|ed)\b/i.test(token)) return false;

    if (!/[a-zA-Z+#.]/.test(token)) return false;

    if (!/^[a-zA-Z0-9+#. \-]+$/.test(token)) return false;

    return true;
}


function looksLikeHumanName(skill) {
    return /^[a-z]+ [a-z]+$/.test(skill);
}

function looksLikeSection(skill) {
    return /\b(education|experience|projects|skills|achievements|social)\b/.test(skill);
}

function looksLikeRole(skill) {
    return /\b(engineer|developer|intern|manager)\b/.test(skill);
}

function looksLikeHobby(skill) {
    return /\b(chess|cricket|badminton|football|table-tennis)\b/.test(skill);
}

function looksLikeLocation(skill) {
    return /\b(state|city|india|jharkhand|dhanbad|iit)\b/.test(skill);
}

function isGarbage(skill) {
    if (/^project name\d*$/i.test(skill)) return true;

    if (/hackathons?/i.test(skill)) return true;

    return (
        looksLikeHumanName(skill) ||
        looksLikeSection(skill) ||
        looksLikeRole(skill) ||
        looksLikeHobby(skill) ||
        looksLikeLocation(skill) ||
        skill.split(" ").length > 3 ||
        /\b(etc|ranks|engagements|performance)\b/.test(skill)
    );
}

function extractSkills(text) {
    const skills = new Set();

    const tokens = text
        .split(/[\n•,|]/)
        .map(t => t.trim())
        .filter(Boolean);

    for (const token of tokens) {
        if (!looksLikeSkill(token)) continue;

        const normalized = normalize(token);

        if (normalized.length < 2) continue;
        if (isGarbage(normalized)) continue;

        skills.add(normalized);
    }

    return Array.from(skills);
}


function extractExperience(text) {
    const years = text.match(/\b(19|20)\d{2}\b/g);

    if (!years || years.some(y => y.includes("XX"))) {
        return 0;
    }

    if (years.length < 2) return 0;

    const nums = years.map(Number);
    return Math.max(...nums) - Math.min(...nums);
}


function extractSkillsAndExperience(text) {
    return {
        skills: extractSkills(text),
        experience: extractExperience(text)
    };
}

module.exports = { extractSkillsAndExperience };
