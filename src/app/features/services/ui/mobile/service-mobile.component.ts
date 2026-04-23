import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';

// Mocks dos modelos
interface ServiceModel {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number | string;
  imgPath?: string;
  variablePrice?: boolean;
  variableTime?: boolean;
  quantity?: number;
  category?: {
    id: number;
    name: string;
  };
}

interface UserModel {
  id: number;
  name: string;
  email?: string;
}

interface StoreModel {
  id: number;
  name: string;
  logoPath?: string;
  address?: string;
}

// Mock do SessionService
class MockSessionService {
  private storage: Map<string, any> = new Map();

  getUser(): UserModel {
    return {
      id: 1,
      name: 'Usuário Teste',
      email: 'teste@email.com'
    };
  }

  getStore(): StoreModel {
    return {
      id: 1,
      name: 'Barbearia Teste',
      logoPath: 'assets/logo.png'
    };
  }

  setGenericKey(data: any, key: string): void {
    this.storage.set(key, data);
    console.log(`[Mock] Dados salvos na chave "${key}":`, data);
  }

  getGenericKey(key: string): any {
    return this.storage.get(key);
  }

  removeGenericKey(key: string): void {
    this.storage.delete(key);
    console.log(`[Mock] Chave "${key}" removida`);
  }
}

// Mock do ServiceService
class MockServiceService {
  loadServicesByStore(storeId: number, activeOnly: boolean): any {
    console.log(`[Mock] Carregando serviços da loja ${storeId}`);

    // Mock de serviços
    const mockServices = {
      data: [
        {
          id: 1,
          name: 'Corte de Cabelo',
          description: 'Corte moderno com tesoura e máquina',
          price: 45.00,
          duration: 30,
          variablePrice: false,
          variableTime: false,
          imgPath: '',
          category: { id: 1, name: 'Cabelo' }
        },
        {
          id: 2,
          name: 'Barba',
          description: 'Barba completa com navalha',
          price: 35.00,
          duration: 25,
          variablePrice: false,
          variableTime: false,
          imgPath: '',
          category: { id: 2, name: 'Barba' }
        },
        {
          id: 3,
          name: 'Corte + Barba',
          description: 'Combo completo de cuidado',
          price: 70.00,
          duration: 55,
          variablePrice: false,
          variableTime: false,
          imgPath: '',
          category: { id: 3, name: 'Combo' }
        },
        {
          id: 4,
          name: 'Platinado',
          description: 'Descoloração e tonalização',
          price: 150.00,
          duration: 120,
          variablePrice: true,
          variableTime: false,
          imgPath: '',
          category: { id: 4, name: 'Química' }
        },
        {
          id: 5,
          name: 'Sobrancelha',
          description: 'Design e pigmentação',
          price: 25.00,
          duration: 20,
          variablePrice: false,
          variableTime: false,
          imgPath: '',
          category: { id: 5, name: 'Estética' }
        },
        {
          id: 6,
          name: 'Hidratação Capilar',
          description: 'Tratamento profundo',
          price: 60.00,
          duration: 45,
          variablePrice: false,
          variableTime: false,
          imgPath: '',
          category: { id: 1, name: 'Cabelo' }
        }
      ]
    };

    // Simula delay de rede
    return {
      subscribe: (callbacks: any) => {
        setTimeout(() => {
          if (callbacks.next) callbacks.next(mockServices);
        }, 500);
        return { unsubscribe: () => { } };
      }
    };
  }
}

// Mock do CustomerService
class MockCustomerService {
  loadCustomerInfo(customerId: number): any {
    console.log(`[Mock] Carregando informações do cliente ${customerId}`);

    // Mock de serviços selecionados do cliente
    const mockResponse = {
      data: {
        services: [
          { name: 'Corte de Cabelo', quantity: 1 },
          { name: 'Barba', quantity: 1 }
        ],
        paymentMethodId: 1,
        notes: 'Cliente prefere atendimento pela manhã'
      }
    };

    return {
      subscribe: (callbacks: any) => {
        setTimeout(() => {
          if (callbacks.next) callbacks.next(mockResponse);
        }, 300);
        return { unsubscribe: () => { } };
      }
    };
  }
}

