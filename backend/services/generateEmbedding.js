const dotenv = require("dotenv");
dotenv.config();

const HF_URL =
  "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-large/pipeline/feature-extraction";

async function getEmbedding(text) {
  const response = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const result = await response.json();

  // 🔑 🔑 🔑 FINAL UNWRAP LOGIC
  if (Array.isArray(result)) {
    return Array.isArray(result[0]) ? result[0] : result;
  }

  if (result.embedding && Array.isArray(result.embedding)) {
    return result.embedding;
  }

  throw new Error("Unexpected embedding response format");
}

module.exports = { getEmbedding };
