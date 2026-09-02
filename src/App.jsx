import React, { useState } from 'react';
import CitySelector from './components/CitySelector';
import Dashboard from './components/Dashboard';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function App() {
  const [selectedCity, setSelectedCity] = useState('');
  const [researchData, setResearchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchResearch = async () => {
    if (!selectedCity) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/research?city=${encodeURIComponent(selectedCity)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch labor market research');
      }

      setResearchData(result);
    } catch (err) {
      setError(err.message);
      setResearchData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async (jobTitle, requiredSkills) => {
    const response = await fetch(`${API_BASE_URL}/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle, requiredSkills })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to generate quiz');
    }

    return result;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>SkillGap Analytics Portal</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>
          Bridging municipal higher-education outputs with real-time labor market demands
        </p>
      </header>

      <main>
        <CitySelector
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          onSearch={handleFetchResearch}
          loading={loading}
        />

        {error && (
          <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px', margin: '15px 0' }}>
            {error}
          </div>
        )}

        {loading && <p style={{ color: '#64748b', marginTop: '20px' }}>Analyzing live data & cache records...</p>}

        {!loading && researchData && (
          <Dashboard
            researchData={researchData}
            onTakeQuiz={handleGenerateQuiz}
          />
        )}
      </main>
    </div>
  );
}