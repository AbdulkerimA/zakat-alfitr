export interface Masjid {
  id: string;
  name: string;
  address: string;
  city: string;
  adminName: string;
  createdAt: any;
}

export interface Config {
  id: string;
  masjidId: string;
  zakatAmount: number;
  packageItems: string[];
  packageCost: number;
  maxPerDistributor: number;
  updatedAt: any;
}

export interface Mesakin {
  id: string;
  masjidId: string;
  name: string;
  phone: string;
  idNumber: string;
  address: string;
  familyMembers: number;
  // incomeLevel: 'very_low' | 'low' | 'moderate';
  notes: string;
  status: 'pending' | 'approved' | 'received';
  registeredAt: any;
  registeredBy: string;
}

export interface Muzaki {
  id: string;
  masjidId: string;
  name: string;
  peopleCount: number;
  amount: number;
  givenAmount: number;
  paymentMethod: 'cash' | 'transfer';
  paymentStatus: 'pending' | 'paid';
  registeredAt: any;
  registeredBy: string;
}

export interface Distributor {
  id: string;
  masjidId: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'distributor';
  active: boolean;
  createdAt: any;
}

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

export interface MasjidSummary {
  id: string;
  name: string;
  city: string;
  state: string;
  adminName: string;
  adminEmail: string;
  createdAt: any;
  stats: {
    mesakin: number;
    muzaki: number;
    collections: number;
    distributions: number;
  };
}