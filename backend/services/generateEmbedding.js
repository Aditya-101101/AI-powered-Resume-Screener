const axios = require("axios");

const HF_EMBEDDING_URL =
  "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2";

async function getEmbedding(text) {
  const res = await axios.post(
    HF_EMBEDDING_URL,
    {
      inputs: text.slice(0, 3000),
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  // Response shape: [[float, float, ...]]
  return res.data[0];
}

module.exports = { getEmbedding };
