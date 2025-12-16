function cleanResumeText(text) {
    text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "");

    text = text.replace(/\+?\d[\d\s\-()]{7,}\d/g, "");
    text = text.replace(/(contact|email|phone|mobile)[:\-]?\s*/gi, "");

    let lines = text.split("\n");
    if (/^[A-Za-z\s]{3,40}$/.test(lines[0].trim())) {
        lines.shift();
    }
    text = lines.join("\n");


    return text.replace(/\s+/g, " ").trim();
}

module.exports = { cleanResumeText }