import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Register } from 'src/interfaces/register.interface';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  @Input() isFromModal: boolean = false;
  @Input() editMode: boolean = false;
  @Input() userToEdit?: Register;
  @Output() updateSuccess = new EventEmitter<void>();

  registerData: Register = {
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    telefono: '',
    codiceFiscale: '',
    consensoPrivacy: false,
    terminiCondizioni: false,
    marketing: false,
    role: 'USER',
    comune: '',
  };

  constructor(private authSrv: AuthService, private router: Router) {}
  ngOnInit(): void {
    if (this.editMode && this.userToEdit) {
      this.registerData = { ...this.userToEdit, password: '' };
      this.confirmPassword = '';
    }
  }

  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  normalizePhoneNumber(phone: string): string {
    return phone.replace(/\s+/g, '').trim(); // rimuove tutti gli spazi
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      const user: Register = { ...this.registerData };
      user.telefono = this.normalizePhoneNumber(user.telefono);

      if (this.editMode) {
        // se c'è password deve combaciare con conferma
        if (user.password && user.password !== this.confirmPassword) {
          alert('⚠️ Le password non corrispondono.');
          return;
        }
        // se non c'è password, rimuovila per non sovrascriverla con vuoto
        if (!user.password || user.password.trim() === '') {
          delete user.password;
        }

        this.authSrv.updateUser(user.userId!, user).subscribe({
          next: () => {
            alert('✅ Utente aggiornato con successo!');
            this.updateSuccess.emit();
          },
          error: (err) => {
            console.error('❌ Errore aggiornamento utente:', err);
            alert('⚠️ Errore durante la modifica utente.');
          },
        });
        return;
      }

      // Registrazione normale
      if (user.password !== this.confirmPassword) {
        alert('⚠️ Le password non corrispondono.');
        return;
      }

      if (!this.isFromModal) user.role = 'USER';

      this.authSrv.signUp(user).subscribe({
        next: () => {
          alert("✅ Registrazione completata! In attesa d'approvazione.");
          form.resetForm();
          this.router.navigate([this.isFromModal ? '/admin-dashboard' : '/']);
        },
        error: (error) => {
          console.error('❌ Errore durante la registrazione:', error);
          alert(
            '⚠️ ' + (error.error?.message || 'Errore durante la registrazione.')
          );
        },
      });
    } else {
      alert('⚠️ Compila tutti i campi richiesti.');
    }
  }
}
