import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BusinessService } from '../service/business.service';
import { Business } from 'src/interfaces/business';

import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-mappa-aziende',
  templateUrl: './mappa-aziende.component.html',
  styleUrls: ['./mappa-aziende.component.scss'],
})
export class MappaAziendeComponent implements OnInit {
  map!: mapboxgl.Map;
  businesses: Business[] = [];

  constructor(private businessService: BusinessService) {
    (mapboxgl as any).accessToken = environment.mapboxToken;
  }

  ngOnInit(): void {
    this.initMap();

    this.businessService.getAllBusinesses().subscribe((data) => {
      this.businesses = data;
      this.addMarkers();
    });
  }

  private initMap(): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [12.4964, 41.9028],
      zoom: 5.5,
    });

    this.map.addControl(new mapboxgl.NavigationControl());
  }

  private addMarkers(): void {
    this.businesses.forEach((b) => {
      if (b.latitudine && b.longitudine) {
        const marker = new mapboxgl.Marker()
          .setLngLat([b.longitudine, b.latitudine])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
              <strong> ${b.ragioneSociale}</strong><br>
               🏪${b.categoria}<br>
              🏙️ ${b.comune}<br>
              🏠 ${b.indirizzo}<br>
              <strong>${b.servizioOfferto}</strong><br>
            `)
          )
          .addTo(this.map);
      }
    });
  }
}
