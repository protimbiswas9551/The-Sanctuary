import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Music, Play, Pause, Home, Volume2, VolumeX, ChevronDown, ChevronUp, Leaf, Waves, CloudRain, Sparkles, Bird, Sun, Moon, Wind } from 'lucide-react';

const TRACKS = [
  { 
    id: 'zen', 
    name: 'Zen Garden', 
    desc: 'Soft ambient melodies for deep focus.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    icon: Sparkles,
    color: 'text-primary'
  },
  { 
    id: 'forest', 
    name: 'Morning Forest', 
    desc: 'Stable ambient sounds for relaxation.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    icon: Leaf,
    color: 'text-emerald-400'
  },
  { 
    id: 'birds', 
    name: 'Bird Sanctuary', 
    desc: 'Cheerful chirping and morning songs.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    icon: Bird,
    color: 'text-yellow-400'
  },
  { 
    id: 'meadow', 
    name: 'Peaceful Meadow', 
    desc: 'Gentle breeze through the wildflowers.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    icon: Sun,
    color: 'text-orange-400'
  },
  { 
    id: 'ocean', 
    name: 'Ocean Waves', 
    desc: 'Rhythmic tides for peaceful sleep.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    icon: Waves,
    color: 'text-blue-400'
  },
  { 
    id: 'rain', 
    name: 'Soft Rainfall', 
    desc: 'Gentle rain for a calm mind.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    icon: CloudRain,
    color: 'text-indigo-400'
  },
  { 
    id: 'crickets', 
    name: 'Evening Crickets', 
    desc: 'The soothing sounds of a summer night.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    icon: Moon,
    color: 'text-purple-400'
  },
  { 
    id: 'stream', 
    name: 'Mountain Stream', 
    desc: 'Crystal clear water flowing over stones.',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    icon: Wind,
    color: 'text-cyan-400'
  }
];

