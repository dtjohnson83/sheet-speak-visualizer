import React, { useState, useMemo, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { DataRow } from '@/pages/Index';
import { isValidCoordinate, calculateGeoBounds, formatCoordinate } from '@/utils/geoDataUtils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mountain } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Map3DChartRendererProps {
  data: DataRow[];
  xColumn: string; // longitude
  yColumn: string; // latitude
  zColumn?: string; // elevation/height value
  seriesColumn?: string;
  valueColumn?: string;
  colors: string[];
  showDataLabels?: boolean;
  title?: string;
}

export const Map3DChartRenderer = ({
  data,
  xColumn,
  yColumn,
  zColumn,
  seriesColumn,
  valueColumn,
  colors,
  showDataLabels = false,
  title
}: Map3DChartRendererProps) => {
  const mapRef = useRef<any>(null);
  const [selectedPoint, setSelectedPoint] = useState<DataRow | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/light-v11');
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 1,
    pitch: 45,
    bearing: 0
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

  // Calculate height scaling for 3D markers
  const heightScale = useMemo(() => {
    if (!zColumn) return null;
    
    const values = validData
      .map(row => row[zColumn])
      .filter(val => typeof val === 'number')
      .sort((a, b) => a - b);
    
    if (values.length === 0) return null;
    
    const min = values[0];
    const max = values[values.length - 1];
    const range = max - min;
    
    return { min, max, range };
  }, [validData, zColumn]);

  // Set initial view state based on data bounds
  useEffect(() => {
    if (bounds && validData.length > 0) {
      const centerLat = (bounds.north + bounds.south) / 2;
      const centerLng = (bounds.east + bounds.west) / 2;
      
      // Calculate appropriate zoom level based on bounds
      const latRange = bounds.north - bounds.south;
      const lngRange = bounds.east - bounds.west;
      const maxRange = Math.max(latRange, lngRange);
      
      let zoom = 1;
      if (maxRange < 0.01) zoom = 14;
      else if (maxRange < 0.1) zoom = 10;
      else if (maxRange < 1) zoom = 7;
      else if (maxRange < 10) zoom = 4;
      else zoom = 2;

      setViewState(prev => ({
        ...prev,
        longitude: centerLng,
        latitude: centerLat,
        zoom
      }));
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

  // Calculate marker height based on z-value
  const getMarkerHeight = (point: DataRow): number => {
    if (!zColumn || !heightScale || heightScale.range === 0) return 8;
    
    const value = point[zColumn];
    if (typeof value !== 'number') return 8;
    
    const normalized = (value - heightScale.min) / heightScale.range;
    return 8 + normalized * 24; // Height between 8px and 32px
  };

  // Handle marker click
  const handleMarkerClick = (point: DataRow, event: any) => {
    event.originalEvent.stopPropagation();
    setSelectedPoint(point);
  };

  if (validData.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Mountain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Valid Geographic Data</h3>
        <p className="text-muted-foreground">
          Please ensure your data contains valid latitude ({yColumn}) and longitude ({xColumn}) values.
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full h-full relative">
      {title && (
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {title} - 3D View
          </Badge>
        </div>
      )}
      
      {/* Map Style Selector */}
      <div className="absolute top-4 right-4 z-10">
        <select 
          value={mapStyle}
          onChange={(e) => setMapStyle(e.target.value)}
          className="bg-background/80 backdrop-blur-sm border rounded px-2 py-1 text-sm"
        >
          <option value="mapbox://styles/mapbox/light-v11">Light</option>
          <option value="mapbox://styles/mapbox/dark-v11">Dark</option>
          <option value="mapbox://styles/mapbox/streets-v12">Streets</option>
          <option value="mapbox://styles/mapbox/satellite-v9">Satellite</option>
          <option value="mapbox://styles/mapbox/outdoors-v12">Outdoors</option>
        </select>
      </div>

      {/* 3D Controls */}
      <div className="absolute top-16 right-4 z-10 bg-background/80 backdrop-blur-sm border rounded p-2">
        <div className="text-xs font-medium mb-1">3D Controls</div>
        <div className="space-y-1">
          <button
            onClick={() => setViewState(prev => ({ ...prev, pitch: Math.min(60, prev.pitch + 15) }))}
            className="w-full text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded"
          >
            Tilt Up
          </button>
          <button
            onClick={() => setViewState(prev => ({ ...prev, pitch: Math.max(0, prev.pitch - 15) }))}
            className="w-full text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded"
          >
            Tilt Down
          </button>
          <button
            onClick={() => setViewState(prev => ({ ...prev, bearing: prev.bearing + 45 }))}
            className="w-full text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded"
          >
            Rotate
          </button>
        </div>
      </div>

      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || localStorage.getItem('mapbox_api_key') || 'pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtNXE5M2F6ODBwdGIyk3M4YTB5dTZoNDAifQ.placeholder'}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        attributionControl={false}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
      >
        <NavigationControl position="bottom-right" />
        
        {/* Render 3D markers for each data group */}
        {dataGroups.map((group, groupIndex) =>
          group.data.map((point, pointIndex) => {
            const height = getMarkerHeight(point);
            return (
              <Marker
                key={`${groupIndex}-${pointIndex}`}
                longitude={point[xColumn] as number}
                latitude={point[yColumn] as number}
                onClick={(e) => handleMarkerClick(point, e)}
              >
                <div
                  className="rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform shadow-lg relative"
                  style={{ 
                    backgroundColor: group.color,
                    width: `${Math.max(6, height * 0.4)}px`,
                    height: `${height}px`,
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
                  }}
                >
                  {/* 3D shadow effect */}
                  <div
                    className="absolute bottom-0 rounded-full opacity-30"
                    style={{
                      backgroundColor: group.color,
                      width: `${Math.max(8, height * 0.5)}px`,
                      height: '2px',
                      left: '50%',
                      transform: 'translateX(-50%) translateY(1px)',
                      filter: 'blur(1px)'
                    }}
                  />
                </div>
              </Marker>
            );
          })
        )}

        {/* Popup for selected point */}
        {selectedPoint && (
          <Popup
            longitude={selectedPoint[xColumn] as number}
            latitude={selectedPoint[yColumn] as number}
            onClose={() => setSelectedPoint(null)}
            closeButton={true}
            closeOnClick={false}
            offset={[0, -15]}
          >
            <div className="p-2 min-w-[200px]">
              <div className="font-semibold mb-2">3D Location Details</div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Coordinates:</span>
                  <div className="ml-2">
                    {formatCoordinate(selectedPoint[yColumn] as number, 'lat')}<br />
                    {formatCoordinate(selectedPoint[xColumn] as number, 'lng')}
                  </div>
                </div>
                {zColumn && (
                  <div>
                    <span className="font-medium">{zColumn}:</span> {selectedPoint[zColumn]}
                  </div>
                )}
                {seriesColumn && (
                  <div>
                    <span className="font-medium">{seriesColumn}:</span> {selectedPoint[seriesColumn]}
                  </div>
                )}
                {valueColumn && (
                  <div>
                    <span className="font-medium">{valueColumn}:</span> {selectedPoint[valueColumn]}
                  </div>
                )}
                {/* Show other non-coordinate columns */}
                {Object.entries(selectedPoint)
                  .filter(([key]) => key !== xColumn && key !== yColumn && key !== zColumn && key !== seriesColumn && key !== valueColumn)
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  ))
                }
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend */}
      {seriesColumn && dataGroups.length > 1 && (
        <div className="absolute bottom-4 left-4 z-10 bg-background/80 backdrop-blur-sm border rounded p-3">
          <div className="text-sm font-medium mb-2">Legend</div>
          <div className="space-y-1">
            {dataGroups.map((group, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-4 h-6 rounded-full border border-white"
                  style={{ 
                    backgroundColor: group.color,
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
                  }}
                />
                <span>{group.name} ({group.data.length})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Height scale legend */}
      {zColumn && heightScale && (
        <div className="absolute bottom-4 right-4 z-10 bg-background/80 backdrop-blur-sm border rounded p-3">
          <div className="text-sm font-medium mb-2">Height Scale</div>
          <div className="text-xs space-y-1">
            <div>Max: {heightScale.max.toLocaleString()}</div>
            <div>Min: {heightScale.min.toLocaleString()}</div>
            <div className="text-muted-foreground">{zColumn}</div>
          </div>
        </div>
      )}
    </div>
  );
};