import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Ear, Flower2, Brain, Bell, Settings } from 'lucide-react';

export default function MoodTracker() {
  const [entry, setEntry] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleRootThought = () => {
    if (!entry.trim()) return;
    
    setIsSaving(true);
    
    // Simulate saving to a "garden" (localStorage)
    const savedEntries = JSON.parse(localStorage.getItem('sanctuary_entries') || '[]');
    const newEntry = {
      id: Date.now(),
      text: entry,
      date: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }),
      mood: 'Reflective'
    };
    
    localStorage.setItem('sanctuary_entries', JSON.stringify([newEntry, ...savedEntries]));
    
    setTimeout(() => {
      setEntry('');
      setIsSaving(false);
      alert('Your thought has been rooted in the garden.');
    }, 800);
  };

  return (
    <div className="relative min-h-screen pt-32 pb-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2560&auto=format&fit=crop" 
          alt="Monstera" 
          className="w-full h-full object-cover opacity-10 mix-blend-lighten"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Header Section */}
      <section className="lg:col-span-12 mb-8 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl md:text-7xl font-light text-on-surface tracking-tight mb-4 max-w-2xl"
        >
          How is your <span className="italic font-normal text-primary">soul</span> today?
        </motion.h1>
        <p className="text-on-surface-variant text-lg max-w-lg">
          The garden of the mind needs tending. Take a moment to name your weather.
        </p>
      </section>

      {/* Journaling Area */}
      <section className="lg:col-span-8 flex flex-col gap-8 relative z-10">
        <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden group">
          <div className="botanical-grain absolute inset-0" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <label className="text-secondary text-[10px] uppercase tracking-widest font-bold">Active Entry</label>
              <span className="text-on-surface-variant text-sm italic">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>
            <h2 className="text-2xl text-on-surface mb-6 font-medium tracking-tight">What's weighing on your mind?</h2>
            <textarea 
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl text-on-surface placeholder:text-on-surface-variant/30 min-h-[300px] resize-none custom-scrollbar"
              placeholder="Begin typing softly..."
            />
            <div className="mt-8 flex justify-end">
              <motion.button 
                onClick={handleRootThought}
                disabled={isSaving || !entry.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-gradient-to-r from-primary to-secondary text-on-primary px-8 py-3 rounded-full font-bold tracking-tight shadow-xl shadow-primary/10 transition-opacity ${isSaving || !entry.trim() ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
              >
                {isSaving ? 'Rooting...' : 'Root this thought'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Weekly Resonance Chart (Simplified Mock) */}
        <div className="glass-panel rounded-3xl p-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <label className="text-secondary text-[10px] uppercase tracking-widest font-bold mb-2 block">Weekly Resonance</label>
              <h3 className="text-on-surface text-lg">Emotional Tides</h3>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-4 px-2">
            {[40, 70, 90, 55, 85, 60, 30].map((height, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-3">
                <div className="w-full bg-primary/20 rounded-t-full relative" style={{ height: '100%' }}>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="absolute bottom-0 w-full bg-primary rounded-t-full" 
                  />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reflections */}
        <div className="space-y-6">
          <label className="text-secondary text-[10px] uppercase tracking-widest font-bold px-4">Recent Reflections</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'The weight of expectations', date: 'Yesterday', mood: 'Melancholy', color: 'secondary' },
              { title: 'Finding joy in small things', date: '2 days ago', mood: 'Serene', color: 'primary' },
            ].map((entry, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="glass-panel p-6 rounded-2xl border border-outline-variant/10 group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full bg-${entry.color}/10 text-${entry.color} text-[10px] font-bold uppercase tracking-wider`}>
                    {entry.mood}
                  </span>
                  <span className="text-on-surface-variant text-[10px] uppercase tracking-widest">{entry.date}</span>
                </div>
                <h4 className="text-on-surface font-medium mb-2 group-hover:text-primary transition-colors">{entry.title}</h4>
                <p className="text-on-surface-variant text-xs line-clamp-2">I realized today that most of my stress comes from things I cannot control. Letting go feels like...</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Side Navigation/Actions */}
      <section className="lg:col-span-4 flex flex-col gap-6 relative z-10">
        <label className="text-secondary text-[10px] uppercase tracking-widest font-bold px-4">Choose Your Guide</label>
        
        {[
          { name: 'The Listener', desc: 'Quiet space for pure expression.', icon: Ear, color: 'primary' },
          { name: 'The Friend', desc: 'Warm, validating reflections.', icon: Flower2, color: 'tertiary' },
          { name: 'The Mentor', desc: 'Challenging growth & insights.', icon: Brain, color: 'emerald-400' },
        ].map((guide) => (
          <motion.div 
            key={guide.name}
            whileHover={{ scale: 1.02 }}
            className="surface-container-high hover:bg-surface-bright rounded-2xl p-6 transition-all duration-500 border border-outline-variant/10 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-${guide.color}`}>
                <guide.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-on-surface font-medium">{guide.name}</h4>
                <p className="text-on-surface-variant text-xs">{guide.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="mt-8 p-6 rounded-3xl bg-surface-container-low border border-outline-variant/5">
          <h5 className="text-on-surface font-medium mb-4">Garden Progress</h5>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">Inner Calm</span>
              <span className="text-primary">82%</span>
            </div>
            <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '82%' }} />
            </div>
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-on-surface-variant">Clarity</span>
              <span className="text-secondary">64%</span>
            </div>
            <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: '64%' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
