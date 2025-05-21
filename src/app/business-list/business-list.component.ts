import { Component, OnInit } from '@angular/core';
import { BusinessService } from '../service/business.service';
import { Business } from 'src/interfaces/business';

@Component({
  selector: 'app-business-list',
  templateUrl: './business-list.component.html',
  styleUrls: ['./business-list.component.scss']
})
export class BusinessListComponent implements OnInit {
  businesses: Business[] = [];

  constructor(private businessService: BusinessService) {}

  ngOnInit(): void {
    this.loadBusinesses();
  }

  loadBusinesses(): void {
    this.businessService.getAllBusinesses().subscribe(businesses => this.businesses = businesses);
  }
}
