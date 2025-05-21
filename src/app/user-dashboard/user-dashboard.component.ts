import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { FidelityCardService } from '../service/fidelity-card.service';
import { FidelityCard } from 'src/interfaces/fidelity-card';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  fidelityCard: FidelityCard | null = null;

  constructor(
    private authService: AuthService,
    private cardService: FidelityCardService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(authData => {
      if (!authData?.user?.sub) return;
      const userId = +authData.user.sub;

      this.cardService.getCardByUserId(userId).subscribe({
        next: (card) => this.fidelityCard = card,
        error: (err) => console.error('Errore nel recupero della fidelity card:', err)
      });
    });
  }
}
