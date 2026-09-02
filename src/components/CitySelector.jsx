import React from 'react';

const RIZAL_MUNICIPALITIES = [
  'Angono',
  'Antipolo',
  'Baras',
  'Binangonan',
  'Cainta',
  'Cardona',
  'Jala-jala',
  'Morong',
  'Pililla',
  'Rodriguez (Montalban)',
  'San Mateo',
  'Tanay',
  'Taytay',
  'Teresa'
];

export default function CitySelector({ selectedCity, onSelectCity, onSearch, loading }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '20px 0' }}>
      <select
        value={selectedCity}
        onChange={(e) => onSelectCity(e.target.value)}
        style={{
          padding: '10px 14px',
          fontSize: '16px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          minWidth: '220px'
        }}
      >
        <option value="" disabled>Select Municipality / City</option>
        {RIZAL_MUNICIPALITIES.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <button
        onClick={onSearch}
        disabled={loading || !selectedCity}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Analyzing...' : 'Analyze Market Gap'}
      </button>
    </div>
  );
}