import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Wind, BookOpen, Brain, NotebookPen, Flower2, Bell, Settings, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const navItems = [
  { name: 'Breathe', path: '/', icon: Wind },
  { name: 'Journal', path: '/journal', icon: BookOpen },
  { name: 'Reflect', path: '/reflect', icon: Brain },
  { name: 'Notes', path: '/notes', icon: NotebookPen },
  { name: 'Garden', path: '/garden', icon: Flower2 },
];

export function Navbar() {
  const location = useLocation();
  const isLanding = location.pathname === '/' && !location.hash; // Simplified check

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-500",
      "bg-emerald-950/40 backdrop-blur-md border-b border-white/5"
    )}>
      <div className="flex justify-between items-center px-6 md:px-12 h-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-100 tracking-tighter font-serif">The Sanctuary</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "text-sm uppercase tracking-widest transition-all duration-300 pb-1 border-b-2",
                isActive 
                  ? "text-emerald-300 border-emerald-400" 
                  : "text-emerald-100/60 border-transparent hover:text-emerald-200"
              )}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => alert('No new notifications in your sanctuary.')}
            className="p-2 text-emerald-100/60 hover:text-emerald-200 transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={() => alert('Settings will be available in the full release.')}
            className="p-2 text-emerald-100/60 hover:text-emerald-200 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full border border-emerald-400/20 overflow-hidden ml-2 cursor-pointer hover:ring-2 hover:ring-emerald-400/50 transition-all">
            <img 
              src="https://picsum.photos/seed/sanctuary-user/100/100" 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-emerald-950/80 backdrop-blur-2xl rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center transition-all duration-300 px-4 py-2 rounded-full",
            isActive 
              ? "bg-emerald-500/20 text-emerald-300" 
              : "text-emerald-100/40"
          )}
        >
          <item.icon className="w-6 h-6" />
          <span className="text-[10px] uppercase tracking-widest mt-1 font-bold">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}
