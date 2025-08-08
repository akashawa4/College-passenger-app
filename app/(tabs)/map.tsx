import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBuses } from '@/hooks/useBuses';
import { MapComponent } from '@/components/MapComponent';
import { Clock } from 'lucide-react-native';

export default function MapScreen() {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const { buses, liveLocations, loading } = useBuses(selectedRouteId);

  useEffect(() => {
    loadSelectedRoute();
  }, []);

  const loadSelectedRoute = async () => {
    try {
      const routeId = await AsyncStorage.getItem('lastSelectedRoute');
      setSelectedRouteId(routeId);
    } catch (error) {
      console.error('Error loading selected route:', error);
    }
  };

  const getLastUpdateTime = (busId: string) => {
    const location = liveLocations.find(loc => loc.busId === busId);
    if (!location) return 'Offline';
    
    const now = new Date();
    const diff = now.getTime() - location.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  if (!selectedRouteId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Route Selected</Text>
          <Text style={styles.emptySubtitle}>
            Please select a route from the Routes tab to view live bus locations
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Bus Tracking</Text>
        <Text style={styles.subtitle}>
          {buses.length} bus{buses.length !== 1 ? 'es' : ''} on this route
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <MapComponent buses={buses} liveLocations={liveLocations} />
      </View>

      {buses.length > 0 && (
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>Bus Status</Text>
          {buses.map((bus) => {
            const location = liveLocations.find(loc => loc.busId === bus.id);
            const isOnline = location && 
              new Date().getTime() - location.timestamp.getTime() < 60000; // 1 minute
            
            return (
              <View key={bus.id} style={styles.busStatus}>
                <View style={styles.busInfo}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: isOnline ? '#10b981' : '#ef4444' }
                  ]} />
                  <Text style={styles.busNumber}>Bus {bus.number}</Text>
                </View>
                <View style={styles.busDetails}>
                  <Clock size={14} color="#6b7280" />
                  <Text style={styles.lastUpdate}>
                    {getLastUpdateTime(bus.id)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusPanel: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  busStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  busNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  busDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
});