import React, { useState, useEffect } from 'react';

export default function OnboardingModal() {
  // 1. Initialize state directly to true so it pops up every visit
  const [isOpen, setIsOpen] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 2. Simply reset slide or open modal on mount (no localStorage check)
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    // 3. Close the modal for the current session without saving a flag to localStorage
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const slides = [
    {
      title: "Bridging Education & Industry",
      subtitle: "Spotting Municipal Skill Discrepancies",
      description: "Analyze live local job postings alongside higher-education graduate outputs to pinpoint where skill shortages exist across regional municipalities.",
      // Vector Graphic 1: Academy Cap & Bridge to Tech Nodes
      image: (
        <svg viewBox="0 0 400 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="220" rx="12" fill="#0f172a"/>
          {/* Bridge Pathway */}
          <path d="M 50 160 Q 200 110 350 160" stroke="#3b82f6" strokeWidth="4" strokeDasharray="6 6"/>
          <path d="M 50 170 L 350 170" stroke="#334155" strokeWidth="6"/>
          {/* Left Node: Academy */}
          <circle cx="80" cy="140" r="28" fill="#1e293b" stroke="#38bdf8" strokeWidth="2"/>
          <path d="M 80 125 L 100 135 L 80 145 L 60 135 Z" fill="#38bdf8"/>
          <path d="M 68 140 v 10 c 0 5 12 8 24 0 v -10" fill="none" stroke="#38bdf8" strokeWidth="2"/>
          {/* Right Node: Modern Tech */}
          <circle cx="320" cy="140" r="28" fill="#1e293b" stroke="#10b981" strokeWidth="2"/>
          <path d="M 310 132 l 6 6 -6 6 M 330 132 l -6 6 6 6" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Glowing Center Pulse */}
          <circle cx="200" cy="135" r="14" fill="#3b82f6" fillOpacity="0.3"/>
          <circle cx="200" cy="135" r="6" fill="#60a5fa"/>
        </svg>
      )
    },
    {
      title: "AI-Driven Telemetry",
      subtitle: "Real-Time Supply vs. Demand",
      description: "Synthesize live labor telemetry, aggregate verified local job openings, and track supply-demand ratios in an interactive visual dashboard.",
      // Vector Graphic 2: Interactive Analytics Chart
      image: (
        <svg viewBox="0 0 400 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="220" rx="12" fill="#0f172a"/>
          {/* Grid lines */}
          <line x1="60" y1="40" x2="340" y2="40" stroke="#1e293b" strokeWidth="1"/>
          <line x1="60" y1="90" x2="340" y2="90" stroke="#1e293b" strokeWidth="1"/>
          <line x1="60" y1="140" x2="340" y2="140" stroke="#1e293b" strokeWidth="1"/>
          {/* Bars */}
          <rect x="90" y="70" width="24" height="90" rx="4" fill="#3b82f6"/>
          <rect x="120" y="110" width="24" height="50" rx="4" fill="#10b981"/>
          <rect x="180" y="50" width="24" height="110" rx="4" fill="#3b82f6"/>
          <rect x="210" y="95" width="24" height="65" rx="4" fill="#10b981"/>
          <rect x="270" y="85" width="24" height="75" rx="4" fill="#3b82f6"/>
          <rect x="300" y="125" width="24" height="35" rx="4" fill="#10b981"/>
          {/* Baseline */}
          <line x1="50" y1="160" x2="350" y2="160" stroke="#475569" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: "Policy & Skill Verification",
      subtitle: "Actionable Insights & Screening",
      description: "Equip municipal leaders with strategic curriculum policies while providing candidate skill verification assessments to bridge the employment gap.",
      // Vector Graphic 3: Verified Badge & Shield
      image: (
        <svg viewBox="0 0 400 220" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="220" rx="12" fill="#0f172a"/>
          {/* Shield Background */}
          <path d="M 200 45 L 260 70 V 125 C 260 160 200 185 200 185 C 200 185 140 160 140 125 V 70 Z" fill="#1e293b" stroke="#059669" strokeWidth="3"/>
          {/* Checkmark */}
          <path d="M 175 115 L 192 132 L 228 95" stroke="#34d399" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Stars */}
          <circle cx="100" cy="110" r="4" fill="#fbbf24"/>
          <circle cx="300" cy="110" r="4" fill="#fbbf24"/>
        </svg>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Close Icon Button */}
        <button onClick={handleClose} style={styles.closeBtn} aria-label="Close modal">
          ✕
        </button>

        {/* Dynamic Vector Graphic Banner */}
        <div style={styles.imageContainer}>
          {slides[currentSlide].image}
        </div>

        {/* Text Area */}
        <div style={styles.content}>
          <span style={styles.badge}>{slides[currentSlide].subtitle}</span>
          <h2 style={styles.title}>{slides[currentSlide].title}</h2>
          <p style={styles.description}>{slides[currentSlide].description}</p>
        </div>

        {/* Footer Navigation Controls */}
        <div style={styles.footer}>
          {/* Slide Indicator Dots */}
          <div style={styles.dotsContainer}>
            {slides.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  ...styles.dot,
                  backgroundColor: currentSlide === idx ? '#2563eb' : '#cbd5e1',
                  width: currentSlide === idx ? '20px' : '8px'
                }}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div style={styles.btnGroup}>
            {currentSlide > 0 && (
              <button onClick={handlePrev} style={styles.secondaryBtn}>
                Back
              </button>
            )}
            <button onClick={handleNext} style={styles.primaryBtn}>
              {currentSlide === slides.length - 1 ? 'I Understand →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '16px'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '480px',
    width: '100%',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: 'none',
    color: '#ffffff',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    zIndex: 10,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageContainer: {
    height: '200px',
    backgroundColor: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    padding: '24px 24px 12px 24px',
    textAlign: 'center'
  },
  badge: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '4px 10px',
    borderRadius: '12px',
    display: 'inline-block',
    marginBottom: '8px'
  },
  title: {
    margin: '4px 0 10px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a'
  },
  description: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5'
  },
  footer: {
    padding: '16px 24px 24px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dotsContainer: {
    display: 'flex',
    gap: '6px'
  },
  dot: {
    height: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  btnGroup: {
    display: 'flex',
    gap: '8px'
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer'
  },
  secondaryBtn: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '9px 14px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer'
  }
};