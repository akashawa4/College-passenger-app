import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  console.log('Index component - User:', user ? 'Logged in' : 'Not logged in');
  console.log('Index component - Loading:', loading);

  if (loading) {
    console.log('Index component - Showing loading screen');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (user) {
    console.log('Index component - Redirecting to routes');
    return <Redirect href="/(tabs)/routes" />;
  }

  console.log('Index component - Redirecting to auth');
  return <Redirect href="/auth" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});