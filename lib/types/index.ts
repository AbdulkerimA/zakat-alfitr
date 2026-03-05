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
  createdAt: Date;
  updatedAt: Date;
}

export interface MasjidConfig {
  id: string;
  masjidId: string;
  zakatAmountPerPerson: number;
  distributionPackage: {
    type: string;
    items: string[];
    estimatedCost: number;
  };
  operationalSettings: {
    maxMesakinPerDistributor: number;
    distributionStartDate: Date;
    distributionEndDate: Date;
    collectionStartDate: Date;
    collectionEndDate: Date;
  };
  updatedAt: Date;
  updatedBy: string;
}

export interface Mesakin {
  id: string;
  masjidId: string;
  fullName: string;
  phone: string;
  address: string;
  familyMembers: number;
  incomeLevel: 'very_low' | 'low' | 'moderate';
  needsDescription: string;
  idType: string;
  idNumber: string;
  status: 'pending' | 'approved' | 'distributed' | 'rejected';
  registeredBy: string;
  registeredAt: Date;
  distributionDate?: Date;
  distributorId?: string;
}

export interface Muzaki {
  id: string;
  masjidId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  numberOfPeople: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'online';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentDate?: Date;
  registeredBy: string;
  registeredAt: Date;
}

export interface Distributor {
  id: string;
  masjidId: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'distributor' | 'admin';
  active: boolean;
  createdAt: Date;
}

export interface Collection {
  id: string;
  masjidId: string;
  muzakiId: string;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  collectedBy: string;
  collectedAt: Date;
}

export interface Distribution {
  id: string;
  masjidId: string;
  mesakinId: string;
  amount: number;
  packageType: string;
  distributedBy: string;
  distributedAt: Date;
  signature?: string;
}