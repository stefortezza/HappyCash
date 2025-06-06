export interface Business {
  id?: number;
  ragioneSociale: string;
  nomeReferente: string;
  cognomeReferente: string;
  telefono: string;
  email: string;
  partitaIva: string;
  indirizzo: string;
  comune: string; 
  latitudine?: number;
  longitudine?: number;
  username: string;
  password?: string;
  servizioOfferto?: string;
  categoria:string;
}