export default function VoiceInterface() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const [showMenu, setShowMenu] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(8).fill(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setupAudioContext = () => {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass) return;
          
          audioContextRef.current = new AudioContextClass();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          analyserRef.current.smoothingTimeConstant = 0.8;
          
          // NOTE: We are NOT connecting the audio element to the AudioContext here.
          // Connecting a cross-origin audio element to an AudioContext without proper CORS
          // headers often results in silence. Instead, we let the audio element play
          // directly to the speakers and use simulated data for the visualizer.
        }
        
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } catch (err) {
        console.warn("AudioContext setup failed:", err);
      }
    };

    const updateVisualizer = () => {
      let currentAmplitude = 0;
      let currentFrequencies = new Array(8).fill(0);
      
      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate amplitude
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        currentAmplitude = Math.min(average / 128, 1);

        // Extract 8 frequency bands for the UI
        const step = Math.floor(bufferLength / 8);
        for (let i = 0; i < 8; i++) {
          let bandSum = 0;
          for (let j = 0; j < step; j++) {
            bandSum += dataArray[i * step + j];
          }
          currentFrequencies[i] = (bandSum / step) / 255;
        }
      }

      // Fallback to simulated data if real data is blocked or silent
      if (currentAmplitude === 0 && isPlaying) {
        currentAmplitude = 0.1 + Math.sin(Date.now() / 500) * 0.05;
        currentFrequencies = currentFrequencies.map((_, i) => 
          0.2 + Math.sin((Date.now() + i * 200) / 400) * 0.15
        );
      }
      
      setAmplitude(currentAmplitude);
      setFrequencyData(currentFrequencies);
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    if (isPlaying) {
      // Try to setup visualizer, but don't let it block playback
      setupAudioContext();
      
      setIsLoading(true);
      setError(null);
      
      if (audio) {
        audio.volume = volume;
        audio.muted = isMuted;
        console.log("Audio State:", { volume: audio.volume, muted: audio.muted, src: audio.src });
      }

      console.log("Attempting to play:", currentTrack.url);
      audio.volume = volume;
      audio.muted = false;
      
      audio.play().then(() => {
        console.log("Playback started successfully");
        setIsLoading(false);
        updateVisualizer();
      }).catch(err => {
        console.error("Playback failed:", err);
        if (err.name !== 'AbortError') {
          setError("Playback blocked. Please tap 'Enter Soundscape' again.");
          setIsPlaying(false);
        }
        setIsLoading(false);
      });
    } else {
      audio.pause();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAmplitude(0);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTrack]);

  // Global cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const selectTrack = (track: typeof TRACKS[0]) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load(); // Force reload the element
    }
    setCurrentTrack(track);
    setShowMenu(false);
    setIsPlaying(true);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center botanical-glow overflow-y-auto pt-32 pb-12">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        loop
        preload="auto"
        muted={false}
        autoPlay={false}
        controls={debugMode}
        className={debugMode ? "fixed bottom-4 left-4 z-[100] bg-white rounded-lg" : "absolute opacity-0 pointer-events-none"}
        onLoadStart={() => {
          setIsLoading(true);
          setError(null);
        }}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onCanPlay={() => {
          setIsLoading(false);
          if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(err => console.error("Auto-play failed:", err));
          }
        }}
        onError={(e) => {
          const audioErr = (e.target as HTMLAudioElement).error;
          console.error("Audio error:", {
            code: audioErr?.code,
            message: audioErr?.message,
            track: currentTrack.name,
            url: currentTrack.url
          });
          
          let errorMessage = "The audio track could not be loaded.";
          if (audioErr?.code === 4) errorMessage = "The audio format is not supported or the link is broken.";
          
          setError(errorMessage);
          setIsPlaying(false);
          setIsLoading(false);
        }}
      />
      {/* Ambient Light Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-container blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-secondary-container/20 blur-[100px]" />
      </div>

      {/* Centered Interaction Group */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 max-w-3xl w-full px-6 text-center">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 text-primary"
          >
            <currentTrack.icon className={`w-6 h-6 ${currentTrack.color}`} />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">The Soundscape Garden</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif italic text-on-surface">
            {isPlaying ? currentTrack.name : "Quiet Sanctuary"}
          </h1>
          <div className="h-12 flex flex-col items-center justify-center">
            {error ? (
              <p className="text-red-400 text-sm font-medium animate-pulse">{error}</p>
            ) : isLoading ? (
              <p className="text-primary text-sm font-medium animate-pulse">Cultivating your soundscape...</p>
            ) : (
              <p className="text-on-surface-variant max-w-md mx-auto leading-relaxed">
                {isPlaying 
                  ? currentTrack.desc
                  : "Find your center in the silence. Tap to begin the soundscape."}
              </p>
            )}
          </div>
        </div>

        {/* Track Selection Menu */}
        <div className="relative w-full max-w-xs">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            aria-expanded={showMenu}
            aria-haspopup="listbox"
            aria-label="Select soundscape"
            className="w-full flex items-center justify-between px-6 py-3 rounded-2xl bg-surface-container-low/60 backdrop-blur-xl border border-outline-variant/20 text-on-surface hover:bg-surface-container-low transition-all"
          >
            <div className="flex items-center gap-3">
              <currentTrack.icon className={`w-4 h-4 ${currentTrack.color}`} />
              <span className="text-sm font-medium">{currentTrack.name}</span>
            </div>
            {showMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full mt-4 left-0 right-0 bg-surface-container-low/90 backdrop-blur-2xl border border-outline-variant/20 rounded-3xl p-3 shadow-2xl z-50 overflow-hidden"
              >
                <div className="botanical-grain absolute inset-0 opacity-10" />
                <div className="relative z-10 space-y-1 max-h-64 overflow-y-auto custom-scrollbar pr-1" role="listbox">
                  {TRACKS.map(track => (
                    <button
                      key={track.id}
                      onClick={() => selectTrack(track)}
                      role="option"
                      aria-selected={currentTrack.id === track.id}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${currentTrack.id === track.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-surface-container-highest/50'}`}
                    >
                      <div className={`p-2 rounded-full bg-surface-container-highest ${track.color}`}>
                        <track.icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-on-surface">{track.name}</div>
                        <div className="text-[10px] text-on-surface-variant/60 uppercase tracking-wider">{track.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative group">
          {/* Visualizer Rings */}
          <AnimatePresence>
            {isPlaying && (
              <>
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={`ring-${i}`}
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ 
                      opacity: isPlaying ? [0, 0.15 + (frequencyData[i % 8] || 0) * 0.2, 0] : 0,
                      scale: isPlaying ? [1, 1.4 + i * 0.3 + amplitude * 0.8, 2.2 + amplitude * 1.2] : 1,
                      borderWidth: isPlaying ? [`${1}px`, `${2 + amplitude * 4}px`, `${1}px`] : "1px"
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: 3.5 - amplitude * 1.5,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "easeOut"
                    }}
                    className="absolute inset-0 rounded-full border border-primary/40 pointer-events-none"
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* The Core Glowing Orb - Pulses with music */}
          <motion.div 
            animate={{ 
              scale: isPlaying ? [1, 1.02 + amplitude * 0.15, 1] : 1,
              boxShadow: isPlaying ? [
                `0 0 ${60 + amplitude * 40}px ${10 + amplitude * 30}px rgba(115, 219, 154, 0.1)`,
                `0 0 ${180 + amplitude * 120}px ${80 + amplitude * 100}px rgba(115, 219, 154, ${0.2 + amplitude * 0.3})`,
                `0 0 ${60 + amplitude * 40}px ${10 + amplitude * 30}px rgba(115, 219, 154, 0.1)`
              ] : "0 0 80px 20px rgba(115, 219, 154, 0.1)"
            }}
            transition={{ 
              duration: isPlaying ? 3 - amplitude * 1.5 : 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-emerald-900/20 flex items-center justify-center relative overflow-hidden border border-primary/30"
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

            {/* Subtle Wave Animation - Reacts to frequency data */}
            {isPlaying && (
              <div className="absolute inset-0 flex items-end justify-center opacity-30 pb-8">
                {frequencyData.map((val, i) => (
                  <motion.div
                    key={`wave-${i}`}
                    animate={{ 
                      height: [`${10 + val * 40}%`, `${30 + val * 60}%`, `${10 + val * 40}%`],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ 
                      duration: 0.5 + Math.random() * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-1.5 mx-1 bg-primary rounded-full shadow-[0_0_10px_rgba(115,219,154,0.5)]"
                  />
                ))}
              </div>
            )}

            <div className={`w-24 h-24 rounded-full bg-primary blur-3xl transition-opacity duration-1000 ${isPlaying ? 'opacity-60' : 'opacity-40'}`} />
            <div className="absolute inset-4 border border-primary/10 rounded-full" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPlaying ? 'playing' : 'paused'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-primary"
                >
                  {isPlaying ? <Music className="w-12 h-12 animate-pulse" /> : <Play className="w-12 h-12 opacity-20" />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-8 w-full max-w-md">
          {/* Timer and Progress */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/80 tracking-widest uppercase">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(currentTime / duration) * 100}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              />
            </div>
          </div>

          {/* Volume Slider */}
          <div className="w-full flex items-center gap-4 bg-surface-container-low/40 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/10">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              aria-label="Volume"
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="flex-1 h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-[10px] font-mono text-on-surface-variant/80 w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-3 px-12 py-4 rounded-full font-bold transition-all ${isPlaying ? 'bg-surface-container-highest text-on-surface' : 'bg-primary text-on-primary shadow-xl shadow-primary/20'}`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause Sanctuary
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Enter Soundscape
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const context = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
                const osc = context.createOscillator();
                const gain = context.createGain();
                osc.connect(gain);
                gain.connect(context.destination);
                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);
                osc.stop(context.currentTime + 0.5);
                console.log("Test beep triggered");
              }}
              className="p-4 rounded-full bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:text-primary transition-colors"
              title="Test System Sound"
            >
              <Volume2 className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const testAudio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
                testAudio.volume = 0.3;
                testAudio.play().catch(err => {
                  console.error("Test audio failed:", err);
                  setError("Browser blocked audio. Please click 'Enter Soundscape' first.");
                });
              }}
              className="p-4 rounded-full bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:text-primary transition-colors"
              title="Troubleshoot Sound"
            >
              <Music className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDebugMode(!debugMode)}
              className={`p-4 rounded-full border transition-colors ${debugMode ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:text-primary'}`}
              title="Toggle Debug Controls"
            >
              <Wind className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              aria-label="Return home"
              className="p-4 rounded-full bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:text-primary transition-colors"
            >
              <Home className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </main>
  );
}
