const axios = require("axios");

// 1. Put the model ID directly in the URL
const MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2";
const HF_URL = `https://router.huggingface.co/models/${MODEL_ID}`;

async function getEmbedding(text) {
  try {
    const res = await axios.post(
      HF_URL,
      {
        inputs: text.slice(0, 3000), // "inputs" (plural) is correct here
        options: { wait_for_model: true } // Ensures request waits if model is cold
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    // 2. The standard API returns the array directly (or nested if input is an array)
    // For a single string input, it usually returns just the embedding array.
    return res.data; 
    
  } catch (error) {
    console.error("HF Error:", error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { getEmbedding };