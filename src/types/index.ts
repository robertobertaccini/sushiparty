export type UserRole = 'client' | 'worker' | 'admin' | 'participant';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
  city?: string; // For workers
  availability?: string[]; // ISO dates for workers
  defaultCompensation?: number;
}

export interface SushiEvent {
  id: string;
  clientId: string;
  workerId: string;
  date: string;
  city: string;
  participantCount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  additionalServices: string[];
  qrCode?: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
}
