import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';

declare const bootstrap: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;
  isAdmin: boolean = false;
  isBusiness: boolean = false;

  showRegisterComponentFromModal: boolean = false;

  constructor(private authSrv: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkRoles();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkRoles(); // Ricalcola i ruoli dopo ogni navigazione
      }
    });
  }

  checkRoles(): void {
    const userToken = localStorage.getItem('user');
    const businessData = localStorage.getItem('business');

    this.isBusiness = !!businessData;
    this.isAuthenticated = this.authSrv.isLoggedIn() || this.isBusiness;
    this.isAdmin = this.authSrv.isAdmin();
  }

  navigateByRole(): void {
    if (this.isAdmin) {
      window.location.href = '/admin-dashboard';
    } else if (this.isBusiness) {
      window.location.href = '/business-dashboard'; 
    } else {
      window.location.href = '/user-dashboard';
    }
  }

  openRegisterModal(): void {
    const modalElement = document.getElementById('adminRegisterModal');
    if (modalElement) {
      this.showRegisterComponentFromModal = true;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('business');
    window.location.href = '/';
  }
}
