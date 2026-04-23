import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';

// Mock do SessionService
class MockSessionService {
  private profile: number = 0; // 0 = dono, 1 = cliente, etc
  
  getProfile(): number {
    // Mock: retorna perfil de cliente para teste
    const savedProfile = localStorage.getItem('mock_profile');
    return savedProfile ? parseInt(savedProfile) : 1;
  }
  
  setProfile(profile: number): void {
    localStorage.setItem('mock_profile', profile.toString());
    this.profile = profile;
  }
}

// Mock do NotificationService
class MockNotificationService {
  private notificacoesNaoLidasSubject = new BehaviorSubject<number>(3);
  public notificacoesNaoLidas$ = this.notificacoesNaoLidasSubject.asObservable();
  
  atualizarContadorNaoLidas(): void {
    // Mock: gera número aleatório entre 0 e 10 para teste
    const randomCount = Math.floor(Math.random() * 11);
    console.log(`[Mock] Atualizando contador de notificações: ${randomCount}`);
    this.notificacoesNaoLidasSubject.next(randomCount);
  }
  
  // Método para teste manual
  setNotificacaoCount(count: number): void {
    this.notificacoesNaoLidasSubject.next(count);
  }
}

// Mock do History (para navegação)
class MockHistory {
  private historyStack: string[] = ['/home', '/services', '/professional'];
  private currentIndex: number = this.historyStack.length - 1;
  
  back(): string | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.historyStack[this.currentIndex];
    }
    return null;
  }
  
  push(url: string): void {
    this.historyStack.push(url);
    this.currentIndex = this.historyStack.length - 1;
  }
}

