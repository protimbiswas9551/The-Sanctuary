import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Wind, RotateCcw, Home } from 'lucide-react';

type BreathingPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export default function VoiceInterface() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('Inhale');
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    let phaseTimer: NodeJS.Timeout;
    let countdown: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      countdown = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);

      const runPhase = () => {
        setPhase('Inhale');
        phaseTimer = setTimeout(() => {
          setPhase('Hold');
          phaseTimer = setTimeout(() => {
            setPhase('Exhale');
            phaseTimer = setTimeout(() => {
              setPhase('Rest');
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
      clearTimeout(phaseTimer);
      clearInterval(countdown);
    };
  }, [isActive, timeLeft === 0]);

  return (
    <main className="relative h-screen w-full flex flex-col items-center justify-center botanical-glow overflow-hidden pt-20">
      {/* Ambient Light Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-container blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-secondary-container/20 blur-[100px]" />
      </div>

      {/* Centered Interaction Group */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-12 max-w-3xl w-full px-6 text-center">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 text-primary"
          >
            <Wind className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">The Breathing Garden</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif italic text-on-surface">
            {isActive ? phase : timeLeft === 0 ? "Peace Found" : "Moment of Stillness"}
          </h1>
          <p className="text-on-surface-variant max-w-md mx-auto leading-relaxed">
            {isActive 
              ? (phase === 'Inhale' ? "Fill your lungs with the morning mist..." : phase === 'Hold' ? "Hold the stillness within..." : phase === 'Exhale' ? "Release the weight of the day..." : "Prepare for the next breath...")
              : timeLeft === 0 ? "You've tended to your inner garden. Carry this calm with you." : "A quick reset to center your focus. Let the garden breathe with you."}
          </p>
        </div>

        <div className="relative group">
          {/* The Core Glowing Orb */}
          <motion.div 
            animate={{ 
              scale: isActive ? (phase === 'Inhale' ? 1.3 : phase === 'Exhale' ? 0.8 : 1.1) : 1,
              boxShadow: isActive ? [
                "0 0 80px 20px rgba(115, 219, 154, 0.1)",
                "0 0 120px 40px rgba(115, 219, 154, 0.3)",
                "0 0 80px 20px rgba(115, 219, 154, 0.1)"
              ] : "0 0 80px 20px rgba(115, 219, 154, 0.1)"
            }}
            transition={{ duration: 4, repeat: isActive ? 0 : Infinity, ease: "easeInOut" }}
            className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-emerald-900/20 flex items-center justify-center relative overflow-hidden border border-primary/20"
          >
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay">
              <img 
                src="https://images.unsplash.com/photo-1516528387618-afa90b13e000?q=80&w=2560&auto=format&fit=crop" 
                alt="Leaf texture" 
                className="w-full h-full object-cover scale-150 rotate-12"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className={`w-24 h-24 rounded-full bg-primary blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-60' : 'opacity-40'}`} />
            <div className="absolute inset-4 border border-primary/10 rounded-full" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-light text-on-surface tabular-nums">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-4">
          {timeLeft === 0 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeLeft(60)}
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-on-primary font-bold shadow-xl shadow-primary/20"
            >
              <RotateCcw className="w-5 h-5" />
              Begin Again
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsActive(!isActive)}
              className={`px-12 py-4 rounded-full font-bold transition-all ${isActive ? 'bg-surface-container-highest text-on-surface' : 'bg-primary text-on-primary shadow-xl shadow-primary/20'}`}
            >
              {isActive ? 'Pause' : 'Start 1m Session'}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="p-4 rounded-full bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:text-primary transition-colors"
          >
            <Home className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </main>
  );
}
