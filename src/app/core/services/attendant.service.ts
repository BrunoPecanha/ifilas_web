// src/app/services/attendant.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AttendantUnion } from 'src/app/features/store/models/attendant-union';
import { Store } from 'src/app/features/store/models/store.model';



@Injectable({
  providedIn: 'root'
})
export class AttendantService {
  private currentStore: Store = {
    id: 'store-001',
    name: 'Barbearia Vintage Club',
    address: 'Av. Paulista, 1000 - São Paulo, SP'
  };

  constructor() {}

  getCurrentStore(): Observable<Store> {
    return of(this.currentStore).pipe(delay(300));
  }

  getAttendants(storeId: string): Observable<AttendantUnion[]> {
    // Simulação de dados da API
    const attendants: AttendantUnion[] = [
      {
        id: 'att-001',
        name: 'Ricardo Oliveira',
        role: 'Barbeiro Master',
        type: 'queue',
        isAvailable: true,
        queueLength: 3,
        estimatedWaitTime: 25,
        currentTicket: 47,
         workingHours: null,
        nextAvailableSlot: new Date()
      },
      {
        id: 'att-002',
        name: 'Marcos Santos',
        role: 'Barbeiro Sênior',
        type: 'queue',
        isAvailable: true,
        queueLength: 5,
        estimatedWaitTime: 40,
        currentTicket: 32,
        workingHours: null,
        nextAvailableSlot: new Date()
      },
      {
        id: 'att-003',
        name: 'Fernando Costa',
        role: 'Barbeiro',
        type: 'queue',
        isAvailable: true,
        queueLength: 2,
        estimatedWaitTime: 15,
        currentTicket: 18,
         workingHours: null,
        nextAvailableSlot: new Date()
      },
      {
        id: 'att-004',
        name: 'Juliana Mendes',
        role: 'Cabeleireira Especialista',
        type: 'schedule',
        isAvailable: true,
        nextAvailableSlot: new Date(Date.now() + 45 * 60000), // 45 minutos
        workingHours: {
          start: '09:00',
          end: '18:00'
        },
        queueLength: 0,
        currentTicket: 0,
        estimatedWaitTime: 0
      },
      {
        id: 'att-005',
        name: 'Patricia Lima',
        role: 'Manicure e Design',
        type: 'schedule',
        isAvailable: false,
        nextAvailableSlot: new Date(Date.now() + 120 * 60000), // 2 horas
        workingHours: {
          start: '10:00',
          end: '19:00'
        },
        queueLength: 0,
        currentTicket: 0,
        estimatedWaitTime: 0
      },
      {
        id: 'att-006',
        name: 'André Felipe',
        role: 'Barbeiro',
        type: 'queue',
        isAvailable: false,
        queueLength: 8,
        estimatedWaitTime: 65,
        nextAvailableSlot: new Date,
        currentTicket: 0,
        workingHours: undefined
      }
    ];

    return of(attendants).pipe(delay(500));
  }

  async generateAnonymousToken(): Promise<string> {
    const token = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_token', token);
    return token;
  }

  async selectAttendant(attendantId: string): Promise<void> {
    localStorage.setItem('selected_attendant', attendantId);
  }
}