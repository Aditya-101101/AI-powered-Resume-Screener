
const checkSimilarity = (vec1, vec2) => {
    const dot = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
    const magA = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
    const magB = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
    return dot / (magA * magB);
}

module.exports = { checkSimilarity }