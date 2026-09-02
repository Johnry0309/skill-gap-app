import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard({ researchData, onTakeQuiz }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);

  if (!researchData) return null;

  const { data, source } = researchData;
  const lastCheckedDate = data.lastChecked
    ? new Date(data.lastChecked).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'N/A';

  const handleStartQuiz = async (job) => {
    setSelectedJob(job);
    setQuizLoading(true);
    setActiveQuiz(null);
    try {
      const quiz = await onTakeQuiz(job.title, job.requiredSkills);
      setActiveQuiz(quiz);
    } catch (err) {
      alert('Failed to generate quiz assessment.');
      setSelectedJob(null);
    } finally {
      setQuizLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'left', marginTop: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Labor Market Report: {data.city.toUpperCase()}</h2>
        <span
          style={{
            fontSize: '13px',
            backgroundColor: source === 'cache' ? '#e2e8f0' : '#dcfce7',
            color: source === 'cache' ? '#475569' : '#166534',
            padding: '4px 10px',
            borderRadius: '12px',
            fontWeight: '600'
          }}
        >
          {source === 'cache' ? `📦 Cached (Last checked: ${lastCheckedDate})` : '⚡ Live Fresh Analysis'}
        </span>
      </div>

      {/* Summary Box */}
      <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #2563eb', margin: '15px 0' }}>
        <h4>Executive Summary</h4>
        <p>{data.summary}</p>
      </div>

      {/* Skill Discrepancy Bar Graph */}
      {data.comparisonData && data.comparisonData.length > 0 && (
        <div style={{ margin: '30px 0', backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4>Skill Discrepancy Graph (Demand vs. Supply)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="demand" name="Employer Demand (%)" fill="#2563eb" />
              <Bar dataKey="supply" name="Graduate Supply (%)" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Strategic Interpretation */}
      {data.interpretation && (
        <div style={{ margin: '20px 0' }}>
          <h4>Policy & Curriculum Analysis</h4>
          <p style={{ color: '#334155', lineHeight: '1.6' }}>{data.interpretation}</p>
        </div>
      )}

      {/* Job Listings Section */}
      <div style={{ marginTop: '30px' }}>
        <h3>In-Demand Openings & Skill Verification</h3>
        <div style={{ display: 'grid', gap: '15px', marginTop: '10px' }}>
          {data.jobListings && data.jobListings.length > 0 ? (
            data.jobListings.map((job, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#ffffff'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 6px 0' }}>{job.title}</h4>
                  <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>{job.company}</p>
                  <div>
                    {job.requiredSkills?.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '12px',
                          backgroundColor: '#f1f5f9',
                          color: '#0f172a',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          marginRight: '6px'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleStartQuiz(job)}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Verify Skill & Apply
                </button>
              </div>
            ))
          ) : (
            <p>No job listings recorded for this location yet.</p>
          )}
        </div>
      </div>

      {/* Quiz Modal Container */}
      {selectedJob && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '550px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            <h3>Skill Assessment: {selectedJob.title}</h3>
            {quizLoading ? (
              <p>Generating personalized skill assessment via AI...</p>
            ) : activeQuiz ? (
              <QuizViewer quizData={activeQuiz} job={selectedJob} onClose={() => setSelectedJob(null)} />
            ) : (
              <button onClick={() => setSelectedJob(null)}>Close</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Inner Component to render Quiz Interactive State
function QuizViewer({ quizData, job, onClose }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const questions = quizData.questions || quizData.quiz || [];

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const correctIdx = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : q.correctAnswer;
      if (answers[idx] === correctIdx) correctCount++;
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
  const passed = percentage >= 80;

  return (
    <div style={{ textAlign: 'left' }}>
      {!submitted ? (
        <>
          {questions.map((q, qIdx) => (
            <div key={qIdx} style={{ marginBottom: '16px' }}>
              <p style={{ fontWeight: '600', marginBottom: '6px' }}>
                {qIdx + 1}. {q.question}
              </p>
              {q.options.map((opt, oIdx) => (
                <label key={oIdx} style={{ display: 'block', margin: '4px 0', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`q_${qIdx}`}
                    checked={answers[qIdx] === oIdx}
                    onChange={() => setAnswers({ ...answers, [qIdx]: oIdx })}
                  />{' '}
                  {opt}
                </label>
              ))}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              style={{ backgroundColor: '#2563eb', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
            >
              Submit Test
            </button>
            <button onClick={onClose} style={{ backgroundColor: '#cbd5e1', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h4>Result: {score} / {questions.length} ({percentage.toFixed(0)}%)</h4>
          {passed ? (
            <div style={{ color: '#166534', backgroundColor: '#dcfce7', padding: '12px', borderRadius: '6px', margin: '12px 0' }}>
              <p style={{ fontWeight: 'bold' }}>🎉 Assessment Passed!</p>
              {job.applyLink ? (
                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#166534',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    marginTop: '8px'
                  }}
                >
                  Proceed to Application
                </a>
              ) : (
                <p style={{ fontSize: '12px' }}>Contact hiring organization directly.</p>
              )}
            </div>
          ) : (
            <div style={{ color: '#991b1b', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '6px', margin: '12px 0' }}>
              <p style={{ fontWeight: 'bold' }}>Score threshold not met (80% required)</p>
              <p style={{ fontSize: '14px' }}>Review key core competencies before attempting again.</p>
            </div>
          )}
          <button onClick={onClose} style={{ marginTop: '10px', padding: '6px 12px' }}>Close</button>
        </div>
      )}
    </div>
  );
}