import React, { useState, useEffect } from 'react';
import { Athlete, Coach } from '../Types';
import { fetchCoaches, getFullBeltName, getShortBeltName } from '../api';
import { formatDateForInput } from '../utils/date';

interface AthleteFormProps {
  athlete?: Athlete;
  onSave: (athlete: Omit<Athlete, 'sportininko_nr'>, id?: number) => void;
  onCancel: () => void;
}

const AthleteForm: React.FC<AthleteFormProps> = ({ athlete, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Athlete, 'sportininko_nr'>>({
    trenerio_numeris: athlete?.trenerio_numeris || 0,
    svoris: athlete?.svoris || 0,
    ugis: athlete?.ugis || 0,
    lytis: athlete?.lytis || '',
    dirzas: athlete ? getFullBeltName(athlete.dirzas) : '',
    sportininko_vardas: athlete?.sportininko_vardas || '',
    sportininko_pavarde: athlete?.sportininko_pavarde || '',
    gimimo_data: athlete?.gimimo_data || '',
  });
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const beltOptions = ['Baltas', 'Geltonas', 'Oranžinis', 'Žalias', 'Mėlynas', 'Rudas', 'Juodas'];

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const data = await fetchCoaches();
        setCoaches(data);
      } catch (err) {
        console.error('Failed to load coaches', err);
      }
    };
    loadCoaches();
  }, []);

  useEffect(() => {
    setFormData({
      trenerio_numeris: athlete?.trenerio_numeris || 0,
      svoris: athlete?.svoris || 0,
      ugis: athlete?.ugis || 0,
      lytis: athlete?.lytis || '',
      dirzas: athlete ? getFullBeltName(athlete.dirzas) : '',
      sportininko_vardas: athlete?.sportininko_vardas || '',
      sportininko_pavarde: athlete?.sportininko_pavarde || '',
      gimimo_data: formatDateForInput(athlete?.gimimo_data || ''),
    });
  }, [athlete]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.sportininko_vardas) newErrors.sportininko_vardas = 'Vardas yra privalomas';
    if (!formData.sportininko_pavarde) newErrors.sportininko_pavarde = 'Pavardė yra privaloma';
    if (formData.svoris <= 0) newErrors.svoris = 'Svoris turi būti didesnis nei 0';
    if (formData.ugis <= 0) newErrors.ugis = 'Ūgis turi būti didesnis nei 0';
    if (!formData.lytis) newErrors.lytis = 'Lytis yra privaloma';
    if (!formData.dirzas) newErrors.dirzas = 'Diržas yra privalomas';
    if (!formData.gimimo_data) newErrors.gimimo_data = 'Gimimo data yra privaloma';
    if (formData.trenerio_numeris === 0) newErrors.trenerio_numeris = 'Treneris yra privalomas';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Format the data properly for Oracle REST API
      const dataToSave = {
        sportininko_vardas: formData.sportininko_vardas,
        sportininko_pavarde: formData.sportininko_pavarde,
        svoris: Number(formData.svoris),
        ugis: Number(formData.ugis),
        lytis: formData.lytis,
        dirzas: getShortBeltName(formData.dirzas),
        gimimo_data: formData.gimimo_data, // YYYY-MM-DD format
        trenerio_numeris: Number(formData.trenerio_numeris),
      };
      console.log('Sending data:', JSON.stringify(dataToSave, null, 2));
      await onSave(dataToSave, athlete?.sportininko_nr);
      alert('Sportininkas išsaugotas sėkmingai!');
      onCancel();
    } catch (err) {
      console.error('Save error:', err);
      alert('Klaida išsaugant sportininką: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'svoris' || name === 'ugis' || name === 'trenerio_numeris') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border rounded shadow">
      <h3 className="text-xl font-bold mb-4">{athlete ? 'Redaguoti sportininką' : 'Naujas sportininkas'}</h3>
      <div className="mb-4">
        <label className="block">Vardas</label>
        <input
          type="text"
          name="sportininko_vardas"
          value={formData.sportininko_vardas}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        {errors.sportininko_vardas && <p className="text-red-500">{errors.sportininko_vardas}</p>}
      </div>
      <div className="mb-4">
        <label className="block">Pavardė</label>
        <input
          type="text"
          name="sportininko_pavarde"
          value={formData.sportininko_pavarde}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        {errors.sportininko_pavarde && <p className="text-red-500">{errors.sportininko_pavarde}</p>}
      </div>
      <div className="mb-4">
        <label className="block">Svoris (kg)</label>
        <input
          type="number"
          name="svoris"
          value={formData.svoris}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        {errors.svoris && <p className="text-red-500">{errors.svoris}</p>}
      </div>
      <div className="mb-4">
        <label className="block">Ūgis (cm)</label>
        <input
          type="number"
          name="ugis"
          value={formData.ugis}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        {errors.ugis && <p className="text-red-500">{errors.ugis}</p>}
      </div>
      <div className="mb-4">
        <label className="block">Lytis</label>
        <select
          name="lytis"
          value={formData.lytis}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="">Pasirinkti</option>
          <option value="V">Vyras</option>
          <option value="M">Moteris</option>
        </select>
        {errors.lytis && <p className="text-red-500">{errors.lytis}</p>}
      </div>
      <div className="mb-4">
        <label className="block">Diržas</label>
        <select
          name="dirzas"
          value={formData.dirzas}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="">Pasirinkti</option>
          {beltOptions.map(belt => (
            <option key={belt} value={belt}>{belt}</option>
          ))}
        </select>
        {errors.dirzas && <p className="text-red-500">{errors.dirzas}</p>}
      </div>
      <div className="mb-4">
        <label className="block">Gimimo data</label>
        <input
          type="date"
          name="gimimo_data"
          value={formData.gimimo_data}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        {errors.gimimo_data && <p className="text-red-500">{errors.gimimo_data}</p>}
      </div>
      <div className="mb-4">
        <label className="block">Treneris</label>
        <select
          name="trenerio_numeris"
          value={String(formData.trenerio_numeris)}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="0">Pasirinkti</option>
          {coaches.map(coach => (
            <option key={coach.trenerio_numeris} value={String(coach.trenerio_numeris)}>
              {coach.trenerio_vardas} {coach.trenerio_pavarde}
            </option>
          ))}
        </select>
        {errors.trenerio_numeris && <p className="text-red-500">{errors.trenerio_numeris}</p>}
      </div>
      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 rounded">
          {loading ? 'Saugoma...' : 'Išsaugoti'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-500 text-white p-2 rounded">
          Atšaukti
        </button>
      </div>
    </form>
  );
};

export default AthleteForm;