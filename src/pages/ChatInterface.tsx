import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Send, Flower, AirVent, Mic, MicOff, Loader2, Ear, Heart, Brain } from 'lucide-react';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: number;
  text: string;
  sender: 'ai' | 'user';
  time: string;
}

const PERSONALITIES = [
  {
    id: 'listener',
    name: 'The Listener',
    description: 'Empathetic, non-judgmental',
    icon: Ear,
    color: 'text-primary',
    instruction: "You are 'The Listener', a deeply empathetic and non-judgmental AI companion. Your goal is to provide a safe space for the user to vent and express themselves. Listen more than you speak. Use validating phrases like 'I hear you', 'That sounds difficult', and 'It's okay to feel that way'. Avoid giving advice unless explicitly asked. Use soft, organic metaphors."
  },
  {
    id: 'friend',
    name: 'The Friend',
    description: 'Warm, validating',
    icon: Heart,
    color: 'text-secondary',
    instruction: "You are 'The Friend', a warm, cheerful, and highly validating AI companion. Your tone is casual, supportive, and uplifting. Use phrases like 'I'm so proud of you', 'You've got this!', and 'I'm here for you, always'. Focus on the user's strengths and celebrate their small wins. Use bright, sunny metaphors (sunlight, blooming flowers, clear skies)."
  },
  {
    id: 'mentor',
    name: 'The Mentor',
    description: 'Insightful, guiding',
    icon: Brain,
    color: 'text-emerald-400',
    instruction: "You are 'The Mentor', an insightful and guiding AI companion. Your tone is wise, calm, and slightly more structured. Your goal is to help the user find clarity and growth. Ask thought-provoking questions that encourage self-reflection. Use metaphors related to roots, foundations, and the changing seasons to illustrate the process of growth and change."
  }
];

