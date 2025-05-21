import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BusinessService } from '../service/business.service';
import { Business } from 'src/interfaces/business';
import { environment } from 'src/environments/environment';
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-aziende-convenzionate',
  templateUrl: './aziende-convenzionate.component.html',
  styleUrls: ['./aziende-convenzionate.component.scss'],
})
export class AziendeConvenzionateComponent implements OnInit, AfterViewInit {
  businesses: Business[] = [];
  searchTerm: string = '';
  showList = true;
  map!: mapboxgl.Map;
  searchedComune: string = '';

  constructor(private businessService: BusinessService) {}

  ngOnInit(): void {
    this.businessService.getAllBusinesses().subscribe({
      next: (data) => {
        this.businesses = data;
        if (!this.showList) {
          setTimeout(() => this.initMap(), 0);
        }
      },
      error: (err) => console.error('Errore nel caricamento aziende:', err),
    });
  }

  ngAfterViewInit(): void {
    if (!this.showList) {
      this.initMap();
    }
  }

  filteredBusinesses(): Business[] {
    return this.businesses.filter((b) =>
      b.comune?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }


  toggleView(show: boolean): void {
    this.showList = show;
    if (!show) {
      setTimeout(() => this.initMap(), 0);
    }
  }

  initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    mapboxgl.accessToken = environment.mapboxToken;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [12.4964, 41.9028],
      zoom: 5,
    });

    let firstClickDone = false;

    this.map.on('load', () => {
      this.businesses.forEach((b) => {
        if (b.latitudine && b.longitudine) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <strong>${b.ragioneSociale}</strong><br>
               <strong>🏪 ${b.categoria}</strong><br>
              🏙️ ${b.comune}<br>
              🏠${b.indirizzo}<br>
              <strong>${b.servizioOfferto}</strong><br>

            `);
          const marker = new mapboxgl.Marker()
            .setLngLat([b.longitudine, b.latitudine])
            .setPopup(popup)
            .addTo(this.map);

          marker.getElement().addEventListener('click', () => {
            this.map.flyTo({
              center: [b.longitudine!, b.latitudine!],
              zoom: 17,
              essential: true,
            });

            if (firstClickDone) {
              popup.addTo(this.map);
            } else {
              firstClickDone = true;
            }
          });
        }
      });
    });
  }

  zoomToComune(): void {
    if (!this.searchedComune) return;

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        this.searchedComune
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          this.map.flyTo({ center: [lon, lat], zoom: 11 });
        } else {
          alert('❌ Comune non trovato!');
        }
      })
      .catch((err) =>
        console.error('Errore durante la ricerca del comune:', err)
      );
  }
}
