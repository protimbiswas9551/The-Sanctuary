import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Square, ArrowUp, BrainCircuit } from 'lucide-react';

export default function VoiceInterface() {
  const navigate = useNavigate();
  const [reflection, setReflection] = useState('');

  const handleSendReflection = () => {
    if (!reflection.trim()) return;
    // For now, just clear and navigate back to chat
    setReflection('');
    navigate('/reflect');
  };

  return (
    <main className="relative h-screen w-full flex flex-col items-center justify-center botanical-glow overflow-hidden pt-20">
      {/* Ambient Light Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-container blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-secondary-container/20 blur-[100px]" />
      </div>

      {/* Centered Interaction Group */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-12 max-w-3xl w-full px-6">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="relative group">
            {/* The Core Glowing Orb */}
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 80px 20px rgba(115, 219, 154, 0.1)",
                  "0 0 100px 30px rgba(115, 219, 154, 0.2)",
                  "0 0 80px 20px rgba(115, 219, 154, 0.1)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-52 h-52 md:w-64 md:h-64 rounded-full bg-emerald-900/20 flex items-center justify-center relative overflow-hidden border border-primary/20"
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
              <div className="w-20 h-20 rounded-full bg-primary blur-3xl opacity-40" />
              <div className="absolute inset-2 border border-primary/10 rounded-full" />
            </motion.div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Listening...</h1>
            <p className="text-on-surface-variant text-base leading-relaxed font-light">
              I'm here, tell me what's on your mind.
            </p>
          </div>

          <motion.button 
            onClick={() => navigate('/reflect')}
            whileTap={{ scale: 0.95 }}
            className="group flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center group-hover:bg-red-900/20 group-hover:border-red-500/50 transition-all duration-500">
              <Square className="w-6 h-6 text-on-surface group-hover:text-red-400" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">Tap to end</span>
          </motion.button>
        </div>

        {/* Integrated Input Area */}
        <div className="w-full max-w-2xl space-y-4">
          <div className="relative flex items-center bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant/20 rounded-full p-2 pl-6 shadow-2xl focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
            <input 
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendReflection()}
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/50 text-base" 
              placeholder="Type your reflection..." 
              type="text"
            />
            <button 
              onClick={handleSendReflection}
              className="ml-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 transition-all"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
          <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/40 px-4">
            <span>Presence Engine Alpha</span>
            <div className="flex gap-4">
              <button className="hover:text-primary transition-colors">Voice mode</button>
              <button className="hover:text-primary transition-colors">Transcription</button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Widget */}
      <div className="fixed bottom-12 right-8 z-20 max-w-[280px] hidden lg:block">
        <div className="bg-surface-container-low/60 backdrop-blur-md p-6 rounded-xl border border-outline-variant/10 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-tertiary-container p-2 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-tertiary" />
            </div>
            <div className="space-y-2">
              <h4 className="text-on-surface font-semibold text-sm">Feeling overwhelmed?</h4>
              <p className="text-on-surface-variant text-xs leading-snug">You don't have to carry this alone. Help is available 24/7.</p>
              <a 
                href="https://www.crisistextline.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-primary text-xs font-bold uppercase tracking-wider mt-2 border-b border-primary/30 hover:border-primary transition-all"
              >
                Talk to a professional
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
