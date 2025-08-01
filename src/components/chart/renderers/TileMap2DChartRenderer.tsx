import React, { useState, useMemo, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { DataRow } from '@/pages/Index';
import { isValidCoordinate, calculateGeoBounds } from '@/utils/geoDataUtils';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface TileMap2DChartRendererProps {
  data: DataRow[];
  xColumn: string; // longitude
  yColumn: string; // latitude
  seriesColumn?: string;
  colors: string[];
}

export const TileMap2DChartRenderer = ({
  data,
  xColumn,
  yColumn,
  seriesColumn,
  colors
}: TileMap2DChartRendererProps) => {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 1
  });

  // Process and validate data
  const validData = useMemo(() => {
    return data.filter(row => 
      isValidCoordinate(row[yColumn], row[xColumn])
    );
  }, [data, xColumn, yColumn]);

  // Calculate initial bounds and center
  const bounds = useMemo(() => {
    if (validData.length === 0) return null;
    return calculateGeoBounds(validData, yColumn, xColumn);
  }, [validData, xColumn, yColumn]);

  // Set initial view state based on data bounds
  useEffect(() => {
    if (bounds && validData.length > 0) {
      const centerLat = (bounds.north + bounds.south) / 2;
      const centerLng = (bounds.east + bounds.west) / 2;
      
      // Calculate appropriate zoom level for tile view
      const latRange = bounds.north - bounds.south;
      const lngRange = bounds.east - bounds.west;
      const maxRange = Math.max(latRange, lngRange);
      
      let zoom = 1;
      if (maxRange < 0.01) zoom = 12;
      else if (maxRange < 0.1) zoom = 8;
      else if (maxRange < 1) zoom = 5;
      else if (maxRange < 10) zoom = 3;
      else zoom = 1;

      setViewState({
        longitude: centerLng,
        latitude: centerLat,
        zoom
      });
    }
  }, [bounds, validData]);

  // Group data by series if series column exists
  const dataGroups = useMemo(() => {
    if (!seriesColumn) {
      return [{ name: 'Default', data: validData, color: colors[0] || '#3b82f6' }];
    }

    const groups = validData.reduce((acc, row) => {
      const series = row[seriesColumn]?.toString() || 'Unknown';
      if (!acc[series]) {
        acc[series] = [];
      }
      acc[series].push(row);
      return acc;
    }, {} as Record<string, DataRow[]>);

    return Object.entries(groups).map(([name, data], index) => ({
      name,
      data,
      color: colors[index % colors.length] || '#3b82f6'
    }));
  }, [validData, seriesColumn, colors]);

  if (validData.length === 0) {
    return (
      <Card className="p-4 text-center h-full flex items-center justify-center">
        <div>
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No valid geographic data</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtNXE5M2F6ODBwdGIya3M4YTB5dTZoNDAifQ.placeholder'}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        attributionControl={false}
        dragPan={true}
        scrollZoom={true}
        doubleClickZoom={true}
        touchZoomRotate={true}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        
        {/* Render markers for each data group */}
        {dataGroups.map((group, groupIndex) =>
          group.data.map((point, pointIndex) => (
            <Marker
              key={`${groupIndex}-${pointIndex}`}
              longitude={point[xColumn] as number}
              latitude={point[yColumn] as number}
            >
              <div
                className="w-2 h-2 rounded-full border border-white cursor-pointer hover:scale-150 transition-transform shadow-sm"
                style={{ backgroundColor: group.color }}
                title={seriesColumn ? `${seriesColumn}: ${point[seriesColumn]}` : 'Data point'}
              />
            </Marker>
          ))
        )}
      </Map>

      {/* Simplified legend for tile view */}
      {seriesColumn && dataGroups.length > 1 && dataGroups.length <= 3 && (
        <div className="absolute bottom-2 left-2 z-10 bg-background/80 backdrop-blur-sm border rounded p-2">
          <div className="space-y-1">
            {dataGroups.slice(0, 3).map((group, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span className="truncate max-w-[80px]">{group.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data count indicator */}
      <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm border rounded px-2 py-1">
        <span className="text-xs font-medium">{validData.length} points</span>
      </div>
    </div>
  );
};