const dotenv = require('dotenv')
const axios = require("axios");
dotenv.config();

// // Hard-coded model (same as your structure)
// const MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2";

// // Correct embeddings endpoint
// const HF_URL = "https://router.huggingface.co/hf-inference/embeddings";

// async function getEmbedding(text) {
//   try {
//     const res = await axios.post(
//       HF_URL,
//       {
//         model: MODEL_ID,              // 👈 model passed in body
//         inputs: text.slice(0, 3000),  // 👈 same behavior
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.HF_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         timeout: 10000,
//       }
//     );

//     // Return raw embedding array (number[])
//     return res.data.data[0].embedding;

//   } catch (error) {
//     console.error(
//       "HF Error:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// }


async function getEmbedding(texts) {
  const apiURL = `api-inference.huggingface.co/${MODEL_ID}`;
  const headers = {
    "Authorization": `Bearer ${process.env.HF_API_KEY}`,
    "Content-Type": "application/json"
  };
  
  const payload = {
    inputs: texts,
    options: {
      wait_for_model: true, // Wait if the model is loading
      truncate: true
    }
  };

  try {
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result; // An array of embedding vectors

  } catch (error) {
    console.error("Could not generate embeddings:", error);
    throw error;
  }
}

// Example Usage
// const HF_TOKEN = "YOUR_API_TOKEN";
const MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2";
// const texts = ["Hello world!", "Hugging Face is great."];

// generateEmbeddingsWithFetch(texts, HF_TOKEN, MODEL_ID).then(embeddings => {
  //   console.log("Embeddings:", embeddings);
  // });
  
  module.exports = { getEmbedding };