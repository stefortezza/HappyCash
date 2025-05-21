import { Component } from '@angular/core';
import { NotificationService } from '../service/notification.service';
import { UserService } from '../service/user.service';
import { UserDetail } from 'src/interfaces/user-detail';

@Component({
  selector: 'app-send-notification',
  templateUrl: './send-notification.component.html',
  styleUrls: ['./send-notification.component.scss']
})
export class SendNotificationComponent {
  subject: string = '';
  message: string = '';
  comuni: string[] = [];
  allComuni: string[] = [];
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private notificationService: NotificationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.fetchComuni();
  }

  fetchComuni(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: UserDetail[]) => {
        const comuniSet = new Set(users.map(u => u.comune).filter(c => c));
        this.allComuni = Array.from(comuniSet).sort();
      },
      error: (err) => {
        console.error('Errore nel recupero dei comuni:', err);
      }
    });
  }

  sendNotification(): void {
    if (!this.subject || !this.message || this.comuni.length === 0) {
      this.errorMessage = 'Compila tutti i campi e seleziona almeno un comune.';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.notificationService.sendBroadcastToComuni(this.comuni, this.subject, this.message).subscribe({
      next: () => {
        this.successMessage = '✅ Notifica inviata con successo!';
        this.errorMessage = '';
        this.subject = '';
        this.message = '';
        this.comuni = [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.successMessage = '';
        this.errorMessage = "❌ Errore durante l'invio della notifica.";
        this.loading = false;
      },
    });
  }

  toggleComune(comune: string): void {
  const index = this.comuni.indexOf(comune);
  if (index >= 0) {
    this.comuni.splice(index, 1);
  } else {
    this.comuni.push(comune);
  }
}

}
