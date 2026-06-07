import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Sparkles, Heart, Brain, Leaf, Play, ChevronRight, ArrowRight } from 'lucide-react';
import BreathingExercise from '../components/BreathingExercise';
import GuidedMeditation from '../components/GuidedMeditation';

export default function Mindfulness() {
  const [showBreathing, setShowBreathing] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);

  const mindfulnessCategories = [
    {
      id: 'breath',
      title: 'Breathwork',
      description: 'Controlled breathing techniques to regulate your nervous system.',
      icon: Wind,
      color: 'primary',
      action: () => setShowBreathing(true),
      features: ['Box Breathing', '4-7-8 Technique', 'Deep Calm']
    },
    {
      id: 'meditation',
      title: 'Guided Sessions',
      description: 'Visualize and reflect with short, guided mental exercises.',
      icon: Sparkles,
      color: 'secondary',
      action: () => setShowMeditation(true),
      features: ['Grounding', 'Mental Clarity', 'Self-Compassion']
    }
  ];

  const quickTips = [
    { title: 'The 5-4-3-2-1 Rule', text: '5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.' },
    { title: 'Soft Scanned', text: 'Scan your body from head to toe, releasing tension in each muscle.' },
    { title: 'Daily Gratitude', text: 'Think of three small things you are genuinely thankful for today.' }
  ];

  return (
    <div className="relative min-h-screen pt-32 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      <header className="relative z-10 mb-16 text-center lg:text-left max-w-2xl">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4 block"
        >
          Inner Sanctuary
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-light text-on-surface tracking-tight mb-6 font-serif"
        >
          The <span className="italic font-normal text-secondary">Still</span> Point.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-on-surface-variant text-lg leading-relaxed"
        >
          In a world of constant motion, the most revolutionary act is to be still. Tend to the garden of your mind.
        </motion.p>
      </header>

      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Categories */}
        <section className="lg:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mindfulnessCategories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.3 }}
                className="glass-panel group rounded-[2.5rem] p-10 flex flex-col items-start text-left relative overflow-hidden"
              >
                <div className="botanical-grain absolute inset-0 opacity-10" />
                <div className={`w-14 h-14 rounded-2xl bg-${cat.color}/20 flex items-center justify-center text-${cat.color} mb-8`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-serif italic text-on-surface mb-4">{cat.title}</h3>
                <p className="text-on-surface-variant mb-8 leading-relaxed">
                  {cat.description}
                </p>
                
                <div className="space-y-3 mb-10 w-full">
                  {cat.features.map(f => (
                    <div key={f} className="flex items-center gap-3 text-xs text-on-surface font-medium border-b border-outline-variant/10 pb-2">
                      <ArrowRight className={`w-3 h-3 text-${cat.color}/60`} />
                      {f}
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cat.action}
                  className={`mt-auto w-full py-4 rounded-2xl bg-${cat.color} text-on-${cat.color} font-bold text-sm uppercase tracking-widest shadow-xl shadow-${cat.color}/20 transition-all flex items-center justify-center gap-2`}
                >
                  Enter Space
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Daily Wisdom Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-[2.5rem] p-12 relative overflow-hidden border-secondary/20 bg-secondary/5"
          >
            <div className="botanical-grain absolute inset-0 opacity-20" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="w-32 h-32 rounded-full border-4 border-secondary/30 flex items-center justify-center p-2 relative">
                <div className="absolute inset-0 bg-secondary/10 rounded-full animate-pulse" />
                <Leaf className="w-12 h-12 text-secondary relative z-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="text-secondary text-[10px] uppercase tracking-widest font-bold mb-2 block">Mindful Insight</span>
                <h2 className="text-2xl font-serif italic text-on-surface mb-4">"The garden does not hurry; yet everything is accomplished."</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed italic opacity-80">
                  Allow yourself the grace of slow growth today. You are exactly where you need to be.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          <div className="glass-panel rounded-[2.5rem] p-8">
            <h4 className="text-on-surface font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Quick Grounds
            </h4>
            <div className="space-y-6">
              {quickTips.map((tip, idx) => (
                <div key={idx} className="space-y-2 group">
                  <h5 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{tip.title}</h5>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2.5rem] p-8 bg-primary/5 border-primary/20">
            <h4 className="text-on-surface font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Mindful Streak
            </h4>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-light text-primary tabular-nums">03</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant leading-tight">
                Days of<br />Presence
              </div>
            </div>
            <p className="mt-4 text-[10px] text-on-surface-variant/60 italic">Consistency is the soil where peace grows.</p>
          </div>
        </aside>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showBreathing && (
          <BreathingExercise onClose={() => setShowBreathing(false)} />
        )}
        {showMeditation && (
          <GuidedMeditation onClose={() => setShowMeditation(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
