'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { Masjid, MasjidConfig } from '@/lib/types';

interface MasjidContextType {
  masjid: Masjid | null;
  config: MasjidConfig | null;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const MasjidContext = createContext<MasjidContextType | undefined>(undefined);

export function MasjidProvider({ children }: { children: React.ReactNode }) {
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [config, setConfig] = useState<MasjidConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { masjidId } = useAuth();

  const fetchMasjidData = async () => {
    if (!masjidId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch masjid details
      const masjidDoc = await getDoc(doc(db, 'masjids', masjidId));
      if (masjidDoc.exists()) {
        setMasjid({ id: masjidDoc.id, ...masjidDoc.data() } as Masjid);
      }

      // Fetch masjid config
      const configQuery = query(
        collection(db, 'configs'),
        where('masjidId', '==', masjidId)
      );
      const configSnapshot = await getDocs(configQuery);
      if (!configSnapshot.empty) {
        setConfig({ id: configSnapshot.docs[0].id, ...configSnapshot.docs[0].data() } as MasjidConfig);
      }
    } catch (error) {
      console.error('Error fetching masjid data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasjidData();
  }, [masjidId]);

  return (
    <MasjidContext.Provider value={{ masjid, config, loading, refreshData: fetchMasjidData }}>
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