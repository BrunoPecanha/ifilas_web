import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AttendantService } from 'src/app/core/services/attendant.service';
import { AttendantUnion } from 'src/app/features/store/models/attendant-union';
import { Store } from 'src/app/features/store/models/store.model';

@Component({
  selector: 'app-attendant-selection-mobile',
  templateUrl: './attendant-selection-mobile.component.html',
  standalone: false,
  styleUrls: ['./attendant-selection-mobile.component.scss']
})
export class AttendantSelectionMobileComponent implements OnInit, OnDestroy {
  store: Store | null = null;
  allAttendants: AttendantUnion[] = [];
  filteredAttendants: AttendantUnion[] = [];
  filterType: 'all' | 'queue' | 'schedule' = 'all';
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private attendantService: AttendantService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit(): void {
    this.loadStore();
    this.loadAttendants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStore(): void {
    this.attendantService.getCurrentStore()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (store) => {
          this.store = store;
        },
        error: (error) => {
          console.error('Error loading store:', error);
        }
      });
  }

  loadAttendants(): void {
    this.isLoading = true;

    this.attendantService.getAttendants('store-001')
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (attendants) => {
          this.allAttendants = attendants;
          this.filterAttendants();
        },
        error: (error) => {
          console.error('Error loading attendants:', error);
          this.showErrorToast();
        }
      });
  }

  filterAttendants(): void {
    if (this.filterType === 'all') {
      this.filteredAttendants = this.allAttendants;
    } else {
      this.filteredAttendants = this.allAttendants.filter(
        a => a.type === this.filterType
      );
    }
  }

  getQueueAttendants(): AttendantUnion[] {
    return this.filteredAttendants.filter(a => a.type === 'queue');
  }

  getScheduleAttendants(): AttendantUnion[] {
    return this.filteredAttendants.filter(a => a.type === 'schedule');
  }

  async selectAttendant(attendant: AttendantUnion): Promise<void> {
    if (!attendant.isAvailable) {
      const toast = await this.toastController.create({
        message: `${attendant.name} não está disponível no momento`,
        duration: 2000,
        position: 'bottom',
        color: 'warning',
        icon: 'time-outline'
      });
      await toast.present();
      return;
    }

    try {
      const token = await this.attendantService.generateAnonymousToken();
      await this.attendantService.selectAttendant(attendant.id);

      if (attendant.type === 'queue') {
        this.router.navigate(['/queue', attendant.id]);
      } else {
        this.router.navigate(['/schedule', attendant.id]);
      }
    } catch (error) {
      console.error('Error selecting attendant:', error);
      const toast = await this.toastController.create({
        message: 'Erro ao processar sua solicitação. Tente novamente.',
        duration: 3000,
        position: 'bottom',
        color: 'danger',
        icon: 'alert-circle-outline'
      });
      await toast.present();
    }
  }

  async changeStore(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Trocar de Loja',
      message: 'Selecione outra loja disponível',
      cssClass: 'ios-alert',
      inputs: [
        {
          name: 'store',
          type: 'radio',
          label: 'Barbearia Vintage Club',
          value: 'store-001',
          checked: true
        },
        {
          name: 'store',
          type: 'radio',
          label: 'Studio Beleza & Estilo',
          value: 'store-002'
        },
        {
          name: 'store',
          type: 'radio',
          label: 'Espaço Premium Hair',
          value: 'store-003'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (value) => {
            if (value) {
              this.loadAttendants();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async handleRefresh(event: any): Promise<void> {
    try {
      this.loadAttendants();
      setTimeout(() => {
        event.target.complete();
      }, 800);
    } catch (error) {
      event.target.complete();
    }
  }

  private async showErrorToast(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Erro ao carregar atendentes. Tente novamente.',
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      icon: 'alert-circle-outline',
      buttons: [
        {
          text: 'Tentar',
          handler: () => this.loadAttendants()
        }
      ]
    });
    await toast.present();
  }
}