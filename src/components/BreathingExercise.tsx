import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wind, Play, RotateCcw } from 'lucide-react';

interface BreathingExerciseProps {
  onClose: () => void;
}

type BreathingPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export default function BreathingExercise({ onClose }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('Inhale');
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute default
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
        setPhase('Inhale');
        phaseTimer = setTimeout(() => {
          setPhase('Hold');
          phaseTimer = setTimeout(() => {
            setPhase('Exhale');
            phaseTimer = setTimeout(() => {
              setPhase('Rest');
              setCycleCount(c => c + 1);
              phaseTimer = setTimeout(runPhase, 4000);
            }, 4000);
          }, 4000);
        }, 4000);
      };

      runPhase();
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(phaseTimer);
    };
  }, [isActive, timeLeft === 0]);

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
          <div className="relative z-10 space-y-8 py-12">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wind className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-serif italic text-on-surface">Moment of Stillness</h2>
            <p className="text-on-surface-variant max-w-xs mx-auto">
              Choose a duration for your guided breathing session. Let the garden breathe with you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[60, 120, 180].map((d) => (
                <button
                  key={d}
                  onClick={() => startExercise(d)}
                  className="px-6 py-3 rounded-2xl bg-surface-container-highest text-on-surface font-bold hover:bg-primary hover:text-on-primary transition-all"
                >
                  {d / 60} Minute{d > 60 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative z-10 w-full flex flex-col items-center space-y-12">
            <div className="flex flex-col items-center">
              <span className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
                {isActive ? 'Session in Progress' : 'Session Complete'}
              </span>
              <h3 className="text-5xl font-light text-on-surface tabular-nums">
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
                    scale: phase === 'Inhale' ? 1.2 : phase === 'Exhale' ? 0.8 : 1,
                    backgroundColor: phase === 'Inhale' ? 'var(--color-primary)' : phase === 'Exhale' ? 'var(--color-secondary)' : 'var(--color-primary-container)'
                  }}
                  transition={{ 
                    duration: 4, 
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full opacity-20 blur-3xl"
                />
              </AnimatePresence>
              
              <motion.div
                animate={{ 
                  scale: phase === 'Inhale' ? 1.2 : phase === 'Exhale' ? 0.8 : 1,
                }}
                transition={{ 
                  duration: 4, 
                  ease: "easeInOut"
                }}
                className="w-48 h-48 rounded-full border-2 border-primary/30 flex items-center justify-center relative z-10"
              >
                <div className="w-40 h-40 rounded-full bg-surface-container-highest/50 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={phase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-primary font-bold uppercase tracking-widest text-sm"
                    >
                      {phase}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Decorative Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] border border-dashed border-primary/10 rounded-full"
              />
            </div>

            <div className="space-y-6 w-full">
              <p className="text-on-surface-variant italic h-6">
                {phase === 'Inhale' && "Fill your lungs with the morning mist..."}
                {phase === 'Hold' && "Hold the stillness within..."}
                {phase === 'Exhale' && "Release the weight of the day..."}
                {phase === 'Rest' && "Prepare for the next breath..."}
              </p>

              <div className="flex justify-center gap-4">
                {timeLeft === 0 ? (
                  <button
                    onClick={resetExercise}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-on-primary font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Again
                  </button>
                ) : (
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-surface-container-highest text-on-surface font-bold hover:bg-surface-bright transition-colors"
                  >
                    {isActive ? 'Pause' : 'Resume'}
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
