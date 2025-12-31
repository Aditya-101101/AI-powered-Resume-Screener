const dotenv = require("dotenv");
dotenv.config();

const HF_URL =
  "https://router.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

async function getEmbedding(text) {
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

  return await response.json(); // number[]
}

module.exports = { getEmbedding };
