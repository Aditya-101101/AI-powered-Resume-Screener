const padVector = (vec, targetLength) => {
  if (vec.length >= targetLength) return vec;

  const padded = new Array(targetLength).fill(0);
  for (let i = 0; i < vec.length; i++) {
    padded[i] = vec[i];
  }
  return padded;
};

const checkSimilarity = (vec1, vec2) => {
  if (!Array.isArray(vec1) || !Array.isArray(vec2)) {
    throw new Error("checkSimilarity expects number[] vectors");
  }

  // 🔑 determine target dimension
  const maxLen = Math.max(vec1.length, vec2.length);

  // 🔑 pad shorter vector
  const v1 = padVector(vec1, maxLen);
  const v2 = padVector(vec2, maxLen);

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < maxLen; i++) {
    dot += v1[i] * v2[i];
    magA += v1[i] * v1[i];
    magB += v2[i] * v2[i];
  }

  if (magA === 0 || magB === 0) return 0;

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

module.exports = { checkSimilarity };
