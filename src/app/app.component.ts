import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private authService: AuthService) {}

  isLoggedIn(): boolean {
    const user = localStorage.getItem('user');
    const business = localStorage.getItem('business');
    return !!user || !!business; 
  }
}
