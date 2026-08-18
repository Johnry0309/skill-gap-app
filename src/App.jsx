import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CitySelector from './components/CitySelector';
import Dashboard from './components/Dashboard';

const fetchCityResearch = async (city) => {
  const response = await fetch(`http://localhost:5000/api/research?city=${encodeURIComponent(city)}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch AI research for this city');
  }

  return response.json();
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['research', selectedCity],
    queryFn: () => fetchCityResearch(selectedCity),
    enabled: !!selectedCity,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Local Labor Market & Skill Discrepancy Platform</h1>
      <p>Select a municipality in Rizal to view live labor demand vs. graduate output stats.</p>

      <CitySelector onSelectCity={(city) => setSelectedCity(city)} disabled={isLoading} selectedCity={selectedCity} />

      {!selectedCity && (
        <div style={{ padding: '30px', textAlign: 'center', color: '#718096', border: '2px dashed #e2e8f0', borderRadius: '8px', marginTop: '20px' }}>
          Please select a municipality above to generate live labor market insights.
        </div>
      )}

      {isLoading && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#4a5568' }}>
          🤖 AI is analyzing live web data for <strong>{selectedCity}</strong>...
        </div>
      )}

      {isError && (
        <div style={{ padding: '16px', color: '#c53030', background: '#fff5f5', borderRadius: '8px', marginTop: '16px' }}>
          {error?.message || 'Could not retrieve data.'}
        </div>
      )}

      {!isLoading && data && <Dashboard data={data} />}
    </div>
  );
}