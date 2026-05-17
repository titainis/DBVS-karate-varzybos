import { Athlete, Competition, Club, Coach, Judge, FightType, Fight, Fighter, Participant, Role } from './Types/index.ts'
import { formatDateForOracle } from './utils/date.ts';

// Use Vite proxy in development, direct URL in production
const API_BASE = '/api';

const beltMap: { [key: string]: string } = {
  'Bal': 'Baltas',
  'Gel': 'Geltonas',
  'Ora': 'Oranžinis',
  'Žal': 'Žalias',
  'Mėl': 'Mėlynas',
  'Rud': 'Rudas',
  'Juo': 'Juodas',

  'Baltas': 'Baltas',
  'Geltonas': 'Geltonas',
  'Oranžinis': 'Oranžinis',
  'Žalias': 'Žalias',
  'Mėlynas': 'Mėlynas',
  'Rudas': 'Rudas',
  'Juodas': 'Juodas',
};

export const getFullBeltName = (short: string): string => {
  return beltMap[short] || short;
};

const shortBeltMap: { [key: string]: string } = {
  'Baltas': 'Bal',
  'Geltonas': 'Gel',
  'Oranžinis': 'Ora',
  'Žalias': 'Žal',
  'Mėlynas': 'Mėl',
  'Rudas': 'Rud',
  'Juodas': 'Juo',
};

export const getShortBeltName = (full: string): string => {
  return shortBeltMap[full] || full;
};

export const fetchAthletes = async (): Promise<Athlete[]> => {
  const response = await fetch(`${API_BASE}/sportininkai?limit=1000`);
  if (!response.ok) throw new Error('Failed to fetch athletes');
  const data = await response.json();
  return data.items || [];
};

export const deleteAthlete = async (id: number) => {
  const response = await fetch(`${API_BASE}/sportininkai`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sportininko_nr: id,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to delete athlete");
  }

  return { success: true };
};

export const createAthlete = async (athlete: Omit<Athlete, 'sportininko_nr'>): Promise<Athlete | object> => {
  console.log("CREATE BODY:", {
  ...athlete,
  gimimo_data: formatDateForOracle(athlete.gimimo_data),
});
  const response = await fetch(`${API_BASE}/sportininkai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
  ...athlete,
  gimimo_data: formatDateForOracle(athlete.gimimo_data),
  
})
  });
  const text = await response.text();
  if (!response.ok) {
    console.error('Create athlete error:', response.status, text);
    throw new Error(text || `Failed to create athlete (${response.status})`);
  }
  return text ? JSON.parse(text) : { success: true };
};

export const updateAthlete = async (
  id: number,
  athlete: Omit<Athlete, "sportininko_nr">
) => {
  const response = await fetch(`${API_BASE}/sportininkai`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sportininko_nr: id,
      ...athlete,
      gimimo_data: athlete.gimimo_data?.slice(0, 10), 
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text);
  }

  return text ? JSON.parse(text) : { success: true };
};

export const fetchCompetitions = async (): Promise<Competition[]> => {
  const response = await fetch(`${API_BASE}/varzybos?limit=1000`);
  if (!response.ok) throw new Error('Failed to fetch competitions');
  const data = await response.json();
  return data.items || [];
};

export const createCompetition = async (competition: Omit<Competition, 'varzybu_nr'>): Promise<Competition | object> => {
  const response = await fetch(`${API_BASE}/varzybos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      varzybu_pavadinimas: competition.varzybu_pavadinimas,
      varzybu_vieta: competition.varzybu_vieta,
      varzybu_data: competition.varzybu_data?.slice(0, 10),
      varzybu_laikas: competition.varzybu_laikas,
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    console.error('Create competition error:', response.status, text);
    throw new Error(text || `Failed to create competition (${response.status})`);
  }
  return text ? JSON.parse(text) : { success: true };
};

export const updateCompetition = async (
  id: number,
  competition: Omit<Competition, 'varzybu_nr'>
): Promise<Competition> => {
  const response = await fetch(`${API_BASE}/varzybos`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      varzybu_nr: id,
      ...competition,
      varzybu_data: competition.varzybu_data?.slice(0, 10),
    }),
  });
  if (!response.ok) throw new Error('Failed to update competition');
  const data = await response.json();
  return data;
};

export const deleteCompetition = async (id: number) => {
  const response = await fetch(`${API_BASE}/varzybos`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ varzybu_nr: id }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to delete competition");
  }

  return { success: true };
};

export const fetchClubs = async (): Promise<Club[]> => {
  const response = await fetch(`${API_BASE}/klubai?limit=1000`);
  if (!response.ok) throw new Error('Failed to fetch clubs');
  const data = await response.json();
  return data.items || [];
};

export const fetchCoaches = async (): Promise<Coach[]> => {
  const response = await fetch(`${API_BASE}/treneriai?limit=1000`);
  if (!response.ok) throw new Error('Failed to fetch coaches');
  const data = await response.json();
  return data.items || [];
};

export const fetchJudges = async (): Promise<Judge[]> => {
  const response = await fetch(`${API_BASE}/teisejai?limit=1000`);
  if (!response.ok) throw new Error('Failed to fetch judges');
  const data = await response.json();
  return data.items || [];
};

export const fetchFightTypes = async (): Promise<FightType[]> => {
  const response = await fetch(`${API_BASE}/kovos-rusys?limit=1000`);
  if (!response.ok) throw new Error('Failed to fetch fight types');
  const data = await response.json();
  return data.items || [];
};

export const fetchFights = async (): Promise<Fight[]> => {
  const response = await fetch(`${API_BASE}/kovos?limit=1000`);
  if (!response.ok) throw new Error('Failed to fetch fights');
  const data = await response.json();
  return data.items || [];
};

export const fetchFightsByAthlete = async (athleteId: number): Promise<Fight[]> => {
  const response = await fetch(`${API_BASE}/kovos?sportininko_nr=${athleteId}`);
  if (!response.ok) throw new Error('Failed to fetch athlete fights');
  const data = await response.json();
  return data.items || [];
};

export const fetchFighters = async (): Promise<Fighter[]> => {
  const response = await fetch(`${API_BASE}/kovotojai?limit=1000`);
  if (!response.ok) throw new Error('Failed to fetch fighters');
  const data = await response.json();
  return data.items || [];
};

export const fetchParticipants = async (): Promise<Participant[]> => {
  const response = await fetch(`${API_BASE}/dalyviai?limit=1000`);
  if (!response.ok) throw new Error('Failed to fetch participants');
  const data = await response.json();
  return data.items || [];
};

export const fetchRoles = async (): Promise<Role[]> => {
  const response = await fetch(`${API_BASE}/roles?limit=1000`);
  if (!response.ok) throw new Error('Failed to fetch roles');
  const data = await response.json();
  return data.items || [];
};

