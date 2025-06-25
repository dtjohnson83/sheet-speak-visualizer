
export const formatNumber = (value: number): string => {
  if (value === 0) return '0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(1)}K`;
  } else if (absValue >= 1) {
    return `${sign}${absValue.toFixed(0)}`;
  } else {
    return `${sign}${absValue.toFixed(2)}`;
  }
};

export const formatTooltipValue = (value: any): string => {
  const numValue = Number(value);
  if (isNaN(numValue)) return String(value);
  return formatNumber(numValue);
};
