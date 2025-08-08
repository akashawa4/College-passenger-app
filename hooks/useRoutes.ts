import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  stops: string[];
}

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRoutes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'routes'));
        const data: Route[] = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Route, 'id'>) }));
        if (isMounted) setRoutes(data);
      } catch (error) {
        console.error('Failed to fetch routes:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRoutes();
    return () => { isMounted = false; };
  }, []);

  return { routes, loading };
}