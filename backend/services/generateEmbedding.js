// embedding.js
const axios = require("axios");

const HF_EMBEDDING_URL =
  "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

async function getEmbedding(text) {
  const res = await axios.post(
    HF_EMBEDDING_URL,
    {
      inputs: text.slice(0, 3000), // 👈 wrapping happens here
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  const data = res.data;
  return Array.isArray(data[0]) ? data[0] : data;
}

module.exports = { getEmbedding };
