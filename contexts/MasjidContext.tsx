'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { Masjid, Config } from '@/lib/types';

interface MasjidContextType {
  masjid: Masjid | null;
  config: Config | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const MasjidContext = createContext<MasjidContextType | undefined>(undefined);

export function MasjidProvider({ children }: { children: React.ReactNode }) {
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const { masjidId } = useAuth();

  const fetchData = async () => {
    if (!masjidId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch masjid
      const masjidDoc = await getDoc(doc(db, 'masjids', masjidId));
      if (masjidDoc.exists()) {
        setMasjid({ id: masjidDoc.id, ...masjidDoc.data() } as Masjid);
      }

      // Fetch config
      const configQuery = query(
        collection(db, 'configs'),
        where('masjidId', '==', masjidId)
      );
      const configSnap = await getDocs(configQuery);
      if (!configSnap.empty) {
        setConfig({ id: configSnap.docs[0].id, ...configSnap.docs[0].data() } as Config);
      }
    } catch (error) {
      console.error('Error fetching masjid data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [masjidId]);

  return (
    <MasjidContext.Provider value={{ masjid, config, loading, refresh: fetchData }}>
      {children}
    </MasjidContext.Provider>
  );
}

export const useMasjid = () => {
  const context = useContext(MasjidContext);
  if (context === undefined) {
    throw new Error('useMasjid must be used within a MasjidProvider');
  }
  return context;
};