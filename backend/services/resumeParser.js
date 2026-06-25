const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const axios = require("axios");
const { cleanResumeText } = require("./textCleaner");
const { extractSkills } = require("./requiredParams");

const SUPPORTED_MIMETYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

const SUPPORTED_EXTENSIONS = {
    ".pdf": "pdf",
    ".docx": "docx",
};

const SECTION_HEADERS = {
    education: /^(education|academic\s+background|qualifications?|academics?)\s*$/i,
    experience: /^(experience|work\s+experience|employment(\s+history)?|professional\s+experience|work\s+history|career)\s*$/i,
    skills: /^(skills?|technical\s+skills?|core\s+competencies|technologies|tech\s+stack)\s*$/i,
    projects: /^(projects?|personal\s+projects?|key\s+projects?|portfolio)\s*$/i,
    contact: /^(contact(\s+info(rmation)?)?|personal\s+details?)\s*$/i,
};

const MONTH_MAP = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function detectFileType(filePath, mimetype) {
    if (mimetype && SUPPORTED_MIMETYPES[mimetype]) {
        return SUPPORTED_MIMETYPES[mimetype];
    }
    const ext = path.extname(filePath).toLowerCase();
    return SUPPORTED_EXTENSIONS[ext] || null;
}

function isSupportedResume(filePath, mimetype) {
    return Boolean(detectFileType(filePath, mimetype));
}

async function extractTextFromBuffer(buffer, fileType) {
    if (fileType === "pdf") {
        const parsed = await pdfParse(buffer);
        return parsed.text || "";
    }
    if (fileType === "docx") {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || "";
    }
    throw new Error("Unsupported resume format");
}

async function extractTextFromFile(filePath, mimetype) {
    const fileType = detectFileType(filePath, mimetype);
    if (!fileType) throw new Error("Unsupported resume format");

    const buffer = await fs.promises.readFile(filePath);
    return extractTextFromBuffer(buffer, fileType);
}

async function extractTextFromUrl(url) {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const urlPath = new URL(url).pathname.toLowerCase();
    const fileType = SUPPORTED_EXTENSIONS[path.extname(urlPath)] || "pdf";
    return extractTextFromBuffer(Buffer.from(response.data), fileType);
}

function extractEmail(text) {
    const match = text.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    );
    return match ? match[0].toLowerCase() : null;
}

function extractPhone(text) {
    const patterns = [
        /\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/,
        /\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/,
        /\b\d{10}\b/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const digits = match[0].replace(/\D/g, "");
            if (digits.length >= 10 && digits.length <= 15) {
                return match[0].trim();
            }
        }
    }
    return null;
}

