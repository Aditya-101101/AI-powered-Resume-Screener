const axios = require("axios");

const HF_URL =
  "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-mpnet-base-v2/pipeline/feature-extraction";

// console.log(" HF EMBEDDING URL:", HF_URL);

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
      timeout: 7000
    }
  );
  // console.log(res.data)
  return res.data; // 768-d
}

module.exports = { getEmbedding };
