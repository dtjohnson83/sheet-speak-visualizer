export function detectIsolationAnomalies(data: number[]): number[] {
  // Simplified Isolation Forest simulation
  const anomalies: number[] = [];
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const std = Math.sqrt(data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length);
  
  data.forEach(value => {
    const isolationScore = Math.abs(value - mean) / std;
    if (isolationScore > 2.5) {
      anomalies.push(value);
    }
  });
  
  return anomalies;
}

export function detectLOFAnomalies(data: number[]): number[] {
  // Simplified Local Outlier Factor simulation
  const anomalies: number[] = [];
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  
  data.forEach(value => {
    if (value < q1 - 2 * iqr || value > q3 + 2 * iqr) {
      anomalies.push(value);
    }
  });
  
  return anomalies;
}