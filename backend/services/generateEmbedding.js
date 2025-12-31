const axios = require("axios");

const HF_EMBEDDING_URL =
  "https://router.huggingface.co/hf-inference/embeddings/sentence-transformers/all-MiniLM-L6-v2";

async function getEmbedding(text) {
  const response = await axios.post(
    HF_EMBEDDING_URL,
    {
      inputs: text.slice(0, 3000), // safe + optimal
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  return response.data[0];
}

module.exports = { getEmbedding };
