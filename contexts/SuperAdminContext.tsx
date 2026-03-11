'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

// Define types
export interface SuperAdmin {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: 'super_admin';
  createdAt: any;
  lastLogin?: any;
}

export interface SystemStats {
  totalMasjids: number;
  totalUsers: number;
  totalDistributors: number;
  totalMesakin: number;
  totalMuzaki: number;
  totalCollections: number;
  totalDistributions: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'masjid_created' | 'user_registered' | 'distribution_made' | 'collection_made';
  description: string;
  masjidId?: string;
  masjidName?: string;
  userId?: string;
  timestamp: any;
}

interface SuperAdminContextType {
  admin: SuperAdmin | null;
  user: User | null;
  loading: boolean;
  isSuperAdmin: boolean;
  stats: SystemStats | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<SuperAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    console.log('SuperAdminProvider mounted');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setUser(user);
      
      if (user) {
        try {
          // Check if user is super admin
          const adminDoc = await getDoc(doc(db, 'super_admins', user.uid));
          if (adminDoc.exists()) {
            console.log('Super admin found');
            const adminData = { id: adminDoc.id, ...adminDoc.data() } as SuperAdmin;
            setAdmin(adminData);
            setIsSuperAdmin(true);
            await fetchSystemStats();
          } else {
            console.log('Not a super admin');
            setAdmin(null);
            setIsSuperAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching admin data:', error);
          setAdmin(null);
          setIsSuperAdmin(false);
        }
      } else {
        setAdmin(null);
        setIsSuperAdmin(false);
        setStats(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchSystemStats = async () => {
    try {
      console.log('Fetching system stats');
      
      // Get all masjids
      const masjidsSnapshot = await getDocs(collection(db, 'masjids'));
      const totalMasjids = masjidsSnapshot.size;

      // Get all collections
      const collectionsSnapshot = await getDocs(collection(db, 'collections'));
      const totalCollections = collectionsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().amount || 0), 
        0
      );

      // Get all distributions
      const distributionsSnapshot = await getDocs(collection(db, 'distributions'));
      const totalDistributions = distributionsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().amount || 0), 
        0
      );

      // Get all mesakin
      const mesakinSnapshot = await getDocs(collection(db, 'mesakin'));
      const totalMesakin = mesakinSnapshot.size;

      // Get all muzaki
      const muzakiSnapshot = await getDocs(collection(db, 'muzaki'));
      const totalMuzaki = muzakiSnapshot.size;

      // Get all distributors
      const distributorsSnapshot = await getDocs(collection(db, 'distributors'));
      const totalDistributors = distributorsSnapshot.size;

      // Get recent activities
      const activities: Activity[] = [];
      
      // Add masjid creations
      masjidsSnapshot.docs.slice(0, 10).forEach(doc => {
        const data = doc.data();
        activities.push({
          id: `masjid-${doc.id}`,
          type: 'masjid_created',
          description: `New masjid registered: ${data.name || 'Unknown'}`,
          masjidId: doc.id,
          masjidName: data.name,
          timestamp: data.createdAt || new Date(),
        });
      });

      // Add recent distributions
      distributionsSnapshot.docs.slice(0, 10).forEach(doc => {
        const data = doc.data();
        activities.push({
          id: `dist-${doc.id}`,
          type: 'distribution_made',
          description: `Distribution to ${data.mesakinName || 'a family'}`,
          masjidId: data.masjidId,
          timestamp: data.distributionDate || new Date(),
        });
      });

      // Sort by timestamp (newest first)
      activities.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return timeB.getTime() - timeA.getTime();
      });

      setStats({
        totalMasjids,
        totalUsers: totalDistributors,
        totalDistributors,
        totalMesakin,
        totalMuzaki,
        totalCollections,
        totalDistributions,
        recentActivities: activities.slice(0, 20),
      });

      console.log('Stats fetched successfully');

    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful, checking admin status');
      
      // Verify super admin status
      const adminDoc = await getDoc(doc(db, 'super_admins', userCredential.user.uid));
      if (!adminDoc.exists()) {
        console.log('Not a super admin, logging out');
        await firebaseSignOut(auth);
        throw new Error('Unauthorized: Not a super admin');
      }
      
      console.log('Super admin verified');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const refreshStats = async () => {
    await fetchSystemStats();
  };

  return (
    <SuperAdminContext.Provider value={{ 
      admin, 
      user, 
      loading, 
      isSuperAdmin, 
      stats, 
      login, 
      logout, 
      refreshStats 
    }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};