/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, MobileNav } from './components/Navigation';
import LandingPage from './pages/LandingPage';
import MoodTracker from './pages/MoodTracker';
import NotesScreen from './pages/NotesScreen';
import ChatInterface from './pages/ChatInterface';
import VoiceInterface from './pages/VoiceInterface';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/journal" element={<MoodTracker />} />
            <Route path="/reflect" element={<ChatInterface />} />
            <Route path="/notes" element={<NotesScreen />} />
            <Route path="/garden" element={<VoiceInterface />} />
          </Routes>
        </main>
        <MobileNav />
        
        {/* Footer */}
        <footer className="bg-emerald-950 pt-24 pb-32 px-8 border-t border-emerald-900/20 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 w-full mb-20">
            <div className="text-center space-y-4">
              <span className="font-bold text-emerald-100 text-2xl block font-serif">The Sanctuary</span>
              <p className="text-emerald-100/40 text-sm max-w-sm leading-relaxed mx-auto">
                Creating digital spaces for human flourishing. Bloom where you are planted.
              </p>
              <div className="flex justify-center gap-8 mt-6">
                <a href="#" className="text-emerald-100/40 hover:text-emerald-200 text-sm transition-colors">Privacy</a>
                <a href="#" className="text-emerald-100/40 hover:text-emerald-200 text-sm transition-colors">Terms</a>
                <a href="#" className="text-emerald-100/40 hover:text-emerald-200 text-sm transition-colors">Support</a>
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-emerald-900/20 text-center">
            <p className="text-[11px] text-emerald-100/40 leading-loose">
              <strong className="text-emerald-400 block mb-2 uppercase tracking-tighter">Therapy Disclaimer</strong>
              Sanctuary AI is a peer-support tool designed to provide emotional companionship and active listening. It is not a clinical medical device, a professional therapy service, or an emergency resource. If you are experiencing a mental health crisis, please contact your local emergency services or a certified crisis hotline immediately. Sanctuary AI does not provide medical diagnoses or treatment plans.
            </p>
          </div>
          <div className="mt-12 text-center text-sm text-emerald-100/40">
            © 2024 The Botanical Sanctuary. Bloom where you are planted.
          </div>
        </footer>
      </div>
    </Router>
  );
}

