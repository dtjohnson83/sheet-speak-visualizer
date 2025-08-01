import React, { useState, useMemo, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { DataRow } from '@/pages/Index';
import { isValidCoordinate, calculateGeoBounds, formatCoordinate } from '@/utils/geoDataUtils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Map2DChartRendererProps {
  data: DataRow[];
  xColumn: string; // longitude
  yColumn: string; // latitude
  seriesColumn?: string;
  valueColumn?: string;
  colors: string[];
  showDataLabels?: boolean;
  title?: string;
}

export const Map2DChartRenderer = ({
  data,
  xColumn,
  yColumn,
  seriesColumn,
  valueColumn,
  colors,
  showDataLabels = false,
  title
}: Map2DChartRendererProps) => {
  const mapRef = useRef<any>(null);
  const [selectedPoint, setSelectedPoint] = useState<DataRow | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/light-v11');
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

  // Handle marker click
  const handleMarkerClick = (point: DataRow, event: any) => {
    event.originalEvent.stopPropagation();
    setSelectedPoint(point);
  };

  if (validData.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
            {title}
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

      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || localStorage.getItem('mapbox_api_key') || 'pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtNXE5M2F6ODBwdGIya3M4YTB5dTZoNDAifQ.placeholder'}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />
        
        {/* Render markers for each data group */}
        {dataGroups.map((group, groupIndex) =>
          group.data.map((point, pointIndex) => (
            <Marker
              key={`${groupIndex}-${pointIndex}`}
              longitude={point[xColumn] as number}
              latitude={point[yColumn] as number}
              onClick={(e) => handleMarkerClick(point, e)}
            >
              <div
                className="w-3 h-3 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform shadow-lg"
                style={{ backgroundColor: group.color }}
              />
            </Marker>
          ))
        )}

        {/* Popup for selected point */}
        {selectedPoint && (
          <Popup
            longitude={selectedPoint[xColumn] as number}
            latitude={selectedPoint[yColumn] as number}
            onClose={() => setSelectedPoint(null)}
            closeButton={true}
            closeOnClick={false}
            offset={[0, -10]}
          >
            <div className="p-2 min-w-[200px]">
              <div className="font-semibold mb-2">Location Details</div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Coordinates:</span>
                  <div className="ml-2">
                    {formatCoordinate(selectedPoint[yColumn] as number, 'lat')}<br />
                    {formatCoordinate(selectedPoint[xColumn] as number, 'lng')}
                  </div>
                </div>
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
                  .filter(([key]) => key !== xColumn && key !== yColumn && key !== seriesColumn && key !== valueColumn)
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
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span>{group.name} ({group.data.length})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};