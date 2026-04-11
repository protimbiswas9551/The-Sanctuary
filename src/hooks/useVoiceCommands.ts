import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface VoiceCommandsProps {
  onSendMessage: (message: string) => void;
}

export function useVoiceCommands({ onSendMessage }: VoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigate = useNavigate();

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const currentTranscript = event.results[0][0].transcript.toLowerCase();
      setTranscript(currentTranscript);
      handleCommand(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [navigate, onSendMessage]);

  const handleCommand = (text: string) => {
    // Navigation commands
    if (text.includes('go to') || text.includes('navigate to') || text.includes('open')) {
      if (text.includes('journal') || text.includes('mood')) {
        navigate('/journal');
        return;
      }
      if (text.includes('notes')) {
        navigate('/notes');
        return;
      }
      if (text.includes('garden') || text.includes('voice')) {
        navigate('/garden');
        return;
      }
      if (text.includes('home') || text.includes('landing')) {
        navigate('/');
        return;
      }
      if (text.includes('chat') || text.includes('reflect')) {
        navigate('/reflect');
        return;
      }
    }

    // Send message command
    if (text.startsWith('send ')) {
      const message = text.replace('send ', '').trim();
      if (message) {
        onSendMessage(message);
        return;
      }
    }

    // Default: just send the whole transcript if it doesn't match a command but sounds like a message
    // Or maybe we just want to populate the input field? 
    // The user specifically asked to "send messages", so I'll implement a "send" prefix or just send if it's not a command.
    // Let's be a bit smarter: if it's not a navigation command, treat it as a message to be sent.
    onSendMessage(text);
  };

  return {
    isListening,
    transcript,
    startListening,
  };
}