@Component({
  selector: 'app-custom-header',
  templateUrl: './custom-header.component.html',
  styleUrls: ['./custom-header.component.scss'],
  standalone: false
})
export class CustomHeaderComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() otherSubtitle?: string;
  @Input() hideOtherSubtitle: boolean = false;

  @Input() showStartButton: boolean = true;
  @Input() startIconName: string = 'chevron-back-outline';
  @Input() startButtonClass: string = 'start-button';
  @Input() startDisabled: boolean = false;
  @Input() startLoading: boolean = false;
  @Output() onStartClick = new EventEmitter<void>();
  @Input() floating = false;

  @Input() showEndButton: boolean = true;
  @Input() endIconName: string = 'notifications-outline';
  @Input() endButtonClass: string = 'end-button';
  @Input() endDisabled: boolean = false;
  @Input() endLoading: boolean = false;
  @Output() onEndClick = new EventEmitter<void>();
  @Input() hideSubtitle: boolean = false;

  @Input() hideOnScroll: boolean = false;
  @Input() scrollThreshold: number = 50;
  @Input() autoHide: boolean = true;

  @Input() showPausePlayButton: boolean = false;
  @Input() isPaused: boolean = false;
  @Output() onPausePlayClick = new EventEmitter<void>();

  @Input() routeLink: string = '';
  @Input() notificationCount?: number | null;
  @Input() showNotificationBadge: boolean = true;
  @Input() isHidden: boolean = false;

  notificationCount$!: Observable<number>;

  profile: any;
  userFromSession: any;
  lastScrollTop: number = 0;
  scrollTimeout: any;

  private notificationsSubscription?: Subscription;
  
  // Services mockados
  private sessionService = new MockSessionService();
  private notificationService = new MockNotificationService();
  private history = new MockHistory();

  constructor(
    private router: Router,
    private navCtrl: NavController
  ) {
    console.log('[Mock Header] Construtor iniciado');
    this.profile = this.sessionService.getProfile();
    console.log('[Mock Header] Perfil carregado:', this.profile === 0 ? 'Dono' : 'Cliente');
  }

  ngOnInit(): void {
    console.log('[Mock Header] ngOnInit iniciado');
    
    // Inicializa observable de notificações
    this.notificationCount$ = this.notificationService.notificacoesNaoLidas$;
    
    // Se não foi passado notificationCount como input, inscreve no observable
    if (this.notificationCount === undefined || this.notificationCount === null) {
      this.notificationsSubscription = this.notificationCount$.subscribe(count => {
        this.notificationCount = count;
        console.log('[Mock Header] Notificações atualizadas:', count);
        //this.cdr.detectChanges();
      });
    }
    
    // Atualiza contador de notificações
    this.notificationService.atualizarContadorNaoLidas();
    
    // Se hideOnScroll estiver ativo, adiciona listener de scroll
    if (this.hideOnScroll) {
      this.setupScrollListener();
    }
  }
  
  private setupScrollListener(): void {
    window.addEventListener('scroll', () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (currentScrollTop > this.lastScrollTop && currentScrollTop > this.scrollThreshold) {
        // Scroll para baixo - esconde header
        if (this.autoHide && !this.isHidden) {
          this.isHidden = true;
          console.log('[Mock Header] Header escondido');
        }
      } else if (currentScrollTop < this.lastScrollTop) {
        // Scroll para cima - mostra header
        if (this.autoHide && this.isHidden) {
          this.isHidden = false;
          console.log('[Mock Header] Header mostrado');
        }
      }
      
      this.lastScrollTop = currentScrollTop;
      
      // Timeout para esconder após parar de scroll
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      this.scrollTimeout = setTimeout(() => {
        if (this.autoHide && !this.isHidden && currentScrollTop > this.scrollThreshold) {
          // this.isHidden = true; // Descomente se quiser esconder após parar
        }
      }, 1500);
    });
  }

  ngOnDestroy(): void {
    console.log('[Mock Header] ngOnDestroy iniciado');
    this.notificationsSubscription?.unsubscribe();
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  handleStartButtonClick() {
    console.log('[Mock Header] Botão de início clicado');
    
    if (this.startDisabled || this.startLoading) {
      console.log('[Mock Header] Botão desabilitado ou em loading');
      return;
    }

    if (this.onStartClick.observers.length > 0) {
      console.log('[Mock Header] Emitindo evento onStartClick');
      this.onStartClick.emit();
    } else if (this.isBackButton()) {
      console.log('[Mock Header] Executando goBack');
      this.goBack();
    }
  }

  private isBackButton(): boolean {
    const backIcons = ['arrow-back', 'arrow-back-outline', 'chevron-back', 'chevron-back-outline'];
    const isBack = backIcons.includes(this.startIconName);
    console.log('[Mock Header] É botão de voltar?', isBack);
    return isBack;
  }

  async goBack() {
    console.log('[Mock Header] Navegando para trás');
    
    try {
      // Tenta voltar no histórico do mock
      const previous = this.history.back();
      if (previous) {
        console.log('[Mock Header] Histórico encontrado:', previous);
        this.router.navigateByUrl(previous, { replaceUrl: true, state: { redirectedFromBack: true } });
        return;
      }
      
      // Define rota padrão baseada no perfil
      let defaultRoute = '/home';
      if (this.profile === 0) {
        defaultRoute = '/queue-list-for-owner';
      } else if (this.profile === 1) {
        defaultRoute = '/customer-list-in-queue';
      } else {
        defaultRoute = '/queue';
      }
      
      const route = this.routeLink || defaultRoute;
      console.log('[Mock Header] Navegando para rota padrão:', route);
      this.router.navigate([route], { replaceUrl: true, state: { redirectedFromBack: true } });
    } catch (error) {
      console.error('[Mock Header] Erro na navegação:', error);
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }

  onEndButtonClick() {
    console.log('[Mock Header] Botão de fim clicado');
    
    if (this.endDisabled || this.endLoading) {
      console.log('[Mock Header] Botão desabilitado ou em loading');
      return;
    }
    
    this.onEndClick.emit();
    this.goToNotifications();
  }

  private goToNotifications() {
    console.log('[Mock Header] Navegando para notificações');
    
    // Mock: mostra alerta em vez de navegar
    this.showNotificationAlert();
    
    // Descomente quando tiver a rota
    // try {
    //   this.navCtrl.navigateForward('/notification');
    // } catch (err) {
    //   console.error('Navigation error to notifications:', err);
    //   this.router.navigate(['/notification']);
    // }
  }
  
  private showNotificationAlert(): void {
    const hasNotifications = this.hasNotifications();
    const message = hasNotifications 
      ? `Você tem ${this.notificationCount} notificação(ões) não lida(s)!`
      : 'Nenhuma notificação nova no momento.';
    
    alert(`🔔 NOTIFICAÇÕES\n\n${message}\n\n(Modo de teste - implemente a rota /notification quando estiver pronta)`);
  }

  hasNotifications(): boolean {
    return !!(this.notificationCount && this.notificationCount > 0);
  }

  displayNotificationText(): string {
    if (!this.notificationCount) return '';
    return this.notificationCount > 99 ? '99+' : String(this.notificationCount);
  }
  
  // Métodos auxiliares para teste
  setMockProfile(profile: number): void {
    this.sessionService.setProfile(profile);
    this.profile = profile;
    console.log(`[Mock Header] Perfil alterado para: ${profile === 0 ? 'Dono' : 'Cliente'}`);
  }
  
  setMockNotificationCount(count: number): void {
    this.notificationService.setNotificacaoCount(count);
  }
}