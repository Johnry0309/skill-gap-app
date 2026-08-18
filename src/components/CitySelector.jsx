import React from 'react';

export default function CitySelector({ onSelectCity, disabled }) {
  const cities = [
    'Antipolo',
  'Angono',
  'Baras',
  'Binangonan',
  'Cainta',
  'Cardona',
  'Jalajala',
  'Morong',
  'Pililla',
  'Rodriguez (Montalban)',
  'San Mateo',
  'Tanay',
  'Taytay',
  'Teresa'
  ];

  return (
    <div style={{ marginBottom: '20px' }}>
      <label htmlFor="city-select" style={{ fontWeight: 'bold', marginRight: '10px' }}>
        Select City / Municipality:
      </label>
      <select
        id="city-select"
        onChange={(e) => e.target.value && onSelectCity(e.target.value)}
        disabled={disabled}
        style={{ padding: '8px 12px', fontSize: '16px', borderRadius: '6px' }}
      >
        <option value="">-- Choose a location --</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  );
}