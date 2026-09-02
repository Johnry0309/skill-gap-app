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
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.headerCard}>
        <div>
          <span style={styles.badge(source)}>
            {source === 'cache' ? `📦 Cached (${lastCheckedDate})` : '⚡ Live Analysis'}
          </span>
          <h2 style={styles.title}>Labor Market Overview: {data.city?.toUpperCase()}</h2>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <span style={styles.statValue}>{data.jobListings?.length || 0}</span>
            <span style={styles.statLabel}>Active Roles</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statValue}>{data.comparisonData?.length || 0}</span>
            <span style={styles.statLabel}>Tracked Skills</span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div style={styles.summaryCard}>
        <div style={styles.cardHeader}>
          <span style={styles.icon}>💡</span>
          <h3 style={styles.sectionTitle}>Executive Summary</h3>
        </div>
        <p style={styles.summaryText}>{data.summary}</p>
      </div>

      {/* Analytics Chart */}
      {data.comparisonData && data.comparisonData.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.icon}>📊</span>
            <h3 style={styles.sectionTitle}>Skill Discrepancy Breakdown</h3>
          </div>
          <p style={styles.subText}>Employer demand vs. local graduate supply ratio across key domains.</p>
          <div style={{ width: '100%', height: 320, marginTop: '15px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.comparisonData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="demand" name="Employer Demand (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="supply" name="Graduate Supply (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Strategic Policy Interpretation */}
      {data.interpretation && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.icon}>🏛️</span>
            <h3 style={styles.sectionTitle}>Policy & Curriculum Recommendations</h3>
          </div>
          <p style={styles.bodyText}>{data.interpretation}</p>
        </div>
      )}

      {/* Job Openings Grid */}
      <div style={{ marginTop: '35px' }}>
        <div style={styles.cardHeader}>
          <span style={styles.icon}>🎯</span>
          <h3 style={styles.sectionTitle}>High-Demand Openings & Verification</h3>
        </div>
        
        <div style={styles.jobGrid}>
          {data.jobListings && data.jobListings.length > 0 ? (
            data.jobListings.map((job, index) => (
              <div key={index} style={styles.jobCard}>
                <div>
                  <h4 style={styles.jobTitle}>{job.title}</h4>
                  <p style={styles.companyName}>{job.company}</p>
                  <div style={styles.skillTagContainer}>
                    {job.requiredSkills?.map((skill, sIdx) => (
                      <span key={sIdx} style={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleStartQuiz(job)}
                  style={styles.verifyBtn}
                >
                  Verify Skill & Apply →
                </button>
              </div>
            ))
          ) : (
            <p style={styles.emptyText}>No job listings recorded for this location yet.</p>
          )}
        </div>
      </div>

      {/* Quiz Modal Container */}
      {selectedJob && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                Skill Assessment: {selectedJob.title}
              </h3>
              <button onClick={() => setSelectedJob(null)} style={styles.closeIconBtn}>✕</button>
            </div>

            {quizLoading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={{ color: '#64748b', marginTop: '12px', fontSize: '14px' }}>
                  Generating tailored technical assessment via AI...
                </p>
              </div>
            ) : activeQuiz ? (
              <QuizViewer quizData={activeQuiz} job={selectedJob} onClose={() => setSelectedJob(null)} />
            ) : (
              <button onClick={() => setSelectedJob(null)} style={styles.secondaryBtn}>Close</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Interactive Quiz Component
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
    <div style={{ marginTop: '15px' }}>
      {!submitted ? (
        <>
          {questions.map((q, qIdx) => (
            <div key={qIdx} style={styles.questionBlock}>
              <p style={styles.questionText}>
                <span style={styles.questionNumber}>{qIdx + 1}</span> {q.question}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options.map((opt, oIdx) => (
                  <label
                    key={oIdx}
                    style={{
                      ...styles.optionLabel,
                      border: answers[qIdx] === oIdx ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: answers[qIdx] === oIdx ? '#eff6ff' : '#ffffff'
                    }}
                  >
                    <input
                      type="radio"
                      name={`q_${qIdx}`}
                      checked={answers[qIdx] === oIdx}
                      onChange={() => setAnswers({ ...answers, [qIdx]: oIdx })}
                      style={{ accentColor: '#2563eb' }}
                    />
                    <span style={{ fontSize: '14px', color: '#334155' }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              style={{
                ...styles.primaryBtn,
                opacity: Object.keys(answers).length < questions.length ? 0.5 : 1,
                cursor: Object.keys(answers).length < questions.length ? 'not-allowed' : 'pointer'
              }}
            >
              Submit Assessment
            </button>
            <button onClick={onClose} style={styles.secondaryBtn}>Cancel</button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={styles.scoreCircle(passed)}>
            <span style={{ fontSize: '28px', fontWeight: '800' }}>{percentage.toFixed(0)}%</span>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>{score} / {questions.length} Correct</span>
          </div>

          {passed ? (
            <div style={styles.passAlert}>
              <h4 style={{ margin: '0 0 6px 0', color: '#14532d' }}>🎉 Verification Passed!</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>
                Your technical score meets the requirement for this role.
              </p>
              {job.applyLink ? (
                <a href={job.applyLink} target="_blank" rel="noreferrer" style={styles.applyBtn}>
                  Complete Application Form →
                </a>
              ) : (
                <p style={{ fontSize: '12px', color: '#15803d', marginTop: '8px' }}>
                  Forwarding verified status to hiring manager...
                </p>
              )}
            </div>
          ) : (
            <div style={styles.failAlert}>
              <h4 style={{ margin: '0 0 6px 0', color: '#7f1d1d' }}>Threshold Not Met</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#991b1b' }}>
                You scored below 80%. Review the core competencies and re-verify when ready.
              </p>
            </div>
          )}

          <button onClick={onClose} style={{ ...styles.secondaryBtn, width: '100%', marginTop: '15px' }}>
            Close Assessment
          </button>
        </div>
      )}
    </div>
  );
}

// Inline Style Object
const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    marginTop: '24px',
    textAlign: 'left'
  },
  headerCard: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.15)'
  },
  title: {
    margin: '8px 0 0 0',
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '-0.5px'
  },
  badge: (source) => ({
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '20px',
    backgroundColor: source === 'cache' ? '#334155' : '#065f46',
    color: source === 'cache' ? '#94a3b8' : '#34d399'
  }),
  statsRow: {
    display: 'flex',
    gap: '20px'
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#38bdf8'
  },
  statLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  summaryCard: {
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #2563eb',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0'
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    margin: '20px 0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  icon: {
    fontSize: '18px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  },
  summaryText: {
    margin: 0,
    color: '#1e3a8a',
    fontSize: '15px',
    lineHeight: '1.6'
  },
  subText: {
    margin: 0,
    color: '#64748b',
    fontSize: '13px'
  },
  bodyText: {
    margin: 0,
    color: '#334155',
    fontSize: '15px',
    lineHeight: '1.7'
  },
  jobGrid: {
    display: 'grid',
    gap: '16px',
    marginTop: '15px'
  },
  jobCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  jobTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a'
  },
  companyName: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#64748b'
  },
  skillTagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  skillTag: {
    fontSize: '12px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    fontWeight: '500',
    padding: '3px 9px',
    borderRadius: '6px'
  },
  verifyBtn: {
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    whiteSpace: 'nowrap'
  },
  emptyText: {
    color: '#64748b',
    fontStyle: 'italic'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '28px',
    borderRadius: '12px',
    maxWidth: '560px',
    width: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '14px'
  },
  closeIconBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#94a3b8',
    cursor: 'pointer'
  },
  questionBlock: {
    marginBottom: '20px'
  },
  questionText: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#1e293b',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  questionNumber: {
    backgroundColor: '#e2e8f0',
    color: '#334155',
    fontSize: '12px',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    flex: 1
  },
  secondaryBtn: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px 0'
  },
  scoreCircle: (passed) => ({
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    backgroundColor: passed ? '#dcfce7' : '#fee2e2',
    color: passed ? '#15803d' : '#b91c1c',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto'
  }),
  passAlert: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0'
  },
  failAlert: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0'
  },
  applyBtn: {
    display: 'inline-block',
    backgroundColor: '#166534',
    color: '#ffffff',
    padding: '10px 18px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '13px',
    marginTop: '12px'
  }
};