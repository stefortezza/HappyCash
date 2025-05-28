import { Component, OnInit } from '@angular/core';
import { Business } from 'src/interfaces/business';
import { BusinessService } from '../service/business.service';
import { environment } from 'src/environments/environment';
import { debounceTime, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../service/user.service';
import { UserDetail } from 'src/interfaces/user-detail';
import { Register } from 'src/interfaces/register.interface';

@Component({
  selector: 'app-profilo',
  templateUrl: './profilo.component.html',
  styleUrls: ['./profilo.component.scss'],
})
export class ProfiloComponent implements OnInit {
  business: Business | null = null;
  userData: (UserDetail & { password?: string }) | null = null;
  editMode = false;
  suggestions: any[] = [];
  private searchSubject = new Subject<string>();
  isBusinessLogged = false;
  showPassword = false;
  isAdmin: boolean = false;
  confirmPassword: string = '';

  constructor(
    private businessService: BusinessService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedBusiness = localStorage.getItem('business');
    const storedUserToken = localStorage.getItem('user');

    if (storedBusiness) {
      try {
        this.business = JSON.parse(storedBusiness);
        this.isBusinessLogged = true;
      } catch (error) {
        console.error('Errore parsing business:', error);
      }
    }

    if (!this.isBusinessLogged && storedUserToken) {
      const authData = this.authService.getCurrentUser();

      const userId = Number(authData?.user?.sub);
      if (!isNaN(userId)) {
        this.userService.getUserById(userId).subscribe({
          next: (data) => {
            data;
            this.userData = data;
            this.userData.password = '';
          },
          error: (err) => {
            console.error('❌ Errore nel recupero dei dati utente:', err);
          },
        });

        this.isAdmin = authData?.user?.roles?.includes('ADMIN') ?? false;
      } else {
        console.error('❌ ID utente non valido:', authData?.user?.sub);
      }
    }

    this.searchSubject.pipe(debounceTime(300)).subscribe((query) => {
      this.fetchSuggestions(query);
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (this.editMode && this.userData) {
      this.userData.password = '';
      this.confirmPassword = '';
    }
  }

  saveChanges(): void {
    if (this.isBusinessLogged && this.business && this.business.id) {
      const updatedBusiness = { ...this.business };
      if (!updatedBusiness.password || updatedBusiness.password.trim() === '') {
        delete updatedBusiness.password;
      }
      this.businessService
        .updateBusiness(updatedBusiness.id!, updatedBusiness)
        .subscribe({
          next: (savedBusiness) => {
            alert('✅ Azienda aggiornata con successo!');
            savedBusiness.password = '';
            localStorage.setItem('business', JSON.stringify(savedBusiness));
            this.business = savedBusiness;
            this.editMode = false;
          },
          error: () => alert('❌ Errore durante aggiornamento azienda.'),
        });
    } else if (this.userData) {
      if (
        this.userData.password &&
        this.userData.password !== this.confirmPassword
      ) {
        alert('❌ Le password non corrispondono.');
        return;
      }

      const updatedUser: Register = {
        ...this.userData,
        role: this.isAdmin ? 'ADMIN' : 'USER',
      };

      if (!updatedUser.password || updatedUser.password.trim() === '') {
        delete updatedUser.password;
      }

      this.authService.updateUser(this.userData.userId, updatedUser).subscribe({
        next: () => {
          alert('✅ Dati utente aggiornati con successo!');
          this.editMode = false;
          this.confirmPassword = '';
        },
        error: () => alert('❌ Errore durante aggiornamento utente.'),
      });
    }
  }

  searchAddress(): void {
    const indirizzo = this.business?.indirizzo?.trim() || '';
    const comune = this.business?.comune?.trim() || '';

    if (indirizzo.length > 2 || comune.length > 2) {
      const query = `${indirizzo}, ${comune}`;
      this.searchSubject.next(query);
    } else {
      this.suggestions = [];
    }
  }

  fetchSuggestions(query: string): void {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${
      environment.mapboxToken
    }&autocomplete=true&language=it`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        this.suggestions = data.features || [];
      })
      .catch(() => {
        this.suggestions = [];
      });
  }

  selectAddress(suggestion: any): void {
    if (!suggestion?.geometry?.coordinates || !this.business) return;

    this.business.indirizzo =
      suggestion.text + (suggestion.address ? ', ' + suggestion.address : '');
    this.business.comune =
      suggestion.context?.find((ctx: any) => ctx.id.startsWith('place'))
        ?.text || '';
    this.business.latitudine = suggestion.geometry.coordinates[1];
    this.business.longitudine = suggestion.geometry.coordinates[0];

    this.suggestions = [];
  }
}
