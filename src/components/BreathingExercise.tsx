import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wind, Play, RotateCcw } from 'lucide-react';

interface BreathingExerciseProps {
  onClose: () => void;
}

type BreathingTechnique = {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdEmpty?: number;
  color: string;
};

const TECHNIQUES: BreathingTechnique[] = [
  {
    name: "Box Breathing",
    description: "Equal parts focus. Used by Navy SEALs to remain calm under pressure.",
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdEmpty: 4,
    color: "var(--color-primary)"
  },
  {
    name: "4-7-8 Technique",
    description: "A natural tranquilizer for the nervous system. Great for sleep and anxiety.",
    inhale: 4,
    hold: 7,
    exhale: 8,
    color: "var(--color-secondary)"
  },
  {
    name: "Deep Calm",
    description: "Simple, effective grounding for immediate stress relief.",
    inhale: 5,
    hold: 2,
    exhale: 7,
    color: "var(--color-tertiary)"
  }
];

type BreathingPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export default function BreathingExercise({ onClose }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [technique, setTechnique] = useState<BreathingTechnique>(TECHNIQUES[0]);
  const [phase, setPhase] = useState<BreathingPhase>('Inhale');
  const [timeLeft, setTimeLeft] = useState(60);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let phaseTimer: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      const runPhase = () => {
        if (!isActive) return;

        setPhase('Inhale');
        phaseTimer = setTimeout(() => {
          if (technique.hold) {
            setPhase('Hold');
            phaseTimer = setTimeout(() => {
              setPhase('Exhale');
              phaseTimer = setTimeout(() => {
                if (technique.holdEmpty) {
                  setPhase('Rest');
                  phaseTimer = setTimeout(() => {
                    setCycleCount(c => c + 1);
                    runPhase();
                  }, technique.holdEmpty * 1000);
                } else {
                  setCycleCount(c => c + 1);
                  runPhase();
                }
              }, technique.exhale * 1000);
            }, technique.hold * 1000);
          } else {
            setPhase('Exhale');
            phaseTimer = setTimeout(() => {
              setCycleCount(c => c + 1);
              runPhase();
            }, technique.exhale * 1000);
          }
        }, technique.inhale * 1000);
      };

      runPhase();
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(phaseTimer);
    };
  }, [isActive, timeLeft === 0, technique]);

  const startExercise = (duration: number) => {
    setSessionDuration(duration);
    setTimeLeft(duration);
    setIsActive(true);
    setCycleCount(0);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhase('Inhale');
    setTimeLeft(sessionDuration);
    setCycleCount(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-6"
    >
      <div className="max-w-xl w-full glass-panel rounded-[3rem] p-12 relative flex flex-col items-center text-center overflow-hidden">
        <div className="botanical-grain absolute inset-0 opacity-20" />
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-surface-container-highest transition-colors z-20"
        >
          <X className="w-6 h-6 text-on-surface-variant" />
        </button>

        {!isActive && timeLeft === sessionDuration ? (
          <div className="relative z-10 w-full space-y-8 py-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wind className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-serif italic text-on-surface mb-2">Moment of Stillness</h2>
              <p className="text-on-surface-variant text-sm max-w-sm mx-auto">
                Select a technique and duration to center your breath.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TECHNIQUES.map((tech) => (
                <button
                  key={tech.name}
                  onClick={() => setTechnique(tech)}
                  className={`p-4 rounded-3xl border-2 transition-all text-left group ${
                    technique.name === tech.name 
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5' 
                      : 'border-outline-variant/10 hover:border-primary/30 hover:bg-surface-container-highest/50'
                  }`}
                >
                  <h4 className={`font-bold text-sm mb-1 ${technique.name === tech.name ? 'text-primary' : 'text-on-surface'}`}>
                    {tech.name}
                  </h4>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-2">
                    {tech.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60">Session Duration</span>
              <div className="flex justify-center gap-3">
                {[60, 120, 300].map((d) => (
                  <button
                    key={d}
                    onClick={() => startExercise(d)}
                    className="px-6 py-2 rounded-xl bg-surface-container-highest text-on-surface text-xs font-bold hover:bg-primary hover:text-on-primary transition-all border border-outline-variant/10"
                  >
                    {d / 60}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 w-full flex flex-col items-center space-y-8">
            <div className="flex flex-col items-center">
              <span className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-1">
                {technique.name}
              </span>
              <h3 className="text-4xl font-light text-on-surface tabular-nums">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </h3>
            </div>

            {/* Breathing Circle */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ scale: phase === 'Inhale' ? 0.8 : phase === 'Exhale' ? 1.2 : 1 }}
                  animate={{ 
                    scale: phase === 'Inhale' ? 1.4 : phase === 'Exhale' ? 0.8 : 1,
                    backgroundColor: technique.color,
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{ 
                    duration: phase === 'Inhale' ? technique.inhale : phase === 'Exhale' ? technique.exhale : phase === 'Hold' ? technique.hold : (technique.holdEmpty || 1), 
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)]"
                />
              </AnimatePresence>
              
              <motion.div
                animate={{ 
                  scale: phase === 'Inhale' ? 1.2 : phase === 'Exhale' ? 0.8 : 1,
                  borderColor: phase === 'Inhale' ? `var(--color-primary)` : phase === 'Exhale' ? `var(--color-secondary)` : `var(--color-outline-variant)`
                }}
                transition={{ 
                  duration: phase === 'Inhale' ? technique.inhale : phase === 'Exhale' ? technique.exhale : phase === 'Hold' ? technique.hold : (technique.holdEmpty || 1), 
                  ease: "easeInOut"
                }}
                className="w-48 h-48 rounded-full border-2 flex items-center justify-center relative z-10 transition-colors"
              >
                <div className="w-40 h-40 rounded-full bg-surface-container-highest/30 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/5">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={phase}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="text-on-surface font-serif italic text-xl"
                    >
                      {phase}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Decorative Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-10px] border border-dashed border-primary/10 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-30px] border border-dotted border-primary/5 rounded-full"
              />
            </div>

            <div className="space-y-6 w-full max-w-sm">
              <p className="text-on-surface-variant italic h-12 flex items-center justify-center text-sm">
                {phase === 'Inhale' && technique.name === "4-7-8 Technique" ? "Breathe in quiet energy..." : phase === 'Inhale' && "Gentle inhale, fill your spirit..."}
                {phase === 'Hold' && "Hold the stillness, feel the center..."}
                {phase === 'Exhale' && "Soft exhale, release all tension..."}
                {phase === 'Rest' && "Empty and quiet, ready for more..."}
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex justify-center gap-4">
                  {timeLeft === 0 ? (
                    <button
                      onClick={resetExercise}
                      className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-on-primary font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Root Again
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsActive(!isActive)}
                      className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-surface-container-highest text-on-surface font-bold hover:bg-surface-bright transition-colors border border-outline-variant/10"
                    >
                      {isActive ? 'Pause' : 'Resume'}
                    </button>
                  )}
                </div>
                {timeLeft > 0 && (
                  <button 
                    onClick={onClose}
                    className="text-[10px] text-on-surface-variant/40 hover:text-on-surface-variant uppercase tracking-widest font-bold transition-colors"
                  >
                    Finish Session
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
