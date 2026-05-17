export interface Athlete {
  sportininko_nr: number;
  trenerio_numeris: number;
  svoris: number;
  ugis: number;
  lytis: string;
  dirzas: string;
  sportininko_vardas: string;
  sportininko_pavarde: string;
  gimimo_data: string;
}

export interface Competition {
  varzybu_nr: number;
  varzybu_vieta: string;
  varzybu_laikas: string;
  varzybu_data: string;
  varzybu_pavadinimas: string;
}

export interface Club {
  klubo_nr: number;
  klubo_pavadinimas: string;
  klubo_miestas: string;
}

export interface Coach {
  trenerio_numeris: number;
  laipsnis: string;
  trenerio_vardas: string;
  trenerio_pavarde: string;
  klubo_nr?: number;
}

export interface Judge {
  teisejo_nr: number;
  teisejo_vardas: string;
  teisejo_pavarde: string;
}

export interface FightType {
  rusies_nr: number;
  svorio_kategorija: string;
  amziaus_kategorija: string;
  rusies_pavadinimas: string;
}

export interface Fight {
  kovos_nr: number;
  tatamio_numeris: number;
  rusies_nr: number;
  varzybu_nr: number;
}

export interface Fighter {
  varzybu_nr: number;
  dalyvio_nr: number;
  kovos_nr: number;
  kovos_rezultatas: number;
  kovos_nugaletojas: number;
}

export interface Participant {
  varzybu_nr: number;
  dalyvio_nr: number;
  klubo_nr: number;
  sportininko_nr: number;
}

export interface Role {
  role_nr: number;
  role_pavadinimas: string;
}