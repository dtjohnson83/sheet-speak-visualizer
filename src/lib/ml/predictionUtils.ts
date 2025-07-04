export function predictQualityTrend(currentQuality: number, dataSize: number): { score: number; confidence: number } {
  // Simple trend prediction based on current state
  const volatility = Math.min(dataSize / 10000, 1); // Larger datasets tend to be more stable
  const trendFactor = Math.random() * 0.2 - 0.1; // Random trend between -10% and +10%
  
  const predictedScore = Math.max(0, Math.min(100, (1 - currentQuality) * 100 + trendFactor * 100));
  const confidence = 0.6 + volatility * 0.3;
  
  return { score: Math.round(predictedScore), confidence };
}

export function predictDataVolume(currentSize: number): { volume: number; confidence: number } {
  // Predict volume growth
  const growthRate = 0.1 + Math.random() * 0.3; // 10-40% growth
  const predictedVolume = Math.round(currentSize * (1 + growthRate));
  
  return { volume: predictedVolume, confidence: 0.7 };
}