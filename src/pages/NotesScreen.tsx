import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, Plus, Share2, Save, Bold, Italic, List, Quote, Image as ImageIcon, Edit3, Trash2, Eye, EyeOff, Mic, MicOff } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  time: string;
  content: string;
  excerpt: string;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTitle, setCurrentTitle] = useState('Untitled Reflection');
  const [currentContent, setCurrentContent] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('sanctuary_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse saved notes', e);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sanctuary_notes', JSON.stringify(notes));
  }, [notes]);

  // Cleanup voice recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSave = () => {
    if (!currentContent.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (activeNoteId) {
      // Update existing note
      setNotes(prev => prev.map(note => 
        note.id === activeNoteId 
          ? { 
              ...note, 
              title: currentTitle, 
              content: currentContent, 
              excerpt: currentContent.slice(0, 100) + (currentContent.length > 100 ? '...' : ''),
              time: timeStr
            } 
          : note
      ));
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: currentTitle || 'Untitled Reflection',
        time: timeStr,
        content: currentContent,
        excerpt: currentContent.slice(0, 100) + (currentContent.length > 100 ? '...' : '')
      };
      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
    }
    setLastSaved(timeStr);
  };

  // Autosave logic
  useEffect(() => {
    // Only autosave if there is content
    if (!currentContent.trim()) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000); // 2 second delay after typing

    return () => clearTimeout(timer);
  }, [currentTitle, currentContent]);

  // Periodic autosave (every 30 seconds) as a fallback
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentContent.trim()) {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentTitle, currentContent, activeNoteId]);

  const createNewNote = () => {
    setActiveNoteId(null);
    setCurrentTitle('Untitled Reflection');
    setCurrentContent('');
    setLastSaved(null);
  };

  const selectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setCurrentTitle(note.title);
    setCurrentContent(note.content);
    setLastSaved(note.time);
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      createNewNote();
    }
  };

  const formatText = (type: 'bold' | 'italic' | 'list' | 'quote' | 'image') => {
    if (isPreview) setIsPreview(false);
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    setCurrentContent(prev => {
      const selectedText = prev.substring(start, end);
      let textToInsert = '';
      let cursorOffset = 0;

      switch (type) {
        case 'bold':
          textToInsert = `**${selectedText || 'bold text'}**`;
          cursorOffset = selectedText ? 0 : 2;
          break;
        case 'italic':
          textToInsert = `*${selectedText || 'italic text'}*`;
          cursorOffset = selectedText ? 0 : 1;
          break;
        case 'list':
          const prefix = (start > 0 && prev[start - 1] !== '\n') ? '\n' : '';
          if (selectedText) {
            textToInsert = prefix + selectedText.split('\n').map(line => `- ${line}`).join('\n');
          } else {
            textToInsert = `${prefix}- list item`;
          }
          cursorOffset = 0;
          break;
        case 'quote':
          const qPrefix = (start > 0 && prev[start - 1] !== '\n') ? '\n' : '';
          textToInsert = `${qPrefix}> ${selectedText || 'quote'}`;
          cursorOffset = 0;
          break;
        case 'image':
          const url = prompt('Enter the image URL:', 'https://');
          if (url) {
            textToInsert = `![${selectedText || 'alt text'}](${url})`;
            cursorOffset = 0;
          } else {
            return prev;
          }
          break;
      }

      const updated = prev.substring(0, start) + textToInsert + prev.substring(end);
      
      // Focus and set selection after state update
      setTimeout(() => {
        textarea.focus();
        const newPos = start + textToInsert.length - cursorOffset;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);

      return updated;
    });
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const wordCount = currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0;
  const charCount = currentContent.length;

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log('Transcript:', transcript);

      // Command handling
      if (transcript.startsWith('bold ')) {
        const text = transcript.replace('bold ', '');
        setCurrentContent(prev => prev + ` **${text}**`);
      } else if (transcript.startsWith('italic ')) {
        const text = transcript.replace('italic ', '');
        setCurrentContent(prev => prev + ` *${text}*`);
      } else if (transcript.startsWith('list ')) {
        const text = transcript.replace('list ', '');
        setCurrentContent(prev => prev + `\n- ${text}`);
      } else if (transcript.startsWith('title ')) {
        const text = transcript.replace('title ', '');
        setCurrentTitle(text.charAt(0).toUpperCase() + text.slice(1));
      } else if (transcript === 'new note' || transcript === 'create new note') {
        createNewNote();
      } else if (transcript === 'save note' || transcript === 'save reflection') {
        handleSave();
      } else if (transcript === 'clear content') {
        setCurrentContent('');
      } else {
        // Default dictation
        setCurrentContent(prev => {
          const separator = prev.length > 0 && !prev.endsWith('\n') ? ' ' : '';
          return prev + separator + transcript.charAt(0).toUpperCase() + transcript.slice(1);
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="relative pt-20 min-h-screen flex overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2560&auto=format&fit=crop" 
          alt="Fern" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Sidebar */}
      <aside className="w-80 bg-surface-container-low z-10 hidden md:flex flex-col border-r border-outline-variant/10">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-bold tracking-[0.1em] text-secondary uppercase">Archive</span>
            <button 
              onClick={createNewNote}
              aria-label="Create new reflection"
              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4 h-4" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-highest border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary/40 placeholder:text-on-surface-variant/30" 
              placeholder="Search notes..." 
              type="text"
            />
          </div>
        </div>
        
        {/* Notes List - Styled as requested */}
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-3 pb-8 mt-2">
          <AnimatePresence mode="popLayout">
            {filteredNotes.length === 0 && (
              <motion.div 
                key="empty-garden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 px-6"
              >
                <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                  <Edit3 className="w-8 h-8 text-on-surface" />
                </div>
                <p className="text-on-surface-variant/60 text-sm font-medium italic">Your garden is quiet.</p>
                <p className="text-on-surface-variant/30 text-[10px] uppercase tracking-widest mt-2">Save a draft to begin</p>
              </motion.div>
            )}
            
            {filteredNotes.map((note) => (
              <motion.div 
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => selectNote(note)}
                role="button"
                aria-current={activeNoteId === note.id ? 'true' : 'false'}
                aria-label={`Select reflection: ${note.title}`}
                className={`group p-5 rounded-[1.5rem] transition-all duration-500 cursor-pointer relative overflow-hidden border ${
                  activeNoteId === note.id 
                    ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' 
                    : 'bg-surface-container-highest/30 border-transparent hover:bg-surface-container-highest/60 hover:border-outline-variant/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <h3 className={`font-serif text-base transition-colors duration-500 ${activeNoteId === note.id ? 'text-primary' : 'text-on-surface'}`}>
                    {note.title}
                  </h3>
                  <span className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-tighter">{note.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant/70 line-clamp-2 leading-relaxed relative z-10">
                  {note.excerpt || 'Empty reflection...'}
                </p>
                
                {/* Hover Decor */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <button 
                  onClick={(e) => deleteNote(note.id, e)}
                  aria-label={`Delete reflection: ${note.title}`}
                  className="absolute right-3 bottom-3 p-2 rounded-full bg-surface-container-low/0 group-hover:bg-surface-container-low/80 text-on-surface-variant/0 group-hover:text-red-400/60 hover:text-red-400 hover:scale-110 transition-all duration-300 z-20"
                  title="Remove from garden"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
            
            {filteredNotes.length > 0 && (
              <motion.div 
                key="clear-garden-action"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-8 pb-4 flex flex-col items-center gap-2"
              >
                {!showClearConfirm ? (
                  <button 
                    onClick={() => setShowClearConfirm(true)}
                    className="text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/30 hover:text-red-400/50 transition-colors duration-300"
                  >
                    Clear All Reflections
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                    <span className="text-[8px] uppercase tracking-widest font-bold text-red-400/80">Are you sure?</span>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          setNotes([]);
                          createNewNote();
                          setShowClearConfirm(false);
                        }}
                        className="text-[9px] font-bold text-red-400 hover:text-red-300"
                      >
                        YES
                      </button>
                      <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="text-[9px] font-bold text-on-surface-variant/40 hover:text-on-surface"
                      >
                        NO
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Editor Area */}
      <section className="flex-1 z-10 flex flex-col p-6 md:p-12 lg:px-24 overflow-y-auto custom-scrollbar">
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6"
        >
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 text-secondary text-[10px] font-bold tracking-[0.2em] uppercase">
              <Edit3 className="w-3 h-3" />
              {activeNoteId ? 'Editing Reflection' : 'Personal Draft'}
            </div>
            <input 
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-3xl md:text-5xl font-extrabold tracking-tighter text-on-surface leading-tight p-0 placeholder:text-on-surface-variant/20"
              placeholder="Title your thought..."
            />
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (currentContent.trim()) {
                  navigator.clipboard.writeText(`${currentTitle}\n\n${currentContent}`);
                  alert('Reflection copied to clipboard.');
                } else {
                  alert('Nothing to share yet.');
                }
              }}
              aria-label="Share this reflection"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-highest text-on-surface text-sm font-medium hover:bg-surface-bright transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button 
              onClick={handleSave}
              aria-label="Save this reflection"
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary text-sm font-bold shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </motion.header>

        <div className="flex-1 max-w-4xl w-full mx-auto bg-surface-container-low/40 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-outline-variant/10 flex flex-col">
          <div className="mb-8 flex gap-4 border-b border-outline-variant/10 pb-4 overflow-x-auto no-scrollbar items-center">
            <button 
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                isPreview 
                  ? 'bg-primary text-on-primary' 
                  : 'bg-surface-container-highest text-on-surface-variant hover:text-primary'
              }`}
            >
              {isPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {isPreview ? 'Edit' : 'Preview'}
            </button>
            <div className="w-px h-6 bg-outline-variant/20 mx-2" />
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => formatText('bold')}
              aria-label="Format Bold"
              className="text-on-surface-variant/80 hover:text-primary transition-colors p-2 hover:bg-surface-container-highest rounded-lg active:scale-90"
              title="Bold"
            >
              <Bold className="w-5 h-5" />
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => formatText('italic')}
              aria-label="Format Italic"
              className="text-on-surface-variant/80 hover:text-primary transition-colors p-2 hover:bg-surface-container-highest rounded-lg active:scale-90"
              title="Italic"
            >
              <Italic className="w-5 h-5" />
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => formatText('list')}
              aria-label="Format List"
              className="text-on-surface-variant/80 hover:text-primary transition-colors p-2 hover:bg-surface-container-highest rounded-lg active:scale-90"
              title="List"
            >
              <List className="w-5 h-5" />
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => formatText('quote')}
              aria-label="Format Quote"
              className="text-on-surface-variant/80 hover:text-primary transition-colors p-2 hover:bg-surface-container-highest rounded-lg active:scale-90"
              title="Quote"
            >
              <Quote className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-outline-variant/20 mx-2" />
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => formatText('image')}
              aria-label="Insert Image"
              className="text-on-surface-variant/80 hover:text-primary transition-colors p-2 hover:bg-surface-container-highest rounded-lg active:scale-90"
              title="Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-outline-variant/20 mx-2" />
            <button 
              onClick={toggleListening}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-surface-container-highest text-on-surface-variant hover:text-primary'
              }`}
              title={isListening ? 'Stop Listening' : 'Voice Dictation'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isListening ? 'Listening...' : 'Voice'}
            </button>
          </div>
          {isPreview ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar prose prose-invert prose-emerald max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {currentContent || '*No content to preview...*'}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea 
              ref={textareaRef}
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              className="w-full flex-1 bg-transparent border-none focus:ring-0 text-lg md:text-xl text-on-surface leading-relaxed placeholder:text-on-surface-variant/20 resize-none custom-scrollbar" 
              placeholder="Start typing your thoughts here..."
            />
          )}
        </div>

        <div className="mt-8 max-w-4xl w-full mx-auto flex items-center justify-between text-on-surface-variant/80 text-[10px] tracking-wider uppercase font-bold">
          <div className="flex items-center gap-6">
            <span>Words: {wordCount}</span>
            <span>Chars: {charCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(115,219,154,0.5)] ${lastSaved ? 'bg-primary animate-pulse' : 'bg-on-surface-variant/20'}`} />
            {lastSaved ? `Last saved at ${lastSaved}` : 'Drafting...'}
          </div>
        </div>
      </section>
    </div>
  );
}
