import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

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

interface WebMapComponentProps {
  buses: Bus[];
  liveLocations: LiveLocation[];
}

export function WebMapComponent({ buses, liveLocations }: WebMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamically import Leaflet only on web
    const initializeMap = async () => {
      if (typeof window !== 'undefined') {
        const L = await import('leaflet');
        
        // Initialize map
        if (mapRef.current && !leafletMapRef.current) {
          leafletMapRef.current = L.map(mapRef.current).setView([37.7749, -122.4194], 13);
          
          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(leafletMapRef.current);
        }
      }
    };

    initializeMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current) return;

    const updateMarkers = async () => {
      const L = await import('leaflet');
      
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers for each bus location
      liveLocations.forEach((location) => {
        const bus = buses.find(b => b.id === location.busId);
        if (!bus) return;

        const marker = L.marker([location.latitude, location.longitude])
          .addTo(leafletMapRef.current)
          .bindPopup(`
            <div style="text-align: center;">
              <strong>Bus ${bus.number}</strong><br/>
              <small>Last updated: ${location.timestamp.toLocaleTimeString()}</small>
            </div>
          `);

        markersRef.current.push(marker);
      });

      // Fit map to show all buses
      if (liveLocations.length > 0) {
        const group = new L.featureGroup(markersRef.current);
        leafletMapRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    };

    updateMarkers();
  }, [liveLocations, buses]);

  return (
    <View style={styles.container}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 16,
        }}
      />
      
      {liveLocations.length === 0 && (
        <View style={styles.noDataOverlay}>
          <Text style={styles.noDataText}>No buses currently sharing location</Text>
          <Text style={styles.noDataSubtext}>Check back in a few minutes</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  noDataOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: 200,
    zIndex: 1000,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});