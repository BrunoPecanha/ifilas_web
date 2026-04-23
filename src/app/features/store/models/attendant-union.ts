export interface AttendantUnion {
  id: string;
  name: string;
  description?: string;
  type: 'queue' | 'schedule';
  isAvailable: boolean;
  nextAvailableSlot: Date;
  queueLength: number;
  currentTicket: number;
  estimatedWaitTime: number;
  photoUrl?: string;
  role: string;
  workingHours: any;
  serviceTime?: number; // tempo em minutos
  price?: number; // preço do serviço
  rating?: number; // avaliação (opcional)
  specialty?: string; // especialidade (opcional)
}