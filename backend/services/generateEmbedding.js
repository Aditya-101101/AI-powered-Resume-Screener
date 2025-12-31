const axios = require("axios");

// Hard-coded model (same as your structure)
const MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2";

// Correct embeddings endpoint
const HF_URL = "https://router.huggingface.co/hf-inference/embeddings";

async function getEmbedding(text) {
  try {
    const res = await axios.post(
      HF_URL,
      {
        model: MODEL_ID,              // 👈 model passed in body
        inputs: text.slice(0, 3000),  // 👈 same behavior
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    // Return raw embedding array (number[])
    return res.data.data[0].embedding;

  } catch (error) {
    console.error(
      "HF Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

module.exports = { getEmbedding };
