import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';

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

export function useBuses(routeId: string | null) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [liveLocations, setLiveLocations] = useState<LiveLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeLocations: (() => void) | undefined;
    let isMounted = true;

    const fetchBusesAndSubscribe = async () => {
      try {
        if (!routeId) {
          if (isMounted) setLoading(false);
          return;
        }

        const q = query(collection(db, 'buses'), where('routeId', '==', routeId));
        const busesSnapshot = await getDocs(q);
        const busesData: Bus[] = busesSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Bus, 'id'>) }));
        if (isMounted) setBuses(busesData);

        // Subscribe to live locations in Firestore (collection: 'locations', documents keyed by busId)
        unsubscribeLocations = onSnapshot(collection(db, 'locations'), (snapshot) => {
          if (!isMounted) return;
          const next: LiveLocation[] = snapshot.docs
            .map((doc) => ({ busId: doc.id, ...(doc.data() as Omit<LiveLocation, 'busId'>) }))
            .filter((loc) => busesData.some((b) => b.id === loc.busId));
          setLiveLocations(next);
        });
      } catch (error) {
        console.error('Failed to fetch buses or subscribe to locations:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBusesAndSubscribe();

    return () => {
      isMounted = false;
      if (unsubscribeLocations) unsubscribeLocations();
    };
  }, [routeId]);

  return { buses, liveLocations, loading };
}