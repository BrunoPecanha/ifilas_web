import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AttendantUnion } from '../../../../models/attendant-union';
import { QueueAttendant } from '../../../../models/queue-attendat.model';
import { ScheduleAttendant } from '../../../../models/schedule-attendat.model copy';

@Component({
  selector: 'app-attendant-card-mobile',
  templateUrl: './attendant-card-mobile.component.html',
  standalone: false,
  styleUrls: ['./attendant-card-mobile.component.scss']
})
export class AttendantCardMobileComponent {
  @Input() attendant!: AttendantUnion;
  @Output() select = new EventEmitter<AttendantUnion>();

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  getQueueInfo(attendant: AttendantUnion): QueueAttendant {
    return attendant as QueueAttendant;
  }

  getScheduleInfo(attendant: AttendantUnion): ScheduleAttendant {
    return attendant as ScheduleAttendant;
  }

  formatNextSlot(date: Date): string {
    const now = new Date();
    const diffMinutes = Math.floor((date.getTime() - now.getTime()) / 60000);
    
    if (diffMinutes <= 0) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? minutes : ''}`;
  }

  onSelect(): void {
    if (this.attendant.isAvailable) {
      this.select.emit(this.attendant);
    }
  }
}