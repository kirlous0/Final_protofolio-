import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const AnimatedBackground: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-colors duration-500"
    >
      {/* Base Grid Pattern */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isDark ? 'bg-grid-subtle opacity-70' : 'bg-grid-subtle-light opacity-50'
        }`}
      />

      {/* Subtle Radial Lighting Accents */}
      {isDark ? (
        <>
          {/* Top-Right Soft Ambient Glow */}
          <div
            className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full blur-[140px] transition-opacity duration-700"
            style={{
              background: 'radial-gradient(circle, rgba(0, 163, 255, 0.04) 0%, rgba(0,0,0,0) 70%)',
            }}
          />

          {/* Center-Left Restrained Ambient Glow */}
          <div
            className="absolute top-1/3 -left-40 h-[700px] w-[700px] rounded-full blur-[160px] transition-opacity duration-700"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, rgba(0,0,0,0) 70%)',
            }}
          />

          {/* Bottom Soft Tone Anchor */}
          <div
            className="absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full blur-[140px] transition-opacity duration-700"
            style={{
              background: 'radial-gradient(circle, rgba(0, 163, 255, 0.03) 0%, rgba(0,0,0,0) 70%)',
            }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute -top-32 right-0 h-[500px] w-[500px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(2, 132, 199, 0.04) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
          <div
            className="absolute top-1/2 -left-32 h-[500px] w-[500px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(0, 0, 0, 0.02) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
        </>
      )}
    </div>
  );
};
