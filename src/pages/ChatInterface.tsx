import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Send, Flower, AirVent, Mic, MicOff } from 'lucide-react';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

interface Message {
  id: number;
  text: string;
  sender: 'ai' | 'user';
  time: string;
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    const newMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Mock AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: "I've heard you. Let's explore that further in our garden of thoughts.",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
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
        <div className="px-8 py-4 bg-emerald-950/40 flex items-center justify-center gap-2 border-b border-outline-variant/5">
          <Flower className="w-4 h-4 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-secondary">
            {isListening ? 'Listening to your voice...' : 'You seem calm today'}
          </span>
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
                  
                  <p className={`text-[15px] leading-relaxed ${msg.sender === 'ai' ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
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
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-surface-container-low/50">
          <div className="relative flex items-center gap-2">
            <button 
              onClick={startListening}
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
                className="w-full bg-surface-container-highest/50 border-none rounded-full py-4 pl-6 pr-16 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/40 transition-all" 
                placeholder={isListening ? "Listening..." : "Share your thoughts..."} 
                type="text"
              />
              <button 
                onClick={() => handleSendMessage(inputValue)}
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
