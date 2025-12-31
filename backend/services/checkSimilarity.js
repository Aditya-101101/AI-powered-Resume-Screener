const normalizeVector = (v) => {
  if (Array.isArray(v) && Array.isArray(v[0])) {
    return v[0];
  }
  return v;
};

const checkSimilarity = (vec1, vec2) => {
  vec1 = normalizeVector(vec1);
  vec2 = normalizeVector(vec2);

  if (!Array.isArray(vec1) || !Array.isArray(vec2)) {
    throw new Error(
      `Invalid vectors passed to checkSimilarity:
       vec1=${typeof vec1}, vec2=${typeof vec2}`
    );
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
