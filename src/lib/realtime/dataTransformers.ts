/**
 * Transform API response data based on different formats
 */
export const transformApiResponseData = (rawData: any): any[] => {
  // Handle World Bank API format
  if (Array.isArray(rawData) && rawData.length > 1 && rawData[1] && Array.isArray(rawData[1])) {
    return rawData[1].map((item: any) => ({
      country: item.country?.value || 'Unknown',
      indicator: item.indicator?.value || 'Unknown',
      value: item.value,
      date: item.date,
      ...item
    }));
  }
  
  // Handle CoinGecko and generic object responses
  if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
    // Convert object to array of key-value pairs
    return Object.entries(rawData).map(([key, value]) => ({
      key,
      value,
      ...typeof value === 'object' ? value as any : {}
    }));
  }
  
  // Handle direct array responses
  if (Array.isArray(rawData)) {
    return rawData;
  }
  
  // Handle single object responses
  return [rawData];
};