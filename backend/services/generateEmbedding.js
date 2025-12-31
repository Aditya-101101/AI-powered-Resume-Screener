const dotenv = require("dotenv");
dotenv.config();

const HF_URL =
  "https://router.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

async function getEmbedding(text) {
  const res = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text.slice(0, 3000)
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HF ${res.status}: ${err}`);
  }

  return await res.json(); // number[]
}

module.exports = { getEmbedding };
