const { KNOWN_TECH } = require("./knownTech");

function normalize(text) {
    return text
        .toLowerCase()


        .replace(/[–—−]/g, " ")
        .replace(/[’‘]/g, "'")
        .replace(/[(){}\[\]]/g, " ")
        .replace(/[•·]/g, " ")
        .replace(/[,;]+/g, " ")

        .replace(/\b([a-z]+)\.js\b/g, "$1")


        .replace(/\bjava\s+script\b/g, "javascript")
        .replace(/\btype\s+script\b/g, "typescript")
        .replace(/\bmongo\s+db\b/g, "mongodb")
        .replace(/\bpostgre\s+sql\b/g, "postgresql")
        .replace(/\bmy\s+sql\b/g, "mysql")
        .replace(/\bgit\s+hub\b/g, "github")
        .replace(/\brestful\s+apis?\b/g, "rest api")
        .replace(/\brest\s+apis?\b/g, "rest api")
        .replace(/\bjson\s+web\s+tokens?\b/g, "jwt")
        .replace(/\bfile\s+uploading\b/g, "file uploads")
        .replace(/\bfile\s+handling\b/g, "file uploads")


        .replace(/\s+/g, " ")
        .trim();
}


function buildSkillMap(knownSkills) {
    const map = new Map();

    for (const skill of knownSkills) {
        map.set(normalize(skill), skill);
    }

    return map;
}

const NORMALIZED_SKILL_MAP = buildSkillMap(KNOWN_TECH);


function extractRelevantText(text) {
    let capture = false;
    const collected = [];

    text.split("\n").forEach(line => {
        const lower = line.toLowerCase().trim();

        if (/^(skills|education|projects?)\b/.test(lower)) {
            capture = true;
            return;
        }

        if (capture) {
            collected.push(line);
        }
    });

    return collected.join(" ");
}


function extractWordGroups(text) {
    const words = text
        .toLowerCase()
        .split(/[^a-z0-9+#/]+/)
        .filter(Boolean);

    const groups = [];

    for (let i = 0; i < words.length; i++) {
        groups.push(words[i]);
        if (i + 1 < words.length)
            groups.push(words[i] + " " + words[i + 1]);
        if (i + 2 < words.length)
            groups.push(words[i] + " " + words[i + 1] + " " + words[i + 2]);
    }

    return groups;
}

function extractSkills(text) {
    const skillSet = new Set();

    const relevantText = extractRelevantText(text);
    const wordGroups = extractWordGroups(relevantText);

    for (const group of wordGroups) {
        const normalized = normalize(group);

        if (NORMALIZED_SKILL_MAP.has(normalized)) {
            skillSet.add(NORMALIZED_SKILL_MAP.get(normalized));
        }
    }

    return [...skillSet];
}

function extractExperience(text) {
    const years = text.match(/\b(19|20)\d{2}\b/g);
    if (!years || years.length < 2) return 0;
    const nums = years.map(Number);
    return Math.max(...nums) - Math.min(...nums);
}

function extractSkillsAndExperience(text) {
    return {
        skills: extractSkills(text),
        experience: extractExperience(text)
    };
}

function normalizeJobSkill(skill) {
    return skill
        .toLowerCase()


        .replace(/[–—−]/g, " ")
        .replace(/[’‘]/g, "'")
        .replace(/[(){}\[\]]/g, " ")
        .replace(/[•·]/g, " ")
        .replace(/[,;]+/g, " ")


        .replace(/\b([a-z]+)\.js\b/g, "$1")

        .replace(/\bjava\s+script\b/g, "javascript")
        .replace(/\btype\s+script\b/g, "typescript")
        .replace(/\bmongo\s+db\b/g, "mongodb")
        .replace(/\bpostgre\s+sql\b/g, "postgresql")
        .replace(/\bmy\s+sql\b/g, "mysql")
        .replace(/\bgit\s+hub\b/g, "github")
        .replace(/\brestful\s+apis?\b/g, "rest api")
        .replace(/\brest\s+apis?\b/g, "rest api")
        .replace(/\bjson\s+web\s+tokens?\b/g, "jwt")
        .replace(/\bfile\s+uploading\b/g, "file uploads")
        .replace(/\bfile\s+handling\b/g, "file uploads")

        .replace(/\s+/g, " ")
        .trim();
}
function normalizeJobSkills(jobSkills) {
    const normalizedSet = new Set();

    for (const skill of jobSkills) {
        const normalized = normalizeJobSkill(skill);
        if (normalized) {
            normalizedSet.add(normalized);
        }
    }

    return [...normalizedSet];
}


module.exports = { extractSkillsAndExperience, normalizeJobSkills };
