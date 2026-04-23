import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subject, takeUntil, finalize } from 'rxjs';
import { AttendantService } from 'src/app/core/services/attendant.service';
import { AttendantUnion } from '../../models/attendant-union';
import { Store } from '../../models/store.model';

@Component({
  selector: 'app-store-mobile',
  templateUrl: './store-mobile.component.html',
  styleUrls: ['./store-mobile.component.scss'],
  standalone: false
})
export class StoreMobileComponent implements OnInit, OnDestroy {
  store: Store | null = null;
  allAttendants: AttendantUnion[] = [];
  filteredAttendants: AttendantUnion[] = [];
  filterType: 'all' | 'queue' | 'schedule' = 'all';
  isLoading = true;
  headerScrolled = false;

  private destroy$ = new Subject<void>();

  // Dados mockados para o banner da loja (caso o serviço não retorne)
  mockStoreData = {
    timeRange: '30 - 60 min',
    minimumOrder: 30.00
  };

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
          // Criar store mock para teste
          this.store = {
            id: 'store-001',
            name: 'MAREsiAS BAR E RESTAURANTE',
            logoPath: 'assets/store-logo.png',
            address: 'Rua Example, 123',
            phone: '(11) 99999-9999'
          } as Store;
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
          // Dados mockados para teste
          this.allAttendants = this.getMockAttendants();
          this.filterAttendants();
          this.showErrorToast();
        }
      });
  }

  // Mock de atendentes para teste
  private getMockAttendants(): AttendantUnion[] {
    return [
      {
        id: '1',
        name: 'Carlos Silva',
        description: 'Especialista em caldos e sopas',
        type: 'queue',
        isAvailable: true,
        photoUrl: 'assets/avatar1.png',
        serviceTime: 30,
        price: 45.00
      },
      {
        id: '2',
        name: 'Ana Santos',
        description: 'Chef executiva',
        type: 'queue',
        isAvailable: true,
        photoUrl: 'assets/avatar2.png',
        serviceTime: 35,
        price: 55.00
      },
      {
        id: '3',
        name: 'Ricardo Oliveira',
        description: 'Cardápio especial para 2 pessoas',
        type: 'schedule',
        isAvailable: true,
        photoUrl: 'assets/avatar3.png',
        serviceTime: 45,
        price: 89.90
      },
      {
        id: '4',
        name: 'Fernanda Lima',
        description: 'Pratos especiais e sobremesas',
        type: 'schedule',
        isAvailable: true,
        photoUrl: 'assets/avatar4.png',
        serviceTime: 40,
        price: 75.00
      }
    ] as AttendantUnion[];
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
          label: 'MAREsiAS BAR E RESTAURANTE',
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
      await this.loadAttendants();
      setTimeout(() => {
        event.target.complete();
      }, 800);
    } catch (error) {
      event.target.complete();
    }
  }

  private async showErrorToast(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Erro ao carregar atendentes. Usando dados de demonstração.',
      duration: 3000,
      position: 'bottom',
      color: 'warning',
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

  goBack() {
    this.router.navigate(['/home']);
  }

  handleNotificationClick() {
    console.log('Notificações clicadas');
    // this.router.navigate(['/notification']);
  }

  // Método para obter o tempo formatado da loja
  getStoreTimeRange(): string {
    return this.mockStoreData.timeRange;
  }

  // Método para obter o valor mínimo formatado
  getMinimumOrderFormatted(): string {
    return `R$ ${this.mockStoreData.minimumOrder.toFixed(2).replace('.', ',')}`;
  }

  // Método para formatar preço do atendente
  formatPrice(price?: number): string {
    if (!price) return 'R$ 0,00';
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  }
}