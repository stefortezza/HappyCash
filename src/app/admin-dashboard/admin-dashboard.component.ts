import { Component, OnInit, TemplateRef } from '@angular/core';
import { UserService } from '../service/user.service';
import { BusinessService } from '../service/business.service';
import { UserDetail } from 'src/interfaces/user-detail';
import { Business } from 'src/interfaces/business';
import { Register } from 'src/interfaces/register.interface';
import { ScontoService } from '../service/sconto.service';
import { catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  users: UserDetail[] = [];
  businesses: Business[] = [];
  selectedUser: Register | null = null;
  selectedBusiness: Business | null = null;
  selectedBusinessSconti: any[] = [];

  private editUserModalRef: NgbModalRef | null = null;
  private editBusinessModalRef: NgbModalRef | null = null;
  private scontiModalRef: NgbModalRef | null = null;

  constructor(
    private userService: UserService,
    private businessService: BusinessService,
    private scontoService: ScontoService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadBusinesses();
  }

  loadUsers(): void {
    this.userService
      .getAllUsers()
      .pipe(catchError(() => of([])))
      .subscribe((users) => {
        this.users = (users || []).filter((u) => u.userId !== undefined);
      });
  }

  loadBusinesses(): void {
    this.businessService
      .getAllBusinesses()
      .pipe(catchError(() => of([])))
      .subscribe((businesses) => {
        this.businesses = (businesses || []).filter((b) => b.id !== undefined);
      });
  }

  approveUser(userId: number): void {
    this.userService.approveUser(userId).subscribe(() => this.loadUsers());
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe(() => this.loadUsers());
  }

  deleteBusiness(businessId: number): void {
    this.businessService
      .deleteBusiness(businessId)
      .subscribe(() => this.loadBusinesses());
  }

  openEditUserModal(user: UserDetail, content: TemplateRef<any>): void {
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
    this.editUserModalRef = this.modalService.open(content, {
      centered: true,
      size: 'lg',
    });
  }

  openEditBusinessModal(business: Business, content: TemplateRef<any>): void {
    this.selectedBusiness = { ...business };
    this.editBusinessModalRef = this.modalService.open(content, {
      centered: true,
      size: 'lg',
    });
  }

  openScontiModal(business: Business, content: TemplateRef<any>): void {
    this.selectedBusiness = business;
    this.scontoService.getScontiByBusiness(business.id!).subscribe((sconti) => {
      this.selectedBusinessSconti = sconti;
      this.scontiModalRef = this.modalService.open(content, {
        centered: true,
        size: 'lg',
      });
    });
  }

  onUserUpdated(updatedUser: Register): void {
    const index = this.users.findIndex((u) => u.userId === updatedUser.userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updatedUser };
    }
    this.editUserModalRef?.close();
    this.selectedUser = null;
  }

  onBusinessUpdated(updatedBusiness: Business): void {
    const index = this.businesses.findIndex((b) => b.id === updatedBusiness.id);
    if (index !== -1) {
      this.businesses[index] = {
        ...this.businesses[index],
        ...updatedBusiness,
      };
    }
    this.editBusinessModalRef?.close();
    this.selectedBusiness = null;
  }

  visualizzaSconti(businessId: number): void {
    this.router.navigate(['/sconti-admin', businessId]);
  }
}
