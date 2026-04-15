import { Attendant } from "./attendant.mode";

export interface QueueAttendant extends Attendant {
  type: 'queue';
  queueLength: number;
  estimatedWaitTime: number;
  currentTicket?: number;
}