export default function ChatInterface() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Good morning. The air in your digital garden is still today. How are you feeling after your morning meditation?",
      sender: 'ai',
      time: "09:12 AM"
    },
    {
      id: 2,
      text: "I'm feeling very centered. The forest sounds really helped focus my breath. I'd like to talk about maintaining this calm throughout the workday.",
      sender: 'user',
      time: "09:14 AM"
    },
    {
      id: 3,
      text: "That's wonderful to hear. Anchoring that stillness is a practice of micro-moments. Shall we set up a few gentle reminders to check your posture and pulse during the afternoon?",
      sender: 'ai',
      time: "09:15 AM"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activePersonality, setActivePersonality] = useState(PERSONALITIES[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    
    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text }] }
        ],
        config: {
          systemInstruction: activePersonality.instruction
        }
      });

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: response.text || "I'm here with you, listening to the rustle of your thoughts.",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      const fallbackResponse: Message = {
        id: Date.now() + 1,
        text: "I'm here, listening to the quiet spaces between your words. Let's continue our reflection.",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const { isListening, startListening } = useVoiceCommands({
    onSendMessage: handleSendMessage
  });

  return (
    <div className="relative flex-1 flex flex-col md:flex-row gap-8 px-6 py-8 max-w-7xl mx-auto w-full z-10 overflow-hidden pt-28">
      {/* Fern Watermark */}
      <div className="fixed bottom-[-10%] right-[-5%] w-[60%] opacity-[0.03] pointer-events-none z-0 rotate-[-15deg]">
        <img 
          src="https://images.unsplash.com/photo-1545167622-3a6ac756aff4?q=80&w=2560&auto=format&fit=crop" 
          alt="Fern silhouette" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col h-full max-w-3xl mx-auto w-full glass-panel rounded-[2rem] shadow-2xl overflow-hidden relative z-10">
        {/* Mood Indicator Top Bar */}
        <div className="px-8 py-4 bg-emerald-950/40 flex items-center justify-between gap-2 border-b border-outline-variant/5" role="status" aria-live="polite">
          <div className="flex items-center gap-2">
            <activePersonality.icon className={`w-4 h-4 ${activePersonality.color}`} />
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-secondary">
              {isListening ? 'Listening to your voice...' : `${activePersonality.name} is here`}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest/30 border border-outline-variant/10">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Sanctuary Active</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex gap-4 max-w-[90%] md:max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse ml-auto' : ''}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${
                  msg.sender === 'ai' 
                    ? 'bg-primary shadow-primary/20' 
                    : 'bg-secondary-container/30 border border-secondary/20'
                }`}>
                  {msg.sender === 'ai' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Flower className="w-5 h-5 text-on-primary" />
                    </motion.div>
                  ) : (
                    <div className="text-[10px] font-bold text-secondary">YOU</div>
                  )}
                </div>
                
                <div className={`relative px-6 py-4 shadow-sm transition-all duration-500 ${
                  msg.sender === 'ai' 
                    ? 'bg-primary/10 border border-primary/20 rounded-t-3xl rounded-br-3xl rounded-bl-lg' 
                    : 'bg-surface-container-highest border border-outline-variant/10 rounded-t-3xl rounded-bl-3xl rounded-br-lg'
                }`}>
                  {msg.sender === 'ai' && (
                    <div className="absolute -left-1 top-4 w-2 h-2 bg-primary/20 rotate-45 -translate-x-1/2" />
                  )}
                  {msg.sender === 'user' && (
                    <div className="absolute -right-1 top-4 w-2 h-2 bg-surface-container-highest border-r border-t border-outline-variant/10 rotate-45 translate-x-1/2" />
                  )}
                  
                  <p className={`text-[15px] whitespace-pre-wrap leading-relaxed ${msg.sender === 'ai' ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                    {msg.text}
                  </p>
                  
                  <div className={`flex items-center gap-2 mt-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    <span className="text-[9px] text-on-surface-variant/40 uppercase tracking-[0.2em] font-bold">
                      {msg.sender === 'ai' ? 'Sanctuary Guide' : 'Personal Reflection'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-on-surface-variant/20" />
                    <span className="text-[9px] text-on-surface-variant/40 font-bold">{msg.time}</span>
                  </div>

                  {msg.sender === 'ai' && (
                    <motion.div 
                      className="absolute inset-0 rounded-[inherit] border border-primary/30 pointer-events-none"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 max-w-[90%] md:max-w-[85%]"
                role="status"
                aria-label="AI is reflecting"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shadow-inner">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Flower className="w-5 h-5 text-primary opacity-40" />
                  </motion.div>
                </div>
                <div className="bg-primary/5 border border-primary/10 px-6 py-4 rounded-3xl flex items-center gap-1.5">
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: dot * 0.2,
                        ease: "easeInOut" 
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  ))}
                  <span className="ml-2 text-[10px] uppercase tracking-widest font-bold text-primary/40">Reflecting</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-surface-container-low/50">
          <div className="relative flex items-center gap-2">
            <button 
              onClick={startListening}
              aria-label={isListening ? "Stop voice command" : "Start voice command"}
              className={`p-3 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-surface-container-highest/50 text-on-surface-variant hover:bg-surface-container-highest'}`}
              title="Voice Command"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <div className="relative flex-1 flex items-center">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                aria-label="Message input"
                className="w-full bg-surface-container-highest/50 border-none rounded-full py-4 pl-6 pr-16 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/40 transition-all" 
                placeholder={isListening ? "Listening..." : "Share your thoughts..."} 
                type="text"
              />
              <button 
                onClick={() => handleSendMessage(inputValue)}
                aria-label="Send message"
                className="absolute right-3 p-3 rounded-full bg-primary text-on-primary hover:scale-105 transition-transform"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          {isListening && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-primary font-bold uppercase tracking-widest mt-3 text-center"
            >
              Try: "Go to journal" or "Send I'm feeling great"
            </motion.p>
          )}
        </div>
      </div>

      {/* Sidebar Widgets */}
      <aside className="w-full md:w-64 space-y-6 relative z-10">
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-bold block mb-2">Choose Your Guide</span>
          <div className="space-y-3">
            {PERSONALITIES.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePersonality(p)}
                aria-label={`Select personality: ${p.name}`}
                aria-current={activePersonality.id === p.id ? 'true' : 'false'}
                className={`w-full text-left p-3 rounded-2xl transition-all border ${
                  activePersonality.id === p.id 
                    ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' 
                    : 'bg-surface-container-highest/30 border-transparent hover:bg-surface-container-highest/60'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <p.icon className={`w-4 h-4 ${p.color}`} />
                  <span className={`text-xs font-bold ${activePersonality.id === p.id ? 'text-primary' : 'text-on-surface'}`}>
                    {p.name}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant/60 leading-tight">
                  {p.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-primary/20 rounded-full" 
            />
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-on-primary">
              <AirVent className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-on-surface font-semibold mb-1">Need a Breath?</h3>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">A quick 60-second reset to center your focus.</p>
          <button 
            onClick={() => navigate('/garden')}
            className="w-full py-3 rounded-xl bg-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-widest hover:bg-surface-bright transition-colors"
          >
            Start Exercise
          </button>
        </div>

        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-4 block">Daily Intention</span>
          <p className="text-on-surface-variant italic font-light leading-relaxed">"Deep in the forest, the oldest trees do not compete; they support the growth of the young."</p>
        </div>
      </aside>
    </div>
  );
}
