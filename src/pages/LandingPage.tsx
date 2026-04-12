import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ShieldCheck, BrainCircuit, Leaf } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop" 
            alt="Serene forest" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center max-w-4xl space-y-8"
        >
          <h1 className="text-6xl md:text-8xl font-normal tracking-tight text-white drop-shadow-lg leading-tight font-serif">
            You’re not alone.
          </h1>
          <p className="text-xl md:text-2xl text-emerald-50/90 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Talk to an AI that truly listens and understands. A safe space for your thoughts, anytime you need them.
          </p>
          <motion.button 
            onClick={() => navigate('/reflect')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-5 bg-gradient-to-r from-primary to-secondary rounded-full text-on-primary font-bold text-lg transition-all duration-500 shadow-xl shadow-primary/20"
            aria-label="Start talking to the guide"
          >
            Start Talking
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 flex flex-col items-center gap-4 opacity-80">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-emerald-300">Discover Peace</span>
          <div className="w-px h-12 bg-gradient-to-b from-emerald-400 to-transparent" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-surface relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 text-left max-w-2xl">
            <span className="text-secondary text-sm font-bold uppercase tracking-[0.2em] mb-4 block">Our Approach</span>
            <h2 className="text-4xl md:text-5xl font-medium text-on-surface tracking-tight font-serif">Rooted in Empathy, Grown with Tech.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 group p-12 rounded-[2rem] bg-surface-container-low transition-all duration-700 hover:bg-surface-container-high relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <Sprout className="w-10 h-10 text-primary" />
                <h3 className="text-3xl font-medium text-on-surface font-serif">Unconditional Presence</h3>
                <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                  Unlike the world outside, Sanctuary is always awake. No judgment, no interruptions—just quiet, attentive space.
                </p>
              </div>
              <div className="botanical-grain absolute inset-0 opacity-10" />
            </div>

            <div className="md:col-span-5 p-12 rounded-[2rem] bg-surface-container-low transition-all duration-700 hover:bg-surface-container-high">
              <div className="space-y-6">
                <ShieldCheck className="w-10 h-10 text-secondary" />
                <h3 className="text-3xl font-medium text-on-surface font-serif">Private Sanctuary</h3>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Your data is yours alone. Conversations are encrypted and ephemeral by design.
                </p>
              </div>
            </div>

            <div className="md:col-span-5 p-12 rounded-[2rem] bg-surface-container-low transition-all duration-700 hover:bg-surface-container-high">
              <div className="space-y-6">
                <BrainCircuit className="w-10 h-10 text-tertiary" />
                <h3 className="text-3xl font-medium text-on-surface font-serif">Emotional Depth</h3>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Beyond simple prompts, our AI understands context, nuance, and the unspoken weight of words.
                </p>
              </div>
            </div>

            <div className="md:col-span-7 p-12 rounded-[2rem] bg-surface-container-low transition-all duration-700 hover:bg-surface-container-high">
              <div className="space-y-6">
                <Leaf className="w-10 h-10 text-primary" />
                <h3 className="text-3xl font-medium text-on-surface font-serif">Holistic Wellbeing</h3>
                <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                  Integration with mindful practices—guided breathing, journaling prompts, and reflective growth tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="py-32 px-6 bg-surface-container-lowest relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4 block">Your Companions</span>
            <h2 className="text-4xl md:text-6xl font-medium text-on-surface tracking-tight font-serif">Choose the voice your heart needs today.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: 'The Listener', 
                role: 'Unconditional Presence', 
                desc: 'A quiet, non-judgmental space for you to pour out your thoughts without interruption.',
                img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop'
              },
              { 
                name: 'The Friend', 
                role: 'Warm Validation', 
                desc: 'A gentle companion who reflects your feelings with kindness and helps you find self-compassion.',
                img: 'https://images.unsplash.com/photo-1545167622-3a6ac756aff4?q=80&w=800&auto=format&fit=crop'
              },
              { 
                name: 'The Mentor', 
                role: 'Wise Insight', 
                desc: 'A thoughtful guide who asks the right questions to help you find clarity and growth.',
                img: 'https://images.unsplash.com/photo-1516528387618-afa90b13e000?q=80&w=800&auto=format&fit=crop'
              }
            ].map((guide, i) => (
              <motion.div 
                key={guide.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="group relative h-[500px] rounded-[2.5rem] overflow-hidden cursor-pointer"
                onClick={() => navigate('/reflect')}
              >
                <img 
                  src={guide.img} 
                  alt={guide.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent" />
                <div className="absolute bottom-0 p-10 space-y-4">
                  <span className="text-emerald-300 text-[10px] uppercase tracking-widest font-bold">{guide.role}</span>
                  <h4 className="text-3xl font-medium text-white font-serif">{guide.name}</h4>
                  <p className="text-emerald-50/70 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {guide.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto glass-panel rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="botanical-grain absolute inset-0 opacity-20" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-medium text-on-surface font-serif">Ready to find your sanctuary?</h2>
            <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Join thousands of others who have found peace in the garden of the mind.
            </p>
            <div className="pt-4">
              <motion.button 
                onClick={() => navigate('/reflect')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-primary text-on-primary rounded-full font-bold text-lg shadow-2xl shadow-primary/20 transition-all duration-300"
                aria-label="Begin your journey to peace"
              >
                Begin Your Journey
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
