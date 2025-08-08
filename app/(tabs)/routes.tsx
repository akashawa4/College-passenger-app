import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoutes } from '@/hooks/useRoutes';

export default function RoutesScreen() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const router = useRouter();
  const { routes, loading } = useRoutes();

  useEffect(() => {
    loadLastSelectedRoute();
  }, []);

  const loadLastSelectedRoute = async () => {
    try {
      const lastRoute = await AsyncStorage.getItem('lastSelectedRoute');
      if (lastRoute) {
        setSelectedRoute(lastRoute);
      }
    } catch (error) {
      console.error('Error loading last selected route:', error);
    }
  };

  const selectRoute = async (routeId: string) => {
    setSelectedRoute(routeId);
    try {
      await AsyncStorage.setItem('lastSelectedRoute', routeId);
    } catch (error) {
      console.error('Error saving selected route:', error);
    }
  };

  const viewBus = () => {
    if (selectedRoute) {
      router.push('/(tabs)/map');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading routes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Route</Text>
        <Text style={styles.subtitle}>Choose the bus route you want to track</Text>
      </View>

      <ScrollView style={styles.routesList} showsVerticalScrollIndicator={false}>
        {routes.map((route) => (
          <TouchableOpacity
            key={route.id}
            style={[
              styles.routeCard,
              selectedRoute === route.id && styles.selectedRoute,
            ]}
            onPress={() => selectRoute(route.id)}
          >
            <View style={styles.routeContent}>
              <View style={styles.routeHeader}>
                <MapPin size={20} color="#007AFF" />
                <Text style={styles.routeName}>{route.name}</Text>
              </View>
              
              <View style={styles.routeDetails}>
                <Text style={styles.startPoint}>{route.startPoint}</Text>
                <ArrowRight size={16} color="#9ca3af" />
                <Text style={styles.endPoint}>{route.endPoint}</Text>
              </View>
              
              {route.stops && route.stops.length > 0 && (
                <Text style={styles.stopsCount}>
                  {route.stops.length} stops
                </Text>
              )}
            </View>
            
            {selectedRoute === route.id && (
              <View style={styles.selectedIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedRoute && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.viewBusButton} onPress={viewBus}>
            <Text style={styles.viewBusText}>View Live Bus</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  routesList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  routeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  selectedRoute: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f9ff',
  },
  routeContent: {
    flex: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  startPoint: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  endPoint: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    textAlign: 'right',
  },
  stopsCount: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  bottomContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  viewBusButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewBusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});