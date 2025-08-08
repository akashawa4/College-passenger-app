import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

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

interface NativeMapComponentProps {
  buses: Bus[];
  liveLocations: LiveLocation[];
}

export function NativeMapComponent({ buses, liveLocations }: NativeMapComponentProps) {
  const defaultRegion = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Calculate region to fit all bus locations
  const getMapRegion = () => {
    if (liveLocations.length === 0) return defaultRegion;

    const latitudes = liveLocations.map(loc => loc.latitude);
    const longitudes = liveLocations.map(loc => loc.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = Math.max(maxLat - minLat, 0.01) * 1.3;
    const deltaLng = Math.max(maxLng - minLng, 0.01) * 1.3;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: deltaLat,
      longitudeDelta: deltaLng,
    };
  };

  const getBusForLocation = (busId: string) => {
    return buses.find(bus => bus.id === busId);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={getMapRegion()}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        
        {liveLocations.map((location) => {
          const bus = getBusForLocation(location.busId);
          if (!bus) return null;

          return (
            <Marker
              key={location.busId}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={`Bus ${bus.number}`}
              description={`Last updated: ${location.timestamp.toLocaleTimeString()}`}
              rotation={location.heading}
            >
              <View style={styles.busMarker}>
                <Text style={styles.busMarkerText}>{bus.number}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

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
  },
  map: {
    flex: 1,
  },
  busMarker: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  busMarkerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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