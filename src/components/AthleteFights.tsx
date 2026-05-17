import React, { useState, useEffect } from 'react';
import { Fight, Fighter, Athlete, Competition, FightType, Participant } from '../Types';
import { fetchFights, fetchFighters, fetchAthletes, fetchCompetitions, fetchFightTypes, fetchParticipants } from '../api';

interface AthleteFightsProps {
  athleteId: number;
  onBack: () => void;
}

interface FightInfo {
  kovos_nr: number;
  varzybu_nr: number;
  tatamio_numeris: number;
  fightType: FightType | null;
  opponent: Athlete | null;
  myResult: number;
  opponentResult: number;
  isWinner: boolean;
}

const AthleteFights: React.FC<AthleteFightsProps> = ({ athleteId, onBack }) => {
  const [fights, setFights] = useState<Fight[]>([]);
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [fightTypes, setFightTypes] = useState<FightType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'past' | 'upcoming'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fightsData, fightersData, participantsData, athletesData, competitionsData, fightTypesData] = await Promise.all([
          fetchFights(),
          fetchFighters(),
          fetchParticipants(),
          fetchAthletes(),
          fetchCompetitions(),
          fetchFightTypes()
        ]);
        
        setFights(fightsData);
        setFighters(fightersData);
        setParticipants(participantsData);
        setAthletes(athletesData);
        setCompetitions(competitionsData);
        setFightTypes(fightTypesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [athleteId]);

  // Get participant for this athlete - try both approaches:
  // 1. Find by sportininko_nr in participants table
  // 2. kovotojai.dalyvio_nr might be either dalyvio_nr or sportininko_nr
  const myParticipant = participants.find(p => p.sportininko_nr === athleteId);
  
  // Get fights where this athlete participated
  // Try both: using participant dalyvio_nr OR using athleteId directly (if kovotojai uses sportininko_nr)
  const myFights = fights.filter(fight => 
    fighters.some(f => 
      (f.dalyvio_nr === myParticipant?.dalyvio_nr || f.dalyvio_nr === athleteId) && 
      f.kovos_nr === fight.kovos_nr && 
      f.varzybu_nr === fight.varzybu_nr
    )
  );

  // Build fight info
  const buildFightInfo = (): FightInfo[] => {
    return myFights.map(fight => {
      // Find fighters in this fight
      const fightFighters = fighters.filter(f => 
        f.kovos_nr === fight.kovos_nr && f.varzybu_nr === fight.varzybu_nr
      );

      // Find my fighter and opponent - try both approaches
      const myFighter = fightFighters.find(f => 
        f.dalyvio_nr === myParticipant?.dalyvio_nr || f.dalyvio_nr === athleteId
      );
      const opponentFighter = fightFighters.find(f => 
        f.dalyvio_nr !== myParticipant?.dalyvio_nr && f.dalyvio_nr !== athleteId
      );

      // Get opponent's athlete info
      let opponent: Athlete | null = null;
      if (opponentFighter) {
        // Try to find by participant first, then by athlete directly
        const opponentParticipant = participants.find(p => p.dalyvio_nr === opponentFighter.dalyvio_nr);
        if (opponentParticipant) {
          opponent = athletes.find(a => a.sportininko_nr === opponentParticipant.sportininko_nr) || null;
        }
        // If not found via participants, try direct match (kovotojai might use sportininko_nr)
        if (!opponent) {
          opponent = athletes.find(a => a.sportininko_nr === opponentFighter.dalyvio_nr) || null;
        }
      }

      return {
        kovos_nr: fight.kovos_nr,
        varzybu_nr: fight.varzybu_nr,
        tatamio_numeris: fight.tatamio_numeris,
        fightType: fightTypes.find(ft => ft.rusies_nr === fight.rusies_nr) || null,
        opponent,
        myResult: myFighter?.kovos_rezultatas || 0,
        opponentResult: opponentFighter?.kovos_rezultatas || 0,
        isWinner: myFighter?.kovos_nugaletojas === 1
      };
    });
  };

  const fightInfos = buildFightInfo();

  const getCompetitionName = (varzybuNr: number) => {
    const comp = competitions.find(c => c.varzybu_nr === varzybuNr);
    return comp ? comp.varzybu_pavadinimas : 'Nežinomos';
  };

  const getCompetitionDate = (varzybuNr: number) => {
    const comp = competitions.find(c => c.varzybu_nr === varzybuNr);
    return comp ? new Date(comp.varzybu_data) : null;
  };

  const filteredFights = fightInfos.filter(fightInfo => {
    const compDate = getCompetitionDate(fightInfo.varzybu_nr);
    if (!compDate) return filter === 'all';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filter === 'past') return compDate < today;
    if (filter === 'upcoming') return compDate >= today;
    return true;
  });

  if (loading) return <div>Kraunama...</div>;
  if (error) return <div>Klaida: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Sportininko kovos</h2>
        <button onClick={onBack} className="bg-gray-500 text-white px-4 py-2 rounded">
          Grįžti
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Visos
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded ${filter === 'past' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Praėjusios
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded ${filter === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Ateinančios
        </button>
      </div>

      {filteredFights.length === 0 ? (
        <p className="text-gray-500">Šis sportininkas neturi kovų.</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Varžybos</th>
              <th className="py-2 px-4 border">Data</th>
              <th className="py-2 px-4 border">Vieta</th>
              <th className="py-2 px-4 border"> Kategorija</th>
              <th className="py-2 px-4 border">Priešininkas</th>
              <th className="py-2 px-4 border">Taškai</th>
              <th className="py-2 px-4 border">Rezultatas</th>
            </tr>
          </thead>
          <tbody>
            {filteredFights.map(fightInfo => {
              const comp = competitions.find(c => c.varzybu_nr === fightInfo.varzybu_nr);
              
              return (
                <tr key={fightInfo.kovos_nr}>
                  <td className="py-2 px-4 border">{getCompetitionName(fightInfo.varzybu_nr)}</td>
                  <td className="py-2 px-4 border">
                    {comp ? new Date(comp.varzybu_data).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-2 px-4 border">{comp?.varzybu_vieta || '-'}</td>
                  <td className="py-2 px-4 border">
                    {fightInfo.fightType 
                      ? `${fightInfo.fightType.rusies_pavadinimas || '-'} (${fightInfo.fightType.amziaus_kategorija + "m" || '-'}, ${fightInfo.fightType.svorio_kategorija || '-'})`
                      : '-'}
                  </td>
                  <td className="py-2 px-4 border">
                    {fightInfo.opponent 
                      ? `${fightInfo.opponent.sportininko_vardas} ${fightInfo.opponent.sportininko_pavarde}`
                      : 'Nežinomas'}
                  </td>
                  <td className="py-2 px-4 border">
                    {fightInfo.myResult} - {fightInfo.opponentResult}
                  </td>
                  <td className="py-2 px-4 border">
                    {fightInfo.isWinner ? (
                      <span className="text-green-600 font-bold">Laimėjo</span>
                    ) : (
                      <span className="text-red-600">Pralaimėjo</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AthleteFights;