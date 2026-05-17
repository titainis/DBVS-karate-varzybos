import React, { useState, useEffect } from 'react';
import { Athlete, Coach, Fighter, Participant } from '../Types/index';
import { deleteAthlete, fetchAthletes, fetchCoaches, fetchFighters, fetchParticipants, getFullBeltName } from '../api';

interface AthletesListProps {
  onEdit: (athlete: Athlete) => void;
  onViewFights: (athleteId: number) => void;
}

const AthletesList: React.FC<AthletesListProps> = ({ onEdit, onViewFights }) => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'vardas' | 'pavarde' | 'svoris'>('vardas');
  const [filterFights, setFilterFights] = useState<'all' | 'hasFights' | 'noFights'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [athletesData, coachesData, fightersData, participantsData] = await Promise.all([
          fetchAthletes(), 
          fetchCoaches(),
          fetchFighters(),
          fetchParticipants()
        ]);
        setAthletes(athletesData);
        setCoaches(coachesData);
        setFighters(fightersData);
        setParticipants(participantsData);
        setFilteredAthletes(athletesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = athletes.filter(athlete => {
      // Search filter
      const matchesSearch = 
        athlete.sportininko_vardas.toLowerCase().includes(search.toLowerCase()) ||
        athlete.sportininko_pavarde.toLowerCase().includes(search.toLowerCase());
      
      // Fights filter
      const athleteHasFights = hasFights(athlete.sportininko_nr);
      const matchesFights = 
        filterFights === 'all' || 
        (filterFights === 'hasFights' && athleteHasFights) ||
        (filterFights === 'noFights' && !athleteHasFights);
      
      return matchesSearch && matchesFights;
    });
    filtered.sort((a, b) => {
      if (sortBy === 'vardas') return a.sportininko_vardas.localeCompare(b.sportininko_vardas);
      if (sortBy === 'pavarde') return a.sportininko_pavarde.localeCompare(b.sportininko_pavarde);
      if (sortBy === 'svoris') return a.svoris - b.svoris;
      return 0;
    });
    setFilteredAthletes(filtered);
  }, [athletes, search, sortBy, filterFights, fighters, participants]);

  const getCoachName = (trenerioNr: number) => {
    if (trenerioNr === 0) return 'Neturi trenerio';
    const coach = coaches.find(c => c.trenerio_numeris === trenerioNr);
    return coach ? `${coach.trenerio_vardas} ${coach.trenerio_pavarde}` : 'Neturi trenerio';
  };
  

  // Check if athlete has any fights
  const hasFights = (athleteId: number) => {
    // Try to find participant by sportininko_nr
    const participant = participants.find(p => p.sportininko_nr === athleteId);
    if (participant) {
      // Check if this participant has any fights
      return fighters.some(f => f.dalyvio_nr === participant.dalyvio_nr);
    }
    // Also try direct match (kovotojai might use sportininko_nr directly)
    return fighters.some(f => f.dalyvio_nr === athleteId);
  };

  const handleDelete = async (id: number) => {
  if (!confirm('Ar tikrai nori ištrinti sportininką?')) return;

  try {
    await deleteAthlete(id);

    // iškart pašalinam iš UI
    setAthletes(prev => prev.filter(a => a.sportininko_nr !== id));
  } catch (err) {
    alert('Klaida trinant: ' + (err instanceof Error ? err.message : 'Unknown'));
  }
};

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Sportininkų sąrašas</h2>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Ieškoti pagal vardą arba pavardę"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="border p-2 rounded">
          <option value="vardas">Rūšiuoti pagal vardą</option>
          <option value="pavarde">Rūšiuoti pagal pavardę</option>
          <option value="svoris">Rūšiuoti pagal svorį</option>
        </select>
        <select value={filterFights} onChange={(e) => setFilterFights(e.target.value as any)} className="border p-2 rounded">
          <option value="all">Sportininkų kovos</option>
          <option value="hasFights">Turi kovų</option>
          <option value="noFights">Neturi kovų</option>
        </select>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Vardas</th>
            <th className="py-2 px-4 border">Pavardė</th>
            <th className="py-2 px-4 border">Svoris</th>
            <th className="py-2 px-4 border">Ūgis</th>
            <th className="py-2 px-4 border">Lytis</th>
            <th className="py-2 px-4 border">Diržas</th>
            <th className="py-2 px-4 border">Treneris</th>
            <th className="py-2 px-4 border">Veiksmas</th>
          </tr>
        </thead>
        <tbody>
          {filteredAthletes.map(athlete => (
            <tr key={athlete.sportininko_nr}>
              <td className="py-2 px-4 border">{athlete.sportininko_vardas}</td>
              <td className="py-2 px-4 border">{athlete.sportininko_pavarde}</td>
              <td className="py-2 px-4 border">{athlete.svoris} kg</td>
              <td className="py-2 px-4 border">{athlete.ugis} cm</td>
              <td className="py-2 px-4 border">{athlete.lytis}</td>
              <td className="py-2 px-4 border">{getFullBeltName(athlete.dirzas)}</td>
              <td className="py-2 px-4 border">{getCoachName(athlete.trenerio_numeris)}</td>
              <td className="py-2 px-4 border ">
                {hasFights(athlete.sportininko_nr) && (
                  <button
                    onClick={() => onViewFights(athlete.sportininko_nr)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Kovos
                  </button>
                )}
                <button
                  onClick={() => onEdit(athlete)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Redaguoti
                </button>

                <button
                  onClick={() => handleDelete(athlete.sportininko_nr)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Ištrinti
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AthletesList;