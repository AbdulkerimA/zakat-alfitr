export interface Masjid {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  adminName: string;
  adminEmail: string;
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
  address: string;
  familyMembers: number;
  incomeLevel: 'very_low' | 'low' | 'moderate';
  notes: string;
  status: 'pending' | 'approved' | 'received';
  registeredAt: any;
  registeredBy: string;
}

export interface Muzaki {
  id: string;
  masjidId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  peopleCount: number;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'online';
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
  role: 'admin' | 'distributor';
  active: boolean;
  createdAt: any;
}