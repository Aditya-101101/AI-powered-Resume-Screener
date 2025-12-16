const {pipeline} = require('@xenova/transformers')

let embedder;

async function loadModel() {
    if (!embedder) {
        console.log("Loading model...");
        embedder = await pipeline(
            "feature-extraction",
            "Xenova/all-mpnet-base-v2"
        );
        console.log("Model loaded!");
    }
}

export async function getEmbedding(text) {
    await loadModel();

    const output = await embedder(text, {
        pooling: "mean",
        normalize: true,
    });

    return Array.from(output.data);
}
