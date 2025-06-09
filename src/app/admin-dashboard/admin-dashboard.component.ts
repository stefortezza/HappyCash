import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../service/user.service';
import { BusinessService } from '../service/business.service';
import { UserDetail } from 'src/interfaces/user-detail';
import { Business } from 'src/interfaces/business';
import { catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { Register } from 'src/interfaces/register.interface';
import { ScontoService } from '../service/sconto.service';
import { NavigationStart, Router } from '@angular/router';

declare const bootstrap: any;

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  selectedBusinessSconti: any[] = [];
  users: UserDetail[] = [];
  businesses: Business[] = [];

  selectedUser: Register | null = null;
  selectedBusiness: Business | null = null;

  private editUserModalInstance: any;
  private editBusinessModalInstance: any;
  private scontiModalInstance: any;

  private routerSubscription!: Subscription;

  constructor(
    private userService: UserService,
    private businessService: BusinessService,
    private scontoService: ScontoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadBusinesses();

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.closeAllModals();
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  closeAllModals(): void {
    if (this.editUserModalInstance) {
      this.editUserModalInstance.hide();
      this.editUserModalInstance.dispose();
      this.editUserModalInstance = null;
    }

    if (this.editBusinessModalInstance) {
      this.editBusinessModalInstance.hide();
      this.editBusinessModalInstance.dispose();
      this.editBusinessModalInstance = null;
    }

    if (this.scontiModalInstance) {
      this.scontiModalInstance.hide();
      this.scontiModalInstance.dispose();
      this.scontiModalInstance = null;
    }

    this.removeModalBackdrops();
    this.selectedUser = null;
    this.selectedBusiness = null;
    this.selectedBusinessSconti = [];
  }

  onBusinessUpdated(): void {
    this.loadBusinesses();
    setTimeout(() => this.closeAllModals(), 300);
  }

  onUserUpdated(): void {
    this.loadUsers();
    setTimeout(() => this.closeAllModals(), 300);
  }

  loadUsers(): void {
    this.userService
      .getAllUsers()
      .pipe(
        catchError((err) => {
          console.error('Errore caricamento utenti:', err);
          return of([]);
        })
      )
      .subscribe((users) => {
        this.users = (users || [])
          .filter((u) => u.userId !== undefined)
          .sort((a, b) => (a.userId ?? 0) - (b.userId ?? 0));
      });
  }

  loadBusinesses(): void {
    this.businessService
      .getAllBusinesses()
      .pipe(
        catchError((err) => {
          console.error('Errore caricamento aziende:', err);
          return of([]);
        })
      )
      .subscribe((businesses) => {
        this.businesses = (businesses || [])
          .filter((b) => b.id !== undefined)
          .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
      });
  }

  approveUser(userId: number): void {
    this.userService.approveUser(userId).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Errore approvazione utente:', err),
    });
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Errore eliminazione utente:', err),
    });
  }

  deleteBusiness(businessId: number): void {
    this.businessService.deleteBusiness(businessId).subscribe({
      next: () => this.loadBusinesses(),
      error: (err) => console.error('Errore eliminazione azienda:', err),
    });
  }

  openEditUserModal(user: UserDetail): void {
    this.selectedUser = null;
    setTimeout(() => {
      this.selectedUser = {
        userId: user.userId,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        telefono: user.telefono,
        codiceFiscale: user.codiceFiscale,
        consensoPrivacy: user.consensoPrivacy,
        terminiCondizioni: user.terminiCondizioni,
        marketing: user.marketing,
        password: '',
        role: user.role ?? 'USER',
        comune: user.comune,
      };

      const modalEl = document.getElementById('editUserModal');
      if (modalEl) {
        this.editUserModalInstance = new bootstrap.Modal(modalEl);
        this.editUserModalInstance.show();
      }
    });
  }

  openEditBusinessModal(business: Business): void {
    this.selectedBusiness = null;
    setTimeout(() => {
      this.selectedBusiness = { ...business };

      const modalEl = document.getElementById('editBusinessModal');
      if (modalEl) {
        this.editBusinessModalInstance = new bootstrap.Modal(modalEl);
        this.editBusinessModalInstance.show();
      }
    });
  }

  openScontiModal(business: Business): void {
    this.selectedBusiness = business;
    this.selectedBusinessSconti = [];

    this.scontoService.getScontiByBusiness(business.id!).subscribe({
      next: (sconti) => {
        this.selectedBusinessSconti = sconti;
        const modalEl = document.getElementById('scontiModal');
        if (modalEl) {
          this.scontiModalInstance = new bootstrap.Modal(modalEl);
          this.scontiModalInstance.show();
        }
      },
      error: () => {
        alert('❌ Errore nel caricamento degli sconti.');
      },
    });
  }

  visualizzaSconti(businessId: number): void {
    this.router.navigate(['/sconti-admin', businessId]);
  }

  onCloseUserModal(): void {
    if (this.editUserModalInstance) {
      this.editUserModalInstance.hide();
      this.editUserModalInstance.dispose();
      this.editUserModalInstance = null;
    }
    this.resetUserModalState();
  }

  onCloseBusinessModal(): void {
    if (this.editBusinessModalInstance) {
      this.editBusinessModalInstance.hide();
      this.editBusinessModalInstance.dispose();
      this.editBusinessModalInstance = null;
    }
    this.resetBusinessModalState();
  }

  private removeModalBackdrops(): void {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach((b) => b.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  }

  resetUserModalState(): void {
    this.selectedUser = null;
    setTimeout(() => this.removeModalBackdrops(), 100);
  }

  resetBusinessModalState(): void {
    this.selectedBusiness = null;
    setTimeout(() => this.removeModalBackdrops(), 100);
  }
}
