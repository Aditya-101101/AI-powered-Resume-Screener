let pipeline;
let extractor;

async function loadModel() {
    if (!pipeline) {
        const mod = await import("@xenova/transformers");
        pipeline = mod.pipeline;
    }

    if (!extractor) {
        console.log("Loading FLAN-T5 model...");
        extractor = await pipeline(
            "text2text-generation",
            "Xenova/flan-t5-base"
        );
        console.log("Model loaded!");
    }
}

async function extractFields(parsedText) {
    await loadModel();

    const prompt = `
Extract the following fields from the resume text:
- Full Name
- Email
- Phone Number
- Skills (list as a JSON array of strings)
- Total Experience (only years, number only)
- Education (highest degree)

Return the result in STRICT JSON format.
If a field is missing, return null.

Resume Text:
${parsedText}
`;

    const result = await extractor(prompt, {
        max_new_tokens: 300,
    });

    return result[0].generated_text;
}

module.exports = { extractFields };
