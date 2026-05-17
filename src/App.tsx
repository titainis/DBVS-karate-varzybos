import { useState } from 'react';
import Header from './components/Header/Header';
import AthletesList from './components/AthletesList';
import CompetitionsList from './components/CompetitionsList';
import AthleteForm from './components/AthleteForm';
import AthleteFights from './components/AthleteFights';
import CompetitionForm from './components/CompetitionForm';
import CompetitionReport from './components/CompetitionReport';
import { updateAthlete, createAthlete, createCompetition, updateCompetition } from './api';
import { Athlete, Competition } from './Types';

function App() {
  const [currentView, setCurrentView] = useState<'athletes' | 'competitions' | 'form' | 'competitionForm' | 'report' | 'athleteFights'>('athletes');
  const [editingAthlete, setEditingAthlete] = useState<Athlete | undefined>();
  const [editingCompetition, setEditingCompetition] = useState<Competition | undefined>();
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | undefined>();

  const handleSaveAthlete = async (athlete: Omit<Athlete, 'sportininko_nr'>, id?: number) => {
    if (id) {
      // Update existing athlete
      await updateAthlete(id, athlete);
    } else {
      // Create new athlete
      await createAthlete(athlete);
    }
    setCurrentView('athletes');
  };

  const handleSaveCompetition = async (competition: Omit<Competition, 'varzybu_nr'>, id?: number) => {
    if (id) {
      await updateCompetition(id, competition);
    } else {
      await createCompetition(competition);
    }
    setCurrentView('competitions');
    setEditingCompetition(undefined);
  };

  return (
    <div className="App">
      <Header />
      <nav className="bg-gray-200 p-4">
        <button onClick={() => setCurrentView('athletes')} className="mr-4 p-2 bg-blue-500 text-white rounded">Sportininkai</button>
        <button onClick={() => setCurrentView('competitions')} className="mr-4 p-2 bg-blue-500 text-white rounded">Varžybos</button>
        <button onClick={() => { setEditingAthlete(undefined); setCurrentView('form'); }} className="mr-4 p-2 bg-green-500 text-white rounded">Naujas sportininkas</button>
        <button onClick={() => { setEditingCompetition(undefined); setCurrentView('competitionForm'); }} className="mr-4 p-2 bg-green-500 text-white rounded">Naujos varžybos</button>
        <button onClick={() => setCurrentView('report')} className="p-2 bg-purple-500 text-white rounded">Ataskaita</button>
      </nav>
      {currentView === 'athletes' && <AthletesList onEdit={(athlete) => { setEditingAthlete(athlete); setCurrentView('form'); }} onViewFights={(id) => { setSelectedAthleteId(id); setCurrentView('athleteFights'); }} />}
      {currentView === 'competitions' && <CompetitionsList onEdit={(competition) => { setEditingCompetition(competition); setCurrentView('competitionForm'); }} />}
      {currentView === 'form' && (
        <AthleteForm
          athlete={editingAthlete}
          onSave={handleSaveAthlete}
          onCancel={() => setCurrentView('athletes')}
        />
      )}
      {currentView === 'competitionForm' && (
        <CompetitionForm
          competition={editingCompetition}
          onSave={handleSaveCompetition}
          onCancel={() => { setCurrentView('competitions'); setEditingCompetition(undefined); }}
        />
      )}
      {currentView === 'athleteFights' && selectedAthleteId && (
        <AthleteFights athleteId={selectedAthleteId} onBack={() => setCurrentView('athletes')} />
      )}
      {currentView === 'report' && <CompetitionReport />}
    </div>
  );
}

export default App;