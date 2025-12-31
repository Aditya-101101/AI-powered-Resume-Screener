const dotenv = require("dotenv");
dotenv.config();

const MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2";
const HF_URL =
  "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

async function getEmbedding(text) {
  // 🔒 Guard: fail fast if URL is ever wrong again
  if (!HF_URL.startsWith("https://")) {
    throw new Error("HF_URL is invalid: missing https://");
  }

  const response = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text.slice(0, 3000),
      options: { wait_for_model: true },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF ${response.status}: ${err}`);
  }

  return await response.json(); // embedding array
}

module.exports = { getEmbedding };
