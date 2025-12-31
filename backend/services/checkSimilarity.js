const checkSimilarity = (vec1, vec2) => {
  if (!Array.isArray(vec1) || !Array.isArray(vec2)) {
    throw new Error("checkSimilarity expects number[] vectors");
  }

  if (vec1.length !== vec2.length) {
    throw new Error(
      `Vector length mismatch: ${vec1.length} vs ${vec2.length}`
    );
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vec1.length; i++) {
    dot += vec1[i] * vec2[i];
    magA += vec1[i] * vec1[i];
    magB += vec2[i] * vec2[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

module.exports = { checkSimilarity };
