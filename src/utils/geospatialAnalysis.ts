import { DataRow } from '@/pages/Index';
import * as turf from '@turf/turf';

export interface ClusterPoint {
  id: string;
  position: [number, number]; // [lng, lat]
  data: DataRow[];
  count: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  data: DataRow;
}

/**
 * Clusters geographic points using turf.js clustering
 */
export const clusterGeoPoints = (
  data: DataRow[], 
  latColumn: string, 
  lngColumn: string,
  maxZoom: number = 16,
  radius: number = 50
): ClusterPoint[] => {
  // Convert data to GeoJSON points
  const points = turf.featureCollection(
    data
      .filter(row => 
        typeof row[latColumn] === 'number' && 
        typeof row[lngColumn] === 'number'
      )
      .map((row, index) => 
        turf.point([row[lngColumn] as number, row[latColumn] as number], { 
          id: index.toString(),
          data: row 
        })
      )
  );

  if (points.features.length === 0) return [];

  // Simple distance-based clustering
  const clusters: ClusterPoint[] = [];
  const processed = new Set<number>();

  points.features.forEach((point, index) => {
    if (processed.has(index)) return;

    const cluster: ClusterPoint = {
      id: `cluster-${clusters.length}`,
      position: point.geometry.coordinates as [number, number],
      data: [point.properties?.data],
      count: 1
    };

    // Find nearby points within radius
    points.features.forEach((otherPoint, otherIndex) => {
      if (index === otherIndex || processed.has(otherIndex)) return;

      const distance = turf.distance(point, otherPoint, { units: 'meters' });
      if (distance <= radius) {
        cluster.data.push(otherPoint.properties?.data);
        cluster.count++;
        processed.add(otherIndex);
      }
    });

    processed.add(index);
    clusters.push(cluster);
  });

  return clusters;
};

/**
 * Prepares data for heatmap visualization
 */
export const prepareHeatmapData = (
  data: DataRow[],
  latColumn: string,
  lngColumn: string,
  weightColumn?: string
): HeatmapPoint[] => {
  return data
    .filter(row => 
      typeof row[latColumn] === 'number' && 
      typeof row[lngColumn] === 'number'
    )
    .map(row => ({
      lat: row[latColumn] as number,
      lng: row[lngColumn] as number,
      weight: weightColumn && typeof row[weightColumn] === 'number' 
        ? row[weightColumn] as number 
        : 1,
      data: row
    }));
};

/**
 * Calculates optimal zoom level for given bounds
 */
export const calculateOptimalZoom = (bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}, containerWidth: number = 400, containerHeight: number = 300): number => {
  const latRange = bounds.north - bounds.south;
  const lngRange = bounds.east - bounds.west;
  
  // World dimensions in degrees
  const WORLD_DIM = { height: 180, width: 360 };
  
  function latRadians(lat: number) {
    const sin = Math.sin(lat * Math.PI / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }
  
  function zoom(mapPx: number, worldPx: number, fraction: number) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }
  
  const latFraction = (latRadians(bounds.north) - latRadians(bounds.south)) / Math.PI;
  const lngFraction = lngRange / WORLD_DIM.width;
  
  const latZoom = zoom(containerHeight, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(containerWidth, WORLD_DIM.width, lngFraction);
  
  return Math.min(latZoom, lngZoom, 18);
};

/**
 * Geocoding service for converting addresses to coordinates
 */
export class GeocodingService {
  private static cache = new Map<string, { lat: number; lng: number } | null>();
  
  static async geocodeAddress(
    address: string, 
    apiKey: string
  ): Promise<{ lat: number; lng: number } | null> {
    // Check cache first
    if (this.cache.has(address)) {
      return this.cache.get(address) || null;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${apiKey}&limit=1`
      );

      if (!response.ok) {
        this.cache.set(address, null);
        return null;
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const result = { lat, lng };
        this.cache.set(address, result);
        return result;
      }

      this.cache.set(address, null);
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      this.cache.set(address, null);
      return null;
    }
  }

  static async batchGeocode(
    addresses: string[],
    apiKey: string,
    batchSize: number = 5,
    delayMs: number = 100
  ): Promise<Map<string, { lat: number; lng: number } | null>> {
    const results = new Map<string, { lat: number; lng: number } | null>();
    
    // Process in batches to avoid rate limiting
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      
      const batchPromises = batch.map(address => 
        this.geocodeAddress(address, apiKey)
          .then(result => ({ address, result }))
      );

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ address, result }) => {
        results.set(address, result);
      });

      // Add delay between batches
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }
}