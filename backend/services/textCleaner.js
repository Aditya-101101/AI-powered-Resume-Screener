function cleanResumeText(rawText) {
    if (!rawText || typeof rawText !== "string") return "";

    let text = rawText;

    text = text.replace(/([a-z])([A-Z])/g, "$1 $2");

    text = text.replace(/[•§ï#]/g, " ");

    text = text.replace(
        /(https?:\/\/)?(www\.)?(linkedin|github)\.com\/[^\s]+/gi,
        " "
    );

    text = text.replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        " "
    );
    text = text.replace(/\+?\d[\d\s\-()]{7,}\d/g, " ");

    text = text.replace(/\bname\d*\b/gi, " ");

    text = text.replace(/\b(education)\b/gi, "\nEducation\n");
    text = text.replace(/\b(experience)\b/gi, "\nExperience\n");
    text = text.replace(/\b(projects?)\b/gi, "\nProjects\n");
    text = text.replace(/\b(skills?)\b/gi, "\nSkills\n");
    text = text.replace(/\b(achievements?)\b/gi, "\nAchievements\n");

    text = text.replace(/\s*\n\s*/g, "\n");
    text = text.replace(/[ \t]{2,}/g, " ");


    text = text.replace(/[.]{2,}/g, ".");

    return text.trim();
}

module.exports = { cleanResumeText };
