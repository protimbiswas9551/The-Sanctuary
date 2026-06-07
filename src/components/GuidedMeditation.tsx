import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Play, Pause, RotateCcw, Volume2, Cloud, Sun, Leaf } from 'lucide-react';

interface GuidedMeditationProps {
  onClose: () => void;
}

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  icon: any;
  color: string;
  steps: {
    time: number;
    text: string;
  }[];
}

const SESSIONS: MeditationSession[] = [
  {
    id: 'grounding',
    title: 'The Rooted Tree',
    description: 'A quick grounding session to feel stable and firm.',
    duration: 120,
    icon: Leaf,
    color: 'emerald',
    steps: [
      { time: 0, text: "Sit comfortably, and close your eyes..." },
      { time: 10, text: "Feel the weight of your body pressing down..." },
      { time: 25, text: "Imagine roots growing from your feet into the earth..." },
      { time: 45, text: "You are firm, unshakeable, and strong." },
      { time: 70, text: "Let any stress flow down through your roots..." },
      { time: 95, text: "Take a deep breath and return to the room..." },
      { time: 120, text: "You are grounded." }
    ]
  },
  {
    id: 'clarity',
    title: 'Clearing the Mist',
    description: 'Mental decluttering session for sharp focus.',
    duration: 180,
    icon: Sun,
    color: 'amber',
    steps: [
      { time: 0, text: "Focus on the tip of your nose..." },
      { time: 20, text: "Notice the cool air entering, warm air leaving..." },
      { time: 50, text: "Thoughts are like clouds passing in the sky..." },
      { time: 80, text: "Observe them, but do not follow them." },
      { time: 120, text: "The sky of your mind is vast and clear." },
      { time: 160, text: "Carry this clarity into your next task." },
      { time: 180, text: "Bright and clear." }
    ]
  },
  {
    id: 'soft-heart',
    title: 'Softening the Heart',
    description: 'Cultivate compassion for yourself and others.',
    duration: 150,
    icon: Cloud,
    color: 'rose',
    steps: [
      { time: 0, text: "Place a hand over your heart..." },
      { time: 15, text: "Feel the gentle rhythm within..." },
      { time: 40, text: "Repeat silently: 'May I be kind to myself'..." },
      { time: 70, text: "Repeat silently: 'May I be at peace'..." },
      { time: 100, text: "Imagine a warm glow expanding from your chest..." },
      { time: 130, text: "Rest in this warmth for a moment." },
      { time: 150, text: "Carry this kindness with you." }
    ]
  }
];

export default function GuidedMeditation({ onClose }: GuidedMeditationProps) {
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && selectedSession) {
      timer = setInterval(() => {
        setProgress(p => {
          if (p >= selectedSession.duration) {
            setIsPlaying(false);
            return p;
          }
          return p + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, selectedSession]);

  useEffect(() => {
    if (selectedSession) {
      const currentStep = [...selectedSession.steps]
        .reverse()
        .find(s => progress >= s.time);
      if (currentStep) {
        const index = selectedSession.steps.indexOf(currentStep);
        setActiveStepIndex(index);
      }
    }
  }, [progress, selectedSession]);

  const startSession = (session: MeditationSession) => {
    setSelectedSession(session);
    setIsPlaying(true);
    setProgress(0);
  };

  const resetSession = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-6"
    >
      <div className="max-w-2xl w-full glass-panel rounded-[3rem] p-12 relative flex flex-col items-center overflow-hidden">
        <div className="botanical-grain absolute inset-0 opacity-20" />
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-surface-container-highest transition-colors z-20"
        >
          <X className="w-6 h-6 text-on-surface-variant" />
        </button>

        {!selectedSession ? (
          <div className="relative z-10 w-full space-y-8 py-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-serif italic text-on-surface mb-2">Internal Sanctuary</h2>
              <p className="text-on-surface-variant text-sm max-w-sm mx-auto">
                Guided reflections to tend to the landscapes of your mind.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {SESSIONS.map((session) => (
                <button
                  key={session.id}
                  onClick={() => startSession(session)}
                  className="flex items-center gap-6 p-6 rounded-3xl bg-surface-container-highest/30 border border-outline-variant/10 hover:bg-surface-container-highest/60 hover:scale-[1.02] transition-all group text-left"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-${session.color}-500/10 flex items-center justify-center text-${session.color}-500`}>
                    <session.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-on-surface mb-1">{session.title}</h4>
                    <p className="text-xs text-on-surface-variant line-clamp-1">{session.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{session.duration / 60} min</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative z-10 w-full flex flex-col items-center space-y-12">
            <div className="flex flex-col items-center text-center">
              <span className={`text-${selectedSession.color}-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-2`}>
                {selectedSession.title}
              </span>
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-light text-on-surface">
                  {Math.floor((selectedSession.duration - progress) / 60)}:{String((selectedSession.duration - progress) % 60).padStart(2, '0')}
                </h3>
                <span className="text-on-surface-variant/30 text-2xl font-light">/</span>
                <h3 className="text-2xl font-light text-on-surface-variant/50">
                  {selectedSession.duration / 60}:00
                </h3>
              </div>
            </div>

            {/* Visualizer */}
            <div className="relative w-full h-48 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: isPlaying ? [20, 60 + Math.random() * 60, 20] : 20,
                    }}
                    transition={{ 
                      duration: 1.5 + Math.random(), 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`w-1.5 rounded-full bg-${selectedSession.color}-500`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStepIndex}
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                  className="relative z-10 text-center px-8"
                >
                  <p className="text-xl md:text-2xl font-serif italic text-on-surface leading-relaxed max-w-lg mx-auto">
                    {selectedSession.steps[activeStepIndex].text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div 
                className={`h-full bg-${selectedSession.color}-500`}
                animate={{ width: `${(progress / selectedSession.duration) * 100}%` }}
                transition={{ ease: "linear" }}
              />
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <div className="flex justify-center gap-6">
                {progress >= selectedSession.duration ? (
                  <button
                    onClick={resetSession}
                    className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-on-primary font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center hover:bg-surface-bright transition-colors border border-outline-variant/10 shadow-xl"
                  >
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                  </button>
                )}
              </div>
              <div className="flex justify-between mt-2">
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="text-[10px] text-on-surface-variant/40 hover:text-on-surface-variant uppercase tracking-widest font-bold transition-colors"
                >
                  Switch Session
                </button>
                <button 
                  onClick={onClose}
                  className="text-[10px] text-on-surface-variant/40 hover:text-on-surface-variant uppercase tracking-widest font-bold transition-colors"
                >
                  Leave Sanctuary
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
