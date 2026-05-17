import React, { useState, useEffect } from 'react';
import { Competition, Participant, Fight, Fighter, Athlete } from '../Types';
import { fetchCompetitions, fetchParticipants, fetchFights, fetchFighters, fetchAthletes } from '../api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CompetitionReport: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [fights, setFights] = useState<Fight[]>([]);
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [compData, partData, fightData, fighterData, athData] = await Promise.all([
          fetchCompetitions(),
          fetchParticipants(),
          fetchFights(),
          fetchFighters(),
          fetchAthletes(),
        ]);
        setCompetitions(compData);
        setParticipants(partData);
        setFights(fightData);
        setFighters(fighterData);
        setAthletes(athData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getCompetitionDetails = (compId: number) => {
  const comp = competitions.find(c => c.varzybu_nr === compId);

  const compParticipants = participants.filter(
    p => String(p.varzybu_nr) === String(compId)
  );

  const compFights = fights.filter(
    f => String(f.varzybu_nr) === String(compId)
  );

  const compFighters = fighters.filter(
    fi => String(fi.varzybu_nr) === String(compId)
  );

  return { comp, compParticipants, compFights, compFighters };
};

  const exportToPDF = async () => {
    if (!selectedCompetition) return;
    const element = document.getElementById('report-content');
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('competition-report.pdf');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const { comp, compParticipants, compFights, compFighters } = selectedCompetition ? getCompetitionDetails(selectedCompetition) : { comp: null, compParticipants: [], compFights: [], compFighters: [] };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Varžybų ataskaita</h2>
      <div className="mb-4">
        <label className="block">Pasirinkti varžybas</label>
        <select
          value={selectedCompetition || ''}
          onChange={(e) => setSelectedCompetition(Number(e.target.value) || null)}
          className="border p-2 rounded"
        >
          <option value="">Pasirinkti</option>
          {competitions.map(c => (
            <option key={c.varzybu_nr} value={c.varzybu_nr}>{c.varzybu_pavadinimas}</option>
          ))}
        </select>
      </div>
      {selectedCompetition && comp && (
        <div id="report-content" className="bg-white p-4 border rounded">
          <h3 className="text-xl font-bold mb-2">{comp.varzybu_pavadinimas}</h3>
          <p>Vieta: {comp.varzybu_vieta}</p>
          <p>Data: {new Date(comp.varzybu_data).toLocaleDateString()}</p>
          <p>Laikas: {comp.varzybu_laikas}</p>
          <h4 className="text-lg font-bold mt-4">Dalyviai</h4>
          <ul>
            {compParticipants.map(p => {
              const athlete = athletes.find(
                a => String(a.sportininko_nr) === String(p.sportininko_nr)
              );

              return (
                <li key={p.dalyvio_nr}>
                  {athlete
                    ? `${athlete.sportininko_vardas} ${athlete.sportininko_pavarde}`
                    : 'N/A'}
                </li>
              );
            })}
          </ul>
          <h4 className="text-lg font-bold mt-4">Kovos</h4>
          <ul>
  {compFights.map(f => {
    const fightFighters = compFighters.filter(
      fi =>
        String(fi.kovos_nr) === String(f.kovos_nr) &&
        String(fi.varzybu_nr) === String(f.varzybu_nr)
    );

    const fighter1 = fightFighters[0];
    const fighter2 = fightFighters[1];

    const getAthlete = (fighter?: Fighter) => {
      if (!fighter) return null;

      const participant = compParticipants.find(
        p =>
          String(p.dalyvio_nr) === String(fighter.dalyvio_nr) &&
          String(p.varzybu_nr) === String(fighter.varzybu_nr)
      );

      if (!participant) return null;

      return athletes.find(
        a =>
          String(a.sportininko_nr) ===
          String(participant.sportininko_nr)
      );
    };

    const athlete1 = getAthlete(fighter1);
    const athlete2 = getAthlete(fighter2);

    const winner =
      fighter1?.kovos_nugaletojas === 1
        ? athlete1
        : fighter2?.kovos_nugaletojas === 1
        ? athlete2
        : null;

    return (
      <li key={f.kovos_nr}>
        {athlete1
          ? `${athlete1.sportininko_vardas} ${athlete1.sportininko_pavarde}`
          : 'N/A'}{" "}
        ({fighter1?.kovos_rezultatas || 0}) vs{" "}
        {athlete2
          ? `${athlete2.sportininko_vardas} ${athlete2.sportininko_pavarde}`
          : 'N/A'}{" "}
        ({fighter2?.kovos_rezultatas || 0}) - Laimėtojas:{" "}
        {winner
          ? `${winner.sportininko_vardas} ${winner.sportininko_pavarde}`
          : 'N/A'}
      </li>
    );
  })}
</ul>
        </div>
      )}
      {selectedCompetition && (
        <button onClick={exportToPDF} className="mt-4 bg-green-500 text-white p-2 rounded">
          Eksportuoti į PDF
        </button>
      )}
    </div>
  );
};

export default CompetitionReport;
