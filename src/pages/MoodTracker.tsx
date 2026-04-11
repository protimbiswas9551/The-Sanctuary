import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ear, Flower2, Brain, Tag, X, Filter, Sparkles, RefreshCw, Loader2, Mic, MicOff, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Wind, Image as ImageIcon, Bell, Lightbulb } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import BreathingExercise from '../components/BreathingExercise';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';

interface JournalEntry {
  id: number;
  text: string;
  date: string;
  mood: string;
  tags: string[];
  reactions?: { [emoji: string]: number };
}

const REACTION_EMOJIS = ['❤️', '🫂', '🌱', '✨', '🙏'];
const PREDEFINED_TAGS = ['work', 'relationships', 'self-care', 'health', 'growth', 'other'];
const MOODS = [
  { label: 'Peaceful', emoji: '🌿' },
  { label: 'Anxious', emoji: '☁️' },
  { label: 'Grateful', emoji: '✨' },
  { label: 'Sad', emoji: '💧' },
  { label: 'Energized', emoji: '🔥' },
  { label: 'Reflective', emoji: '🌙' }
];

export default function MoodTracker() {
  const [entry, setEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBreathing, setShowBreathing] = useState(false);

  const { isListening, startListening } = useVoiceCommands({
    onSendMessage: (text) => {
      setEntry(prev => prev ? `${prev} ${text}` : text);
    }
  });

  // Load entries on mount
  useEffect(() => {
    const entries = JSON.parse(localStorage.getItem('sanctuary_entries') || '[]');
    setSavedEntries(entries);
  }, []);

  const handleRootThought = () => {
    if (!entry.trim() || !selectedMood) return;
    
    setIsSaving(true);
    
    const newEntry: JournalEntry = {
      id: Date.now(),
      text: entry,
      date: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }),
      mood: selectedMood,
      tags: selectedTags
    };
    
    const updatedEntries = [newEntry, ...savedEntries];
    localStorage.setItem('sanctuary_entries', JSON.stringify(updatedEntries));
    setSavedEntries(updatedEntries);
    
    setTimeout(() => {
      setEntry('');
      setSelectedMood(null);
      setSelectedTags([]);
      setIsSaving(false);
      alert('Your thought has been rooted in the garden.');
    }, 800);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleReaction = (entryId: number, emoji: string) => {
    const updatedEntries = savedEntries.map(entry => {
      if (entry.id === entryId) {
        const currentReactions = entry.reactions || {};
        const newCount = (currentReactions[emoji] || 0) + 1;
        return {
          ...entry,
          reactions: {
            ...currentReactions,
            [emoji]: newCount
          }
        };
      }
      return entry;
    });
    
    setSavedEntries(updatedEntries);
    localStorage.setItem('sanctuary_entries', JSON.stringify(updatedEntries));
  };

  const generatePrompts = async () => {
    setIsLoadingPrompts(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const recentContext = savedEntries
        .slice(0, 5)
        .map(e => `Mood: ${e.mood}, Text: ${e.text.substring(0, 100)}...`)
        .join('\n');

      const currentMoodContext = selectedMood ? `The user is currently feeling ${selectedMood}.` : "The user hasn't selected a mood yet.";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on the user's recent journaling history and current mood, suggest 3 personalized, deep, and therapeutic journaling prompts.
        
        Recent Context:
        ${recentContext}
        
        Current Context:
        ${currentMoodContext}
        
        Return the prompts as a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const generatedPrompts = JSON.parse(response.text || '[]');
      setPrompts(generatedPrompts);
    } catch (error) {
      console.error("Error generating prompts:", error);
      setPrompts([
        "What is one small thing that brought you peace today?",
        "How does your current environment reflect your inner state?",
        "If your mood was a landscape, what would it look like?"
      ]);
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const handleGenerateInsight = async () => {
    if (!entry.trim()) {
      alert("Please write something first so I can generate an insight.");
      return;
    }
    
    setIsGeneratingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `The user just wrote this in their journal: "${entry}". 
        Provide a single, short (1-2 sentences), deeply insightful, and compassionate reflection or perspective on what they wrote. 
        Focus on emotional intelligence and mindfulness.`
      });
      
      const insight = response.text;
      if (insight) {
        alert(`Insight: ${insight}`);
      }
    } catch (error) {
      console.error("Error generating insight:", error);
      alert("The garden is quiet right now. Try again in a moment.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const handleAddPhoto = () => {
    alert("Photo integration would allow you to upload a visual memory to this entry. (Feature coming soon)");
  };

  const handleSetReminder = () => {
    alert("Reminder set! We'll nudge you to check back on this thought later.");
  };

  useEffect(() => {
    if (savedEntries.length > 0) {
      generatePrompts();
    } else {
      setPrompts([
        "What's on your mind today?",
        "How are you feeling in this moment?",
        "What's one thing you're grateful for?"
      ]);
    }
  }, [selectedMood]);

  const filteredEntries = filterTag 
    ? savedEntries.filter(e => e.tags?.includes(filterTag))
    : savedEntries;

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
            <div className="relative">
              <textarea 
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl text-on-surface placeholder:text-on-surface-variant/30 min-h-[150px] resize-none custom-scrollbar pr-12"
                placeholder="Begin typing softly..."
              />
              <button 
                onClick={startListening}
                className={`absolute right-0 top-0 p-3 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 animate-pulse' 
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-highest'
                }`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddPhoto}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-highest/40 border border-outline-variant/10 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest/60 transition-all text-xs font-medium"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Add Photo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSetReminder}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-highest/40 border border-outline-variant/10 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest/60 transition-all text-xs font-medium"
              >
                <Bell className="w-3.5 h-3.5" />
                Set Reminder
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateInsight}
                disabled={isGeneratingInsight}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold"
              >
                {isGeneratingInsight ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lightbulb className="w-3.5 h-3.5" />
                )}
                Generate Insight
              </motion.button>
            </div>

            {/* Mood Selection */}
            <div className="mt-6">
              <label className="flex items-center gap-2 text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-3">
                <Flower2 className="w-3 h-3" />
                Current Weather
              </label>
              <div className="flex flex-wrap gap-3">
                {MOODS.map(mood => (
                  <motion.button
                    key={mood.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(mood.label)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all border ${
                      selectedMood === mood.label
                        ? 'bg-primary/20 border-primary ring-2 ring-primary/20'
                        : 'bg-surface-container-highest/30 border-transparent hover:bg-surface-container-highest/60'
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-tighter ${selectedMood === mood.label ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {mood.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tag Selection */}
            <div className="mt-6">
              <label className="flex items-center gap-2 text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-3">
                <Tag className="w-3 h-3" />
                Tag this thought
              </label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map(tag => (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      selectedTags.includes(tag)
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-surface-container-highest/50 border-transparent text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end items-center gap-4">
              {!selectedMood && entry.trim() && (
                <span className="text-[10px] text-red-400/60 uppercase tracking-widest font-bold animate-pulse">
                  Please select a mood
                </span>
              )}
              <motion.button 
                onClick={handleRootThought}
                disabled={isSaving || !entry.trim() || !selectedMood}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-gradient-to-r from-primary to-secondary text-on-primary px-8 py-3 rounded-full font-bold tracking-tight shadow-xl shadow-primary/10 transition-opacity flex items-center gap-2 ${isSaving || !entry.trim() || !selectedMood ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rooting...</span>
                  </>
                ) : (
                  'Root this thought'
                )}
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

        {/* Personalized Prompts */}
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
          <div className="botanical-grain absolute inset-0 opacity-20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <label className="text-secondary text-[10px] uppercase tracking-widest font-bold">Personalized Prompts</label>
              </div>
              <button 
                onClick={generatePrompts}
                disabled={isLoadingPrompts}
                className="p-2 rounded-full hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              >
                {isLoadingPrompts ? (
                  <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-on-surface-variant" />
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {prompts.map((prompt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setEntry(prev => prev ? `${prev}\n\n${prompt}` : prompt)}
                  className="text-left p-4 rounded-2xl bg-surface-container-highest/30 hover:bg-surface-container-highest/60 border border-outline-variant/5 transition-all group"
                >
                  <p className="text-on-surface text-sm leading-relaxed group-hover:text-primary transition-colors">
                    {prompt}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reflections */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <label className="text-secondary text-[10px] uppercase tracking-widest font-bold">Recent Reflections</label>
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-on-surface-variant" />
              <select 
                value={filterTag || ''} 
                onChange={(e) => setFilterTag(e.target.value || null)}
                className="bg-transparent border-none text-[10px] uppercase tracking-widest font-bold text-on-surface-variant focus:ring-0 cursor-pointer"
              >
                <option value="">All Tags</option>
                {PREDEFINED_TAGS.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredEntries.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-12 text-center glass-panel rounded-2xl"
                >
                  <p className="text-on-surface-variant italic text-sm">No reflections found in this corner of the garden.</p>
                </motion.div>
              ) : (
                filteredEntries.map((entry) => (
                  <motion.div 
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    className="glass-panel p-6 rounded-2xl border border-outline-variant/10 group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                        {entry.mood}
                      </span>
                      <span className="text-on-surface-variant text-[10px] uppercase tracking-widest">{entry.date}</span>
                    </div>
                    <p className="text-on-surface text-sm mb-4 line-clamp-3 leading-relaxed">{entry.text}</p>
                    
                    <div className="flex flex-col gap-4 mt-auto">
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map(tag => (
                            <span key={tag} className="text-[9px] text-secondary font-bold uppercase tracking-tighter bg-secondary/5 px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/5">
                        {REACTION_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReaction(entry.id, emoji);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-container-highest/20 hover:bg-surface-container-highest/50 transition-colors group/emoji"
                          >
                            <span className="text-xs group-hover/emoji:scale-125 transition-transform">{emoji}</span>
                            {entry.reactions?.[emoji] && (
                              <span className="text-[9px] font-bold text-on-surface-variant">
                                {entry.reactions[emoji]}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Side Navigation/Actions */}
      <section className="lg:col-span-4 flex flex-col gap-6 relative z-10">
        <AnimatePresence>
          {showBreathing && (
            <BreathingExercise onClose={() => setShowBreathing(false)} />
          )}
        </AnimatePresence>

        {/* Botanical Calendar */}
        <div className="glass-panel rounded-3xl p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <h4 className="text-on-surface font-medium text-sm uppercase tracking-widest">Garden Calendar</h4>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-center mb-4">
            <span className="text-on-surface font-serif italic text-lg">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <div key={`${day}-${idx}`} className="text-[10px] font-bold text-on-surface-variant/40 text-center py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const monthStart = startOfMonth(currentMonth);
              const monthEnd = endOfMonth(monthStart);
              const startDate = startOfWeek(monthStart);
              const endDate = endOfWeek(monthEnd);
              const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

              return calendarDays.map((day, idx) => {
                const entryOnDay = savedEntries.find(e => {
                  // Simple date matching for demo, ideally store ISO strings
                  const entryDate = new Date(e.id);
                  return isSameDay(entryDate, day);
                });

                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative aspect-square flex items-center justify-center rounded-xl text-[11px] transition-all
                      ${!isCurrentMonth ? 'text-on-surface-variant/10' : 'text-on-surface'}
                      ${isSelected ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'hover:bg-surface-container-highest'}
                      ${isTodayDate && !isSelected ? 'border border-primary/30 text-primary' : ''}
                    `}
                  >
                    {format(day, 'd')}
                    {entryOnDay && !isSelected && (
                      <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-secondary animate-pulse" />
                    )}
                  </motion.button>
                );
              });
            })()}
          </div>

          <div className="mt-6 pt-6 border-t border-outline-variant/5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
              <span>Selected Day</span>
              <span className="text-primary">{format(selectedDate, 'MMM d, yyyy')}</span>
            </div>
            <p className="mt-2 text-xs text-on-surface-variant italic leading-relaxed">
              {savedEntries.some(e => isSameDay(new Date(e.id), selectedDate))
                ? "You rooted a thought on this day. The garden remembers."
                : "A quiet day in the garden. Perhaps time for a new reflection?"}
            </p>
          </div>
        </div>

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
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center mx-auto">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-primary/20 rounded-full" 
            />
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary">
              <Wind className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-on-surface font-semibold mb-1 text-center">Need a Breath?</h3>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed text-center">A quick reset to center your focus.</p>
          <button 
            onClick={() => setShowBreathing(true)}
            className="w-full py-3 rounded-xl bg-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-widest hover:bg-surface-bright transition-colors"
          >
            Start Exercise
          </button>
        </div>

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
