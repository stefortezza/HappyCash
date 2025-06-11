import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Business } from 'src/interfaces/business';
import { BusinessService } from '../service/business.service';
import { environment } from 'src/environments/environment';
import { debounceTime, Subject, Subscription, finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-business',
  templateUrl: './add-business.component.html',
  styleUrls: ['./add-business.component.scss'],
})
export class AddBusinessComponent implements OnInit, OnDestroy {
  @Input() editMode = false;
  @Input() businessToEdit: Business | null = null;
  @Output() updateSuccess = new EventEmitter<Business>();

  business: Business = this.getEmptyBusiness();
  confirmPassword: string = '';
  showPassword = false;
  suggestions: any[] = [];
  isSaving: boolean = false;
  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;
  routerSubscription: any;

  constructor(
    private businessService: BusinessService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.editMode && this.businessToEdit) {
      this.business = { ...this.businessToEdit };
      this.business.password = '';
      this.confirmPassword = '';
    }

    this.searchSub = this.searchSubject
      .pipe(debounceTime(300))
      .subscribe((query) => {
        this.fetchSuggestions(query);
      });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  getEmptyBusiness(): Business {
    return {
      id: undefined,
      ragioneSociale: '',
      nomeReferente: '',
      cognomeReferente: '',
      telefono: '',
      email: '',
      partitaIva: '',
      comune: '',
      indirizzo: '',
      latitudine: 0,
      longitudine: 0,
      username: '',
      password: '',
      servizioOfferto: '',
      categoria: '',
    };
  }

  saveBusiness(): void {
    if (
      this.business.password &&
      this.business.password !== this.confirmPassword
    ) {
      alert('❌ Le password non coincidono!');
      return;
    }

    this.isSaving = true;

    if (this.editMode && this.business.id != null) {
      const updatedBusiness = { ...this.business };
      if (!updatedBusiness.password?.trim()) delete updatedBusiness.password;
      this.businessService
        .updateBusiness(updatedBusiness.id!, updatedBusiness)
        .pipe(finalize(() => (this.isSaving = false)))
        .subscribe({
          next: () => {
            alert('✅ Azienda aggiornata!');
            this.updateSuccess.emit(updatedBusiness); 
          },

          error: () => {
            alert('❌ Errore aggiornamento azienda.');
          },
        });
    } else {
      this.businessService
        .createBusiness(this.business)
        .pipe(finalize(() => (this.isSaving = false)))
        .subscribe({
          next: () => {
            alert('✅ Azienda registrata!');
            this.updateSuccess.emit();
          },
          error: () => {
            alert('❌ Errore registrazione azienda.');
          },
        });
    }
  }

  searchAddress(): void {
    const indirizzo = this.business.indirizzo?.trim() ?? '';
    const comune = this.business.comune?.trim() ?? '';

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
    if (!suggestion?.geometry?.coordinates) return;

    this.business.indirizzo = suggestion.place_name || '';
    this.business.latitudine = suggestion.geometry.coordinates[1];
    this.business.longitudine = suggestion.geometry.coordinates[0];

    const comuneContext = suggestion.context?.find((c: any) =>
      c.id.startsWith('place')
    );
    if (comuneContext) {
      this.business.comune = comuneContext.text;
    }

    this.suggestions = [];
  }
}
