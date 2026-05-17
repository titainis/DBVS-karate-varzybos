import React, { useState } from 'react';
import { Competition } from '../Types';

interface CompetitionFormProps {
  competition?: Competition;
  onSave: (competition: Omit<Competition, 'varzybu_nr'>, id?: number) => void;
  onCancel: () => void;
}

const CompetitionForm: React.FC<CompetitionFormProps> = ({ competition, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Competition, 'varzybu_nr'>>({
    varzybu_pavadinimas: competition?.varzybu_pavadinimas || '',
    varzybu_vieta: competition?.varzybu_vieta || '',
    varzybu_data: competition?.varzybu_data ? competition.varzybu_data.slice(0, 10) : '',
    varzybu_laikas: competition?.varzybu_laikas || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Sending competition data:', JSON.stringify(formData, null, 2));
      await onSave(formData, competition?.varzybu_nr);
      alert('Varžybos išsaugotos sėkmingai!');
    } catch (err) {
      console.error('Save competition error:', err);
      alert('Klaida išsaugant varžybas: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        {competition ? 'Redaguoti varžybas' : 'Naujos varžybos'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Pavadinimas:</label>
          <input
            type="text"
            value={formData.varzybu_pavadinimas}
            onChange={(e) => setFormData({ ...formData, varzybu_pavadinimas: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Vieta:</label>
          <input
            type="text"
            value={formData.varzybu_vieta}
            onChange={(e) => setFormData({ ...formData, varzybu_vieta: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Data:</label>
          <input
            type="date"
            value={formData.varzybu_data}
            onChange={(e) => setFormData({ ...formData, varzybu_data: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Laikas:</label>
          <input
            type="time"
            value={formData.varzybu_laikas}
            onChange={(e) => setFormData({ ...formData, varzybu_laikas: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Išsaugoti
          </button>
          <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">
            Atšaukti
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompetitionForm;