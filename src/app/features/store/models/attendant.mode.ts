export interface Attendant {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  type: 'queue' | 'schedule';
  isAvailable: boolean;
}