function extractName(text, email) {
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    const skipPattern =
        /^(resume|curriculum\s+vitae|cv|phone|email|address|linkedin|github|http|www\.|@)/i;

    for (const line of lines.slice(0, 8)) {
        if (skipPattern.test(line)) continue;
        if (email && line.includes(email)) continue;
        if (/\d{3,}/.test(line)) continue;
        if (line.length > 60) continue;

        const nameMatch = line.match(
            /^[A-Z][a-z]+(?:\s+[A-Z][a-z.'-]+){1,4}$/
        );
        if (nameMatch) return nameMatch[0];

        const simpleName = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/);
        if (simpleName && simpleName[0].split(/\s+/).length <= 5) {
            return simpleName[0];
        }
    }

    if (email) {
        const local = email.split("@")[0];
        const parts = local.split(/[._-]/).filter((p) => p.length > 1);
        if (parts.length >= 2) {
            return parts
                .slice(0, 3)
                .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
                .join(" ");
        }
    }

    return null;
}

function splitIntoSections(text) {
    const lines = text.split(/\r?\n/).map((l) => l.trim());
    const sections = {
        header: [],
        education: [],
        experience: [],
        skills: [],
        projects: [],
        other: [],
    };

    let current = "header";

    for (const line of lines) {
        if (!line) continue;

        let matched = false;
        for (const [section, pattern] of Object.entries(SECTION_HEADERS)) {
            if (pattern.test(line)) {
                current = section;
                matched = true;
                break;
            }
        }
        if (matched) continue;

        if (sections[current]) {
            sections[current].push(line);
        } else {
            sections.other.push(line);
        }
    }

    return sections;
}

function parseDateToken(token) {
    if (!token) return null;
    const lower = token.toLowerCase().trim();
    if (/present|current|now|ongoing/i.test(lower)) {
        return new Date();
    }

    const monthYear = lower.match(
        /^(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s,.'-]+((?:19|20)\d{2})$/i
    );
    if (monthYear) {
        const monthKey = monthYear[1].slice(0, 3).toLowerCase();
        return new Date(Number(monthYear[2]), MONTH_MAP[monthKey] ?? 0, 1);
    }

    const yearOnly = lower.match(/\b((?:19|20)\d{2})\b/);
    if (yearOnly) return new Date(Number(yearOnly[1]), 0, 1);

    return null;
}

function parseDateRange(text) {
    const rangeMatch = text.match(
        /((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)?[\s,.'-]*(?:19|20)\d{2})\s*(?:[-–—→]|to)\s*((?:present|current|now|ongoing)|(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)?[\s,.'-]*(?:19|20)\d{2}))/i
    );

    if (!rangeMatch) return null;

    const start = parseDateToken(rangeMatch[1]);
    const end = parseDateToken(rangeMatch[2]);
    if (!start || !end) return null;

    return { start, end, raw: rangeMatch[0] };
}

function yearsBetween(start, end) {
    const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
    return Math.max(0, months / 12);
}

function extractEducation(educationLines) {
    if (!educationLines?.length) return [];

    const entries = [];
    let current = null;

    const flush = () => {
        if (current && (current.degree || current.institution || current.details)) {
            entries.push(current);
        }
        current = null;
    };

    for (const line of educationLines) {
        const range = parseDateRange(line);
        const degreeMatch = line.match(
            /\b(b\.?\s*tech|b\.?\s*e\.?|b\.?\s*sc|b\.?\s*a|m\.?\s*tech|m\.?\s*s|m\.?\s*b\.?a|mba|ph\.?d|bachelor|master|diploma|bca|mca|degree)[^,\n]*/i
        );

        if (degreeMatch || range) {
            flush();
            current = {
                degree: degreeMatch ? degreeMatch[0].trim() : null,
                institution: null,
                period: range ? range.raw : null,
                details: line,
            };

            const withoutDegree = degreeMatch
                ? line.replace(degreeMatch[0], "").replace(range?.raw || "", "").trim()
                : line;
            const institution = withoutDegree
                .replace(/^[,|–—-]+/, "")
                .replace(/[,|–—-]+$/, "")
                .trim();
            if (institution && institution.length > 2) {
                current.institution = institution;
            }
            continue;
        }

        if (!current) {
            current = { degree: null, institution: null, period: null, details: line };
        } else {
            current.details = current.details
                ? `${current.details} ${line}`
                : line;
            if (!current.institution && line.length > 3) {
                current.institution = line;
            }
        }
    }

    flush();
    return entries;
}

function extractExperienceHistory(experienceLines) {
    if (!experienceLines?.length) return [];

    const entries = [];
    let current = null;

    const flush = () => {
        if (current && (current.title || current.company || current.details)) {
            entries.push(current);
        }
        current = null;
    };

    for (const line of experienceLines) {
        const range = parseDateRange(line);
        const atCompany = line.match(/^(.+?)\s+(?:at|@)\s+(.+?)(?:\s*[-–—|]|$)/i);
        const titleCompany = line.match(/^([^,–—-]+?)\s*[,–—|-]\s*(.+)$/);

        if (range) {
            if (!current) {
                current = { title: null, company: null, period: range.raw, details: line };
            } else {
                current.period = range.raw;
                if (!current.details.includes(range.raw)) {
                    current.details = `${current.details} | ${line}`;
                }
            }
            continue;
        }

        if (atCompany) {
            flush();
            current = {
                title: atCompany[1].trim(),
                company: atCompany[2].replace(range?.raw || "", "").trim(),
                period: null,
                details: line,
            };
            continue;
        }

        if (titleCompany && line.length < 120) {
            flush();
            current = {
                title: titleCompany[1].trim(),
                company: titleCompany[2].trim(),
                period: null,
                details: line,
            };
            continue;
        }

        if (!current) {
            current = { title: line, company: null, period: null, details: line };
        } else {
            current.details = current.details
                ? `${current.details} ${line}`
                : line;
        }
    }

    flush();
    return entries;
}

function calculateTotalExperienceYears(experienceHistory, experienceLines) {
    const ranges = [];

    for (const entry of experienceHistory) {
        const range = parseDateRange(entry.period || entry.details || "");
        if (range) ranges.push(range);
    }

    if (!ranges.length && experienceLines?.length) {
        const joined = experienceLines.join(" ");
        const globalRanges = joined.match(
            /(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)?[\s,.'-]*(?:19|20)\d{2})\s*(?:[-–—→]|to)\s*(?:(?:present|current|now|ongoing)|(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)?[\s,.'-]*(?:19|20)\d{2}))/gi
        );
        if (globalRanges) {
            for (const raw of globalRanges) {
                const range = parseDateRange(raw);
                if (range) ranges.push(range);
            }
        }
    }

    if (ranges.length) {
        const total = ranges.reduce(
            (sum, r) => sum + yearsBetween(r.start, r.end),
            0
        );
        return Math.min(30, Math.round(total * 10) / 10);
    }

    const years = experienceLines?.join(" ").match(/\b(19|20)\d{2}\b/g);
    if (years && years.length >= 2) {
        const nums = years.map(Number);
        return Math.min(30, Math.max(...nums) - Math.min(...nums));
    }

    return 0;
}

