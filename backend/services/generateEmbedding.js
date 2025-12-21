let pipeline
let embedder

async function loadModel() {
    if (!pipeline) {
        const mod = await import("@xenova/transformers");
        pipeline = mod.pipeline;
    }

    if (!embedder) {
        console.log("Loading model...");
        embedder = await pipeline(
            "feature-extraction",
            "Xenova/all-mpnet-base-v2"
        );
        console.log("Model loaded!");
    }
}

async function getEmbedding(text) {
    await loadModel();

    const output = await embedder(text, {
        pooling: "mean",
        normalize: true,
    });

    return Array.from(output.data);
}

module.exports = { getEmbedding };
