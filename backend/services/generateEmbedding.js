const axios = require("axios");

const HF_API_URL =
  "https://api-inference.huggingface.co/embeddings/sentence-transformers/all-MiniLM-L6-v2";

async function getEmbedding(text) {
  const response = await axios.post(
    HF_API_URL,
    {
      inputs: text.slice(0, 3000), 
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
      },
      timeout: 10000,
    }
  );

  return response.data[0]; 
}

module.exports = { getEmbedding };
