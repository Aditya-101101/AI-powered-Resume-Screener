import dotenv from "dotenv";
dotenv.config();

export async function getEmbedding(text) {
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-large/pipeline/feature-extraction",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF ${response.status}: ${err}`);
  }

  const result = await response.json();
  return result[0]; // embedding vector
}


module.exports = { getEmbedding };