function extractProjects(projectLines) {
    if (!projectLines?.length) return [];

    const projects = [];
    let current = null;

    const flush = () => {
        if (current && (current.title || current.description)) {
            projects.push(current);
        }
        current = null;
    };

    for (const line of projectLines) {
        const isBullet = /^[-•*▪▸]\s*/.test(line);
        const cleaned = line.replace(/^[-•*▪▸]\s*/, "").trim();
        const techMatch = cleaned.match(/\b(?:using|built with|tech(?:nologies)?)\s*:?\s*(.+)$/i);

        if (!current || (!isBullet && cleaned.length < 80 && !techMatch)) {
            flush();
            current = {
                title: cleaned,
                description: "",
                technologies: [],
            };
            if (techMatch) {
                current.technologies = techMatch[1]
                    .split(/[,|/]/)
                    .map((t) => t.trim())
                    .filter(Boolean);
            }
            continue;
        }

        if (current) {
            current.description = current.description
                ? `${current.description} ${cleaned}`
                : cleaned;
            if (techMatch) {
                current.technologies = techMatch[1]
                    .split(/[,|/]/)
                    .map((t) => t.trim())
                    .filter(Boolean);
            }
        }
    }

    flush();
    return projects;
}

function parseResumeText(rawText) {
    if (!rawText || typeof rawText !== "string") {
        throw new Error("Resume text is empty");
    }

    const email = extractEmail(rawText);
    const phone = extractPhone(rawText);
    const name = extractName(rawText, email);
    const cleanedText = cleanResumeText(rawText);
    const sections = splitIntoSections(cleanedText);

    const skills = extractSkills(cleanedText);
    const education = extractEducation(sections.education);
    const experienceHistory = extractExperienceHistory(sections.experience);
    const experience = calculateTotalExperienceYears(
        experienceHistory,
        sections.experience
    );
    const projects = extractProjects(sections.projects);

    return {
        name,
        email,
        phone,
        skills: [...new Set(skills.map((s) => s.toLowerCase()))],
        education,
        experience,
        experienceHistory,
        projects,
        cleanedText,
    };
}

async function parseResumeFile(filePath, mimetype) {
    const rawText = await extractTextFromFile(filePath, mimetype);

    if (!rawText || rawText.replace(/\s/g, "").length < 50) {
        throw new Error("Invalid or scanned resume — not enough extractable text");
    }

    return parseResumeText(rawText);
}

async function parseResumeFromUrl(url) {
    const rawText = await extractTextFromUrl(url);

    if (!rawText || rawText.replace(/\s/g, "").length < 50) {
        throw new Error("Unable to extract text from resume file");
    }

    return parseResumeText(rawText);
}

module.exports = {
    parseResumeFile,
    parseResumeText,
    parseResumeFromUrl,
    extractTextFromFile,
    isSupportedResume,
    detectFileType,
    SUPPORTED_MIMETYPES,
};
