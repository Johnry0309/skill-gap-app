import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard({ data }) {
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
      
      {/* Skill Discrepancy Highlight */}
      <div style={{ background: '#ebf8ff', padding: '20px', borderRadius: '8px', borderLeft: '6px solid #3182ce' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#2b6cb0' }}>Skill Discrepancy Highlight</h3>
        <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: '#2d3748' }}>{data.summary}</p>
      </div>

      {/* Bar Chart: Demand vs Supply */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1a202c' }}>Jobs Demanded vs. Annual Graduates</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.comparisonData}>
            <XAxis dataKey="field" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="jobsNeeded" name="Jobs Needed" fill="#3182ce" />
            <Bar dataKey="graduates" name="Graduates Produced" fill="#e53e3e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Educational Institutions Table */}
      {data.institutions && data.institutions.length > 0 && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1a202c' }}>Prominent Educational Institutions</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#edf2f7', color: '#4a5568' }}>
                  <th style={{ padding: '12px' }}>Institution Name</th>
                  <th style={{ padding: '12px' }}>Type</th>
                  <th style={{ padding: '12px' }}>Core Courses Offered</th>
                  <th style={{ padding: '12px' }}>Est. Graduates</th>
                  <th style={{ padding: '12px' }}>Strategic Focus</th>
                </tr>
              </thead>
              <tbody>
                {data.institutions.map((inst, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#2d3748' }}>{inst.name}</td>
                    <td style={{ padding: '12px', color: '#718096' }}>{inst.category}</td>
                    <td style={{ padding: '12px', color: '#4a5568' }}>
                      {Array.isArray(inst.courses) ? inst.courses.join(', ') : inst.courses}
                    </td>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{inst.graduates}</td>
                    <td style={{ padding: '12px', color: '#718096' }}>{inst.strategicFocus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* In-Depth Data Interpretation */}
      {data.interpretation && (
        <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#2d3748' }}>Data Interpretation & Economic Analysis</h3>
          <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.7', color: '#4a5568', whiteSpace: 'pre-line' }}>
            {data.interpretation}
          </p>
        </div>
      )}

    </div>
  );
}