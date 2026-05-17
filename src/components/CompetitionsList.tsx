import React, { useState, useEffect } from 'react';
import { Competition } from '../Types';
import { deleteCompetition, fetchCompetitions } from '../api';

interface CompetitionsListProps {
  onEdit: (competition: Competition) => void;
}

const CompetitionsList: React.FC<CompetitionsListProps> = ({ onEdit }) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'pavadinimas' | 'data' | 'vieta'>('pavadinimas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCompetitions();
        setCompetitions(data);
        setFilteredCompetitions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
  if (!confirm('Ar tikrai nori ištrinti?')) return;

  try {
    await deleteCompetition(id);

    // atnaujinam listą be refresh
    setCompetitions(prev => prev.filter(c => c.varzybu_nr !== id));
  } catch (err) {
    alert('Klaida trinant: ' + (err instanceof Error ? err.message : 'Unknown'));
  }
};

  useEffect(() => {
    let filtered = competitions.filter(comp =>
      comp.varzybu_pavadinimas.toLowerCase().includes(search.toLowerCase()) ||
      comp.varzybu_vieta.toLowerCase().includes(search.toLowerCase())
    );
    filtered.sort((a, b) => {
      if (sortBy === 'pavadinimas') return a.varzybu_pavadinimas.localeCompare(b.varzybu_pavadinimas);
      if (sortBy === 'data') return new Date(a.varzybu_data).getTime() - new Date(b.varzybu_data).getTime();
      if (sortBy === 'vieta') return a.varzybu_vieta.localeCompare(b.varzybu_vieta);
      return 0;
    });
    setFilteredCompetitions(filtered);
  }, [competitions, search, sortBy]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Varžybų sąrašas</h2>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Ieškoti pagal pavadinimą arba vietą"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="border p-2 rounded">
          <option value="pavadinimas">Rūšiuoti pagal pavadinimą</option>
          <option value="data">Rūšiuoti pagal datą</option>
          <option value="vieta">Rūšiuoti pagal vietą</option>
        </select>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Nr</th>
            <th className="py-2 px-4 border">Pavadinimas</th>
            <th className="py-2 px-4 border">Vieta</th>
            <th className="py-2 px-4 border">Data</th>
            <th className="py-2 px-4 border">Laikas</th>
            <th className="py-2 px-4 border">Veiksmas</th>
          </tr>
        </thead>
        <tbody>
          {filteredCompetitions.map(comp => (
            <tr key={comp.varzybu_nr}>
              <td className="py-2 px-4 border">{comp.varzybu_nr}</td>
              <td className="py-2 px-4 border">{comp.varzybu_pavadinimas}</td>
              <td className="py-2 px-4 border">{comp.varzybu_vieta}</td>
              <td className="py-2 px-4 border">{new Date(comp.varzybu_data).toLocaleDateString()}</td>
              <td className="py-2 px-4 border">{comp.varzybu_laikas}</td>
              <td className="py-2 px-4 border flex gap-2">
                <button
                  onClick={() => onEdit(comp)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Redaguoti
                </button>

                <button
                  onClick={() => handleDelete(comp.varzybu_nr)}
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

export default CompetitionsList;