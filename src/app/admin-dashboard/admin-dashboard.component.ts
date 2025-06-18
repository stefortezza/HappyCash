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
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  users: UserDetail[] = [];
  businesses: Business[] = [];
  filteredUsers: UserDetail[] = [];
  filteredBusinesses: Business[] = [];
  selectedUser: Register | null = null;
  selectedBusiness: Business | null = null;
  selectedBusinessSconti: any[] = [];

  searchUser: string = '';
  searchBusiness: string = '';
  currentUserPage: number = 1;
  currentBusinessPage: number = 1;
  itemsPerPage: number = 5;

  dataInizio: string = '';
  dataFine: string = '';

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
    this.userService.getAllUsers().pipe(catchError(() => of([]))).subscribe((users) => {
      this.users = (users || [])
        .filter((u) => u.userId !== undefined)
        .sort((a, b) => b.userId! - a.userId!); // Ordine decrescente
      this.filterUsers();
    });
  }

  loadBusinesses(): void {
    this.businessService.getAllBusinesses().pipe(catchError(() => of([]))).subscribe((businesses) => {
      this.businesses = (businesses || [])
        .filter((b) => b.id !== undefined)
        .sort((a, b) => b.id! - a.id!); // Ordine decrescente
      this.filterBusinesses();
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter((user) =>
      `${user.name} ${user.surname} ${user.email}`.toLowerCase().includes(this.searchUser.toLowerCase())
    );
    this.currentUserPage = 1;
  }

  filterBusinesses(): void {
    this.filteredBusinesses = this.businesses.filter((business) =>
      `${business.ragioneSociale} ${business.email}`.toLowerCase().includes(this.searchBusiness.toLowerCase())
    );
    this.currentBusinessPage = 1;
  }

  approveUser(userId: number): void {
    this.userService.approveUser(userId).subscribe(() => this.loadUsers());
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe(() => this.loadUsers());
  }

  deleteBusiness(businessId: number): void {
    this.businessService.deleteBusiness(businessId).subscribe(() => this.loadBusinesses());
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
    this.filterUsers();
  }

  onBusinessUpdated(updatedBusiness: Business): void {
    const index = this.businesses.findIndex((b) => b.id === updatedBusiness.id);
    if (index !== -1) {
      this.businesses[index] = { ...this.businesses[index], ...updatedBusiness };
    }
    this.editBusinessModalRef?.close();
    this.selectedBusiness = null;
    this.filterBusinesses();
  }

  visualizzaSconti(businessId: number): void {
    this.router.navigate(['/sconti-admin', businessId]);
  }

  onUserPageChange(page: number): void {
    this.currentUserPage = page;
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }

  onBusinessPageChange(page: number): void {
    this.currentBusinessPage = page;
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }

  get filteredSconti() {
    if (!this.dataInizio && !this.dataFine) return this.selectedBusinessSconti;

    const start = this.dataInizio ? new Date(this.dataInizio) : null;
    const end = this.dataFine ? new Date(this.dataFine) : null;
    if (end) end.setHours(23, 59, 59, 999);

    return this.selectedBusinessSconti.filter((s) => {
      const scontoDate = new Date(s.dataOra);
      return (!start || scontoDate >= start) && (!end || scontoDate <= end);
    });
  }

  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(
      this.filteredSconti.map((s) => ({
        DataOra: new Date(s.dataOra).toLocaleString(),
        Nome: s.nome,
        Cognome: s.cognome,
        Offerta: s.offerta,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sconti');
    XLSX.writeFile(workbook, 'sconti_applicati.xlsx');
  }

  printSconti(): void {
    const printContents = document.getElementById('print-section-admin')?.innerHTML;
    if (!printContents) return;

    const popupWin = window.open('', '_blank', 'width=800,height=600');
    if (popupWin) {
      popupWin.document.open();
      popupWin.document.write(`
        <html>
          <head>
            <title>Stampa Sconti</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                border: 1px solid #ccc;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f0f0f0;
              }
            </style>
          </head>
          <body onload="window.print(); window.close()">
            ${printContents}
          </body>
        </html>
      `);
      popupWin.document.close();
    }
  }
}