@Component({
  selector: 'app-service-mobile',
  templateUrl: './service-mobile.component.html',
  styleUrls: ['./service-mobile.component.scss'],
  standalone: false
})
export class ServiceMobileComponent {
  // Propriedades principais
  storeId: number = 0;
  totalTime = 0;
  totalPrice = 0;
  totalTimeString = '';
  totalPriceString = '';
  notes = '';
  paymentMethod = 1;
  selectedServices: ServiceModel[] = [];
  serviceOptions: ServiceModel[] = [];
  user: UserModel = {} as UserModel;
  store!: StoreModel;
  professionalId = 0;
  professionalName = '';

  // Propriedades de controle
  customerId: number | null = null;
  looseCustomer: boolean = false;
  looseCustomerName: string = '';
  useAgenda: boolean = false;
  editingExistingAppointment: boolean = false;

  // Propriedades de variáveis
  hasVariableTime: boolean = false;
  hasVariablePrice: boolean = false;
  fixedTimeTotal: number = 0;
  fixedPriceTotal: number = 0;

  // Animações
  animatingAdd: { [id: number]: boolean } = {};

  // Scroll do header
  headerScrolled = false;

  // Services mockados
  private sessionService = new MockSessionService();
  private serviceService = new MockServiceService();
  private customerService = new MockCustomerService();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {
    this.user = this.sessionService.getUser();
    this.store = this.sessionService.getStore();
    console.log('[Mock] Componente inicializado', { user: this.user, store: this.store });
  }

  ngOnInit() {
    console.log('[Mock] ngOnInit executado');
    this.getProfessionalAndStore();
    this.setupScrollListener();
  }

  ionViewWillEnter() {
    console.log('[Mock] ionViewWillEnter executado');
    const savedServices = this.sessionService.getGenericKey('selectedServices');
    if (savedServices) {
      this.selectedServices = savedServices;
      this.updateTotals();
      this.sessionService.removeGenericKey('selectedServices');
    }
  }

  trackByServiceId = (index: number, item: ServiceModel) => item?.id ?? index;

  setupScrollListener() {
    window.addEventListener('scroll', () => {
      this.headerScrolled = window.scrollY > 10;
    });
  }

  getProfessionalAndStore() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state || {};

