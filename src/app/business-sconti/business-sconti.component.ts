import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';

interface ScontoDto {
  nome: string;
  cognome: string;
  codiceFidelity: string;
  offerta: string;
  dataOra: string;
}

@Component({
  selector: 'app-business-sconti',
  templateUrl: './business-sconti.component.html',
  styleUrls: ['./business-sconti.component.scss'],
})
export class BusinessScontiComponent implements OnInit {
  sconti: ScontoDto[] = [];
  scontiFiltrati: ScontoDto[] = [];
  businessId: number | null = null;
  selectedMonth: string = '';
  dataInizio: string = '';
  dataFine: string = '';

  mesi = [
    { value: '01', label: 'Gennaio' },
    { value: '02', label: 'Febbraio' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Aprile' },
    { value: '05', label: 'Maggio' },
    { value: '06', label: 'Giugno' },
    { value: '07', label: 'Luglio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Settembre' },
    { value: '10', label: 'Ottobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Dicembre' },
  ];

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    this.businessId = paramId
      ? +paramId
      : JSON.parse(localStorage.getItem('business') || '{}')?.id;
    this.loadSconti();
  }

  loadSconti(): void {
    if (this.businessId) {
      this.http
        .get<ScontoDto[]>(
          `${environment.apiURL}api/sconti/business/${this.businessId}`
        )
        .subscribe({
          next: (data) => {
            this.sconti = data;
            this.filtraScontiPerMese();
          },
          error: () => alert('❌ Errore nel caricamento degli sconti.'),
        });
    }
  }

  filtraScontiPerMese(): void {
    if (!this.selectedMonth) {
      this.scontiFiltrati = [...this.sconti];
    } else {
      this.scontiFiltrati = this.sconti.filter((s) => {
        const mese = new Date(s.dataOra).toISOString().substring(5, 7);
        return mese === this.selectedMonth;
      });
    }
  }

  filtraScontiPerIntervallo(): void {
    if (!this.dataInizio && !this.dataFine) {
      this.scontiFiltrati = [...this.sconti];
      return;
    }

    const start = this.dataInizio
      ? new Date(this.dataInizio)
      : new Date('1970-01-01');
    const end = this.dataFine ? new Date(this.dataFine) : new Date();

    end.setDate(end.getDate() + 1);

    this.scontiFiltrati = this.sconti.filter((s) => {
      const dataSconto = new Date(s.dataOra);
      return dataSconto >= start && dataSconto < end;
    });
  }

  exportToExcel(): void {
    const datiOrdinati = this.scontiFiltrati.map((s) => ({
      Nome: s.nome,
      Cognome: s.cognome,
      'Codice Fidelity': s.codiceFidelity,
      'Data/Ora': new Date(s.dataOra).toLocaleString('it-IT'),
      Offerta: s.offerta,
    }));

    const worksheet = XLSX.utils.json_to_sheet(datiOrdinati);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sconti');

    const data = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `sconti_${data}.xlsx`);
  }

  stampaSconti(): void {
    const printContents = document.getElementById('print-section')?.innerHTML;
    if (printContents) {
      const popupWin = window.open(
        '',
        '_blank',
        'top=0,left=0,height=100%,width=auto'
      );
      if (popupWin) {
        popupWin.document.open();
        popupWin.document.write(`
        <html>
          <head>
            <title>Stampa Sconti</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #000;
                background-color: #fff;
              }
              h2 {
                font-size: 18pt;
                font-weight: bold;
                color: #000;
                margin-bottom: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #000;
                padding: 8px;
                text-align: center;
              }
              th {
                background-color: #f0f0f0;
              }
              .alert {
                margin-top: 30px;
                font-size: 16px;
                padding: 15px;
              }
              @page {
                size: A4 portrait;
                margin: 2cm;
              }
              @media print {
                nav, footer, a.btn, button, .alert, .btn-outline-dark {
                  display: none !important;
                }
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${printContents}
          </body>
        </html>
      `);
        popupWin.document.close();
      }
    }
  }
}
