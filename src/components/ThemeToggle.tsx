import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme, ThemePreference } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'detailed' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System (Auto)', icon: Monitor },
  ];

  if (variant === 'segmented') {
    return (
      <div
        className={`flex items-center rounded-xl p-1 border transition-all ${
          effectiveTheme === 'dark'
            ? 'bg-[#10141e]/90 border-[#222a3a]'
            : 'bg-slate-100 border-slate-200 shadow-inner'
        } ${className}`}
      >
        {options.map(opt => {
          const Icon = opt.icon;
          const isSelected = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono transition-all ${
                isSelected
                  ? effectiveTheme === 'dark'
                    ? 'text-amber-300 font-bold'
                    : 'text-amber-800 font-bold'
                  : effectiveTheme === 'dark'
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={`Switch to ${opt.label}`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeThemePill"
                  className={`absolute inset-0 rounded-lg shadow-sm ${
                    effectiveTheme === 'dark'
                      ? 'bg-[#1c2436] border border-amber-500/30'
                      : 'bg-white border border-amber-500/40 shadow-xs'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px] hidden sm:inline">{opt.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Quick toggle button with right-click / hover menu */}
      <motion.button
        id="theme-toggle-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-label={`Toggle theme (Current: ${theme}, Effective: ${effectiveTheme})`}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 ${
          effectiveTheme === 'dark'
            ? 'border-[#26334a] bg-[#121723]/90 text-amber-300 hover:border-amber-500/50 hover:bg-[#192233] hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            : 'border-slate-200 bg-white/90 text-amber-600 hover:border-amber-500/50 hover:bg-slate-50 shadow-sm hover:shadow-md'
        }`}
        title={`Current: ${theme === 'system' ? 'System Auto (' + effectiveTheme + ')' : effectiveTheme}. Click to switch, right-click for full menu.`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {effectiveTheme === 'dark' ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small badge if set to system */}
        {theme === 'system' && (
          <span
            className={`absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[8px] font-mono font-bold ${
              effectiveTheme === 'dark'
                ? 'border-[#121723] bg-amber-500 text-slate-950'
                : 'border-white bg-amber-600 text-white'
            }`}
            title="Auto System Mode Active"
          >
            A
          </span>
        )}
      </motion.button>

      {/* Popover options menu for explicitly selecting System, Light, or Dark */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 mt-2 w-44 rounded-xl border p-1.5 shadow-2xl z-50 backdrop-blur-xl ${
              effectiveTheme === 'dark'
                ? 'border-[#26334a] bg-[#0c1017]/95 text-slate-200'
                : 'border-slate-200 bg-white/95 text-slate-800 shadow-xl'
            }`}
          >
            <div className="px-2 py-1 font-mono text-[10px] uppercase text-slate-400 font-semibold border-b border-slate-700/20 mb-1">
              Select Appearance
            </div>
            {options.map(opt => {
              const Icon = opt.icon;
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isSelected
                      ? effectiveTheme === 'dark'
                        ? 'bg-amber-500/15 text-amber-300 font-semibold'
                        : 'bg-amber-500/10 text-amber-800 font-semibold'
                      : effectiveTheme === 'dark'
                      ? 'text-slate-300 hover:bg-[#161d2c] hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-amber-400" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