    this.route.queryParams.subscribe(params => {
      console.log('[Mock] QueryParams recebidos:', params);
      console.log('[Mock] Navigation state:', state);

      // Store ID
      const storeIdParam = params['storeId'];
      const storeIdState = state['storeId'];
      this.storeId = (storeIdParam !== undefined && storeIdParam !== null)
        ? Number(storeIdParam)
        : (storeIdState !== undefined && storeIdState !== null)
          ? Number(storeIdState)
          : (this.sessionService.getStore()?.id ?? 1); // Mock: fallback para 1

      // Professional
      this.professionalId = params['professionalId'] ?? state['professionalId'] ?? this.user.id;
      this.professionalName = params['professionalName'] ?? state['professionalName'] ?? 'Profissional Teste';

      // Flags de fluxo
      this.useAgenda = this.getBooleanParam(params, state, 'useAgenda', false);
      this.looseCustomer = this.getBooleanParam(params, state, 'looseCustomer', false);
      this.editingExistingAppointment = this.getBooleanParam(params, state, 'editingExistingAppointment', false);

      // Customer info
      this.customerId = this.getNumberParam(params, state, 'customerId', null);
      this.looseCustomerName = params['looseCustomerName'] ?? state['looseCustomerName'] ?? '';

      console.log('[Mock] Configurações carregadas:', {
        storeId: this.storeId,
        professionalId: this.professionalId,
        professionalName: this.professionalName,
        useAgenda: this.useAgenda,
        looseCustomer: this.looseCustomer,
        customerId: this.customerId
      });

      // Carregar serviços
      this.loadAvailableServices();

      // Carregar serviços selecionados do cliente
      if (this.customerId) {
        this.loadSelectedServicesByCustomer(this.customerId);
      }
    });
  }

  private getBooleanParam(params: any, state: any, key: string, defaultValue: boolean): boolean {
    if (params[key] !== undefined) return params[key] === 'true';
    if (state[key] !== undefined) return state[key] === true || state[key] === 'true';
    return defaultValue;
  }

  private getNumberParam(params: any, state: any, key: string, defaultValue: number | null): number | null {
    if (params[key] !== undefined) return Number(params[key]);
    if (state[key] !== undefined) return Number(state[key]);
    return defaultValue;
  }

  loadAvailableServices() {
    console.log('[Mock] Carregando serviços disponíveis para storeId:', this.storeId);

    if (this.storeId) {
      this.serviceService.loadServicesByStore(this.storeId, true).subscribe({
        next: (response: any) => {
          this.serviceOptions = response.data;
          console.log('[Mock] Serviços carregados:', this.serviceOptions);

          // Se não há customerId, limpa seleção
          if (!this.customerId) {
            this.selectedServices = [];
            this.updateTotals();
          }
        },
        error: (err: any) => {
          console.error('[Mock] Erro ao carregar serviços:', err);
          this.presentAlert('Erro', 'Não foi possível carregar os serviços. Tente novamente.');
        }
      });
    } else {
      console.error('[Mock] Store ID não encontrado');
      // Mock: carrega serviços mesmo sem storeId para teste
      this.serviceService.loadServicesByStore(1, true).subscribe({
        next: (response: any) => {
          this.serviceOptions = response.data;
          console.log('[Mock] Serviços carregados (fallback):', this.serviceOptions);
        }
      });
    }
  }

  loadSelectedServicesByCustomer(customerId: number) {
    console.log('[Mock] Carregando serviços do cliente:', customerId);

    this.customerService.loadCustomerInfo(customerId).subscribe({
      next: (response: any) => {
        const services = response.data?.services || [];
        this.paymentMethod = response.data?.paymentMethodId || 1;
        this.notes = response.data?.notes || '';

        console.log('[Mock] Serviços do cliente:', services);
        console.log('[Mock] Notas:', this.notes);

        this.selectedServices = services
          .map((s: any) => {
            const fullService = this.serviceOptions.find(opt => opt.name === s.name);
            if (!fullService) {
              console.warn(`[Mock] Serviço "${s.name}" não encontrado`);
              return null;
            }
            return {
              ...fullService,
              quantity: s.quantity
            } as ServiceModel;
          })
          .filter((s: any): s is ServiceModel => s !== null);

        console.log('[Mock] Serviços selecionados após mapeamento:', this.selectedServices);
        this.updateTotals();
      },
      error: (err: any) => {
        console.error('[Mock] Erro ao carregar informações do cliente:', err);
      }
    });
  }

  isServiceSelected(service: ServiceModel): boolean {
    return this.selectedServices.some(selectedService => selectedService.id === service.id);
  }

  getQuantity(service: ServiceModel): number {
    const s = this.selectedServices.find(x => x.id === service.id);
    return s ? (Number(s.quantity) || 0) : 0;
  }

  addService(service: ServiceModel) {
    console.log('[Mock] Adicionando serviço:', service.name);
    const existingServiceIndex = this.selectedServices.findIndex(s => s.id === service.id);

    if (existingServiceIndex >= 0) {
      this.selectedServices[existingServiceIndex].quantity!++;
    } else {
      this.selectedServices.push({
        ...service,
        quantity: 1
      });
    }

    this.updateTotals();
  }

  removeService(index: number) {
    console.log('[Mock] Removendo serviço índice:', index);
    if (!this.selectedServices[index]) return;

    if (this.selectedServices[index].quantity! > 1) {
      this.selectedServices[index].quantity!--;
    } else {
      this.selectedServices.splice(index, 1);
    }

    this.updateTotals();
  }

  removeServiceById(id: number) {
    const idx = this.selectedServices.findIndex(s => s.id === id);
    if (idx >= 0) this.removeService(idx);
  }

  addServiceWithAnimation(service: ServiceModel) {
    this.addService(service);

    if (service?.id != null) {
      this.animatingAdd[service.id] = true;
      setTimeout(() => {
        delete this.animatingAdd[service.id];
      }, 800);
    }
  }

  onAddBtnClick(service: ServiceModel, event: Event) {
    event.stopPropagation();

    const qty = this.getQuantity(service);
    if (qty === 0) {
      this.addServiceWithAnimation(service);
    } else {
      this.incrementServiceForUi(service, event);
    }
  }

  incrementServiceForUi(service: ServiceModel, event?: Event) {
    if (event) event.stopPropagation();

    const idx = this.selectedServices.findIndex(s => s.id === service.id);

    if (idx >= 0) {
      const updated = {
        ...this.selectedServices[idx],
        quantity: (Number(this.selectedServices[idx].quantity) || 0) + 1
      };
      this.selectedServices[idx] = updated;
      this.selectedServices = [...this.selectedServices];
    } else {
      this.selectedServices = [
        ...this.selectedServices,
        { ...service, quantity: 1 }
      ];

      if (service?.id != null) {
        this.animatingAdd[service.id] = true;
        setTimeout(() => delete this.animatingAdd[service.id], 700);
      }
    }

    this.updateTotals();
  }

  decrementServiceForUi(service: ServiceModel, event?: Event) {
    if (event) event.stopPropagation();

    const idx = this.selectedServices.findIndex(s => s.id === service.id);
    if (idx < 0) return;

    const current = Number(this.selectedServices[idx].quantity) || 0;

    if (current > 1) {
      this.selectedServices[idx] = {
        ...this.selectedServices[idx],
        quantity: current - 1
      };
    } else {
      this.selectedServices.splice(idx, 1);
    }

    this.selectedServices = [...this.selectedServices];
    this.updateTotals();
  }

  openServiceDetail(service: ServiceModel) {
    if (!service) return;

    console.log('[Mock] Abrindo detalhes do serviço:', service.name);

    // Mock: mostra alerta em vez de navegar
    this.presentAlert('Detalhes do Serviço',
      `${service.name}\n\n${service.description || 'Sem descrição'}\n\nPreço: R$ ${service.price}\nDuração: ${service.duration} min`
    );

    // Descomente quando tiver a rota
    // this.router.navigate(['/item-details'], {
    //   state: {
    //     service: service,
    //     storeId: this.storeId,
    //     useAgenda: this.useAgenda,
    //     professionalName: this.professionalName,
    //     editingExistingAppointment: this.editingExistingAppointment
    //   }
    // });
  }

  updateTotals() {
    this.hasVariableTime = this.selectedServices.some(service => service.variableTime);

    this.fixedTimeTotal = this.selectedServices.reduce((acc, service) => {
      if (service.variableTime) return acc;

      const durationInMinutes = typeof service.duration === 'string'
        ? this.convertTimeStringToMinutes(service.duration)
        : Number(service.duration) || 0;

      const quantity = Number(service.quantity) || 0;
      return acc + (durationInMinutes * quantity);
    }, 0);

    this.hasVariablePrice = this.selectedServices.some(service => service.variablePrice);

    this.fixedPriceTotal = this.selectedServices.reduce((acc, service) => {
      if (service.variablePrice) return acc;

      const price = Number(service.price) || 0;
      const quantity = Number(service.quantity) || 0;
      return acc + (price * quantity);
    }, 0);

    this.formatOutput();
    this.sessionService.setGenericKey(this.selectedServices, 'selectedServices');

    console.log('[Mock] Totais atualizados:', {
      hasVariableTime: this.hasVariableTime,
      fixedTimeTotal: this.fixedTimeTotal,
      hasVariablePrice: this.hasVariablePrice,
      fixedPriceTotal: this.fixedPriceTotal,
      totalTimeString: this.totalTimeString,
      totalPriceString: this.totalPriceString
    });
  }

  private convertTimeStringToMinutes(timeString: string): number {
    if (!timeString) return 0;

    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parseInt(parts[2], 10) || 0;

    return hours * 60 + minutes + Math.round(seconds / 60);
  }

  formatOutput() {
    const hours = Math.floor(this.fixedTimeTotal / 60);
    const minutes = Math.round(this.fixedTimeTotal % 60);

    let timeString = '';
    if (hours > 0) {
      timeString = `${hours}h ${minutes.toString().padStart(2, '0')}min`;
    } else {
      timeString = `${minutes}min`;
    }

    this.totalTimeString = this.hasVariableTime
      ? `${timeString} + a definir`
      : timeString;

    const formattedPrice = isNaN(this.fixedPriceTotal)
      ? '0,00'
      : this.fixedPriceTotal.toFixed(2).replace('.', ',');

    this.totalPriceString = this.hasVariablePrice
      ? `R$ ${formattedPrice} + a combinar`
      : `R$ ${formattedPrice}`;
  }

  async confirmSelection() {
    console.log('[Mock] Confirmando seleção');

    if (this.selectedServices.length === 0) {
      await this.presentAlert('Nenhum serviço selecionado', 'Por favor, selecione pelo menos um serviço.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Serviços',
      message: `Você selecionou ${this.selectedServices.length} serviço(s) com valor total de ${this.totalPriceString}. Deseja continuar?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            console.log('[Mock] Usuário confirmou, useAgenda:', this.useAgenda);
            if (this.useAgenda) {
              this.proceedToSchedule();
            } else {
              this.goToCheckout();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  goToCheckout() {
    console.log('[Mock] Navegando para checkout');

    const checkoutContext = {
      flow: this.useAgenda ? 'agenda' : 'queue',
      storeId: this.storeId,
      storeData: {
        name: this.store.name,
        logo: this.store.logoPath
      },
      professionalId: this.professionalId,
      professionalName: this.professionalName,
      customerId: this.customerId,
      looseCustomer: this.looseCustomer,
      looseCustomerName: this.looseCustomerName,
      notes: this.notes,
      paymentMethod: this.paymentMethod,
      selectedServices: this.selectedServices,
      totalTime: this.fixedTimeTotal,
      totalPrice: this.fixedPriceTotal,
      totalTimeString: this.totalTimeString,
      totalPriceString: this.totalPriceString,
      editingExistingAppointment: this.editingExistingAppointment,
      userId: this.user.id
    };

    console.log('[Mock] Checkout Context:', checkoutContext);

    this.sessionService.setGenericKey(
      JSON.parse(JSON.stringify(checkoutContext)),
      'queueCheckoutContext'
    );

    // Mock: mostra alerta em vez de navegar
    this.presentAlert('Checkout', `Redirecionando para checkout com:\n\n${this.selectedServices.length} serviço(s)\n${this.totalPriceString}\n${this.totalTimeString}`);

    // Descomente quando tiver a rota
    // this.router.navigate(['/checkout'], {
    //   state: checkoutContext
    // });
  }

  proceedToSchedule() {
    console.log('[Mock] Prosseguindo para agendamento');

    this.sessionService.setGenericKey(this.selectedServices, 'selectedServices');
    this.sessionService.setGenericKey(this.notes, 'notes');
    this.sessionService.setGenericKey(this.paymentMethod, 'paymentMethod');
    this.sessionService.setGenericKey(this.storeId, 'storeId');
    this.sessionService.setGenericKey(this.professionalId, 'professionalId');
    this.sessionService.setGenericKey(this.looseCustomer, 'looseCustomer');
    this.sessionService.setGenericKey(this.looseCustomerName, 'looseCustomerName');

    // Mock: mostra alerta em vez de navegar
    this.presentAlert('Agendamento', 'Redirecionando para página de agendamento');

    // Descomente quando tiver a rota
    // this.router.navigate(['/schedule-appointment']);
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Adicione este método na classe ServiceMobileComponent
  handleNotificationClick() {
    console.log('[Mobile] Notificações clicadas');
    this.presentAlert('Notificações', 'Você tem 3 notificações não lidas!');

    // Quando tiver a rota de notificações, descomente:
    // this.router.navigate(['/notification']);
  }


  getBack() {
    console.log('[Mock] Voltar para seleção de profissional');
    this.presentAlert('Voltar', 'Redirecionando para seleção de profissional');

    // Descomente quando tiver a rota
    // this.router.navigate(['/select-professional'], {
    //   queryParams: { storeId: this.storeId }
    // });
  }
}

