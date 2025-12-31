const axios = require("axios");

const HF_EMBEDDING_URL =
  "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

async function getEmbedding(text) {
  const res = await axios.post(
    HF_EMBEDDING_URL,
    text.slice(0, 3000), // plain text, not { inputs }
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  // HF returns nested arrays → flatten
  const vector = res.data[0] ?? res.data;
  return vector;
}

module.exports = { getEmbedding };
