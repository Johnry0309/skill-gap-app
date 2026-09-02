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
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '24px',
        width: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          width: '100%'
        }}
      >
        <div style={{ flex: '1', minWidth: '240px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}
          >
            Select Municipality / City
          </label>
          <select
            value={selectedCity}
            onChange={(e) => onSelectCity(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '15px',
              fontWeight: '500',
              color: '#0f172a',
              outline: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <option value="" disabled>
              -- Select Location --
            </option>
            {RIZAL_MUNICIPALITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onSearch}
          disabled={!selectedCity || loading}
          style={{
            backgroundColor: selectedCity && !loading ? '#2563eb' : '#94a3b8',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: selectedCity && !loading ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s, transform 0.1s',
            boxShadow: selectedCity && !loading ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none',
            whiteSpace: 'nowrap',
            height: '46px'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Market Gap →'}
        </button>
      </div>
    </div>
  );
}