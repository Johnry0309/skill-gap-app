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
    <div className="app-viewport">
      {/* Top Brand Header */}
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-pill-badge">
            <span>⚡ AI-Powered Workforce Intelligence</span>
          </div>
          <h1 className="app-title">SkillGap Analytics Portal</h1>
          <p className="app-subtitle">
            Bridging municipal higher-education outputs with real-time labor market demands
          </p>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="app-main-container">
        <CitySelector
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          onSearch={handleFetchResearch}
          loading={loading}
        />

        {error && (
          <div className="app-error-banner">
            🚨 {error}
          </div>
        )}

        {loading && (
          <div className="app-loading-state">
            <div className="app-spinner"></div>
            <p>Analyzing live market telemetry & retrieving cached records...</p>
          </div>
        )}

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