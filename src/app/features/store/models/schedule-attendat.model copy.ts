import { Attendant } from "./attendant.mode";

export interface ScheduleAttendant extends Attendant {
  type: 'schedule';
  nextAvailableSlot: Date;
  workingHours: {
    start: string;
    end: string;
  };
}