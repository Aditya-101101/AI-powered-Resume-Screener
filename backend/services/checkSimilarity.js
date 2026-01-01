const checkSimilarity = (vec1, vec2) => {
  if (!Array.isArray(vec1) || !Array.isArray(vec2)) {
    throw new Error("checkSimilarity expects number[] vectors");
  }

  if (vec1.length !== vec2.length) {
    throw new Error(
      `Embedding dimension mismatch: ${vec1.length} vs ${vec2.length}`
    );
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vec1.length; i++) {
    const a = vec1[i];
    const b = vec2[i];

    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  if (magA === 0 || magB === 0) return 0;

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

module.exports = { checkSimilarity };
