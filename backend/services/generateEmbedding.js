const axios = require("axios");

const HF_URL =
  "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-mpnet-base-v2/pipeline/feature-extraction";



async function getEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("getEmbedding expects a non-empty string");
  }

  const res = await axios.post(
    HF_URL,
    {
      inputs: text,
      options: { wait_for_model: true }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    }
  );
  return res.data;
}

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

async function getNormalizedEmbedding(text) {
  const raw = await getEmbedding(text);
  return flattenEmbedding(raw);
}

module.exports = { getEmbedding, flattenEmbedding, getNormalizedEmbedding };
