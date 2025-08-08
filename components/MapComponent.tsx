import React from 'react';
import { Platform } from 'react-native';
import { WebMapComponent } from './WebMapComponent';

// Lazy load NativeMapComponent only for native platforms
const NativeMapComponent = React.lazy(() => import('./NativeMapComponent').then(module => ({ default: module.NativeMapComponent })));

interface Bus {
  id: string;
  number: string;
  routeId: string;
  driverId: string;
}

interface LiveLocation {
  busId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed: number;
  heading: number;
}

interface MapComponentProps {
  buses: Bus[];
  liveLocations: LiveLocation[];
}

export function MapComponent({ buses, liveLocations }: MapComponentProps) {
  if (Platform.OS === 'web') {
    return <WebMapComponent buses={buses} liveLocations={liveLocations} />;
  } else {
    return (
      <React.Suspense fallback={<div>Loading map...</div>}>
        <NativeMapComponent buses={buses} liveLocations={liveLocations} />
      </React.Suspense>
    );
  }
}