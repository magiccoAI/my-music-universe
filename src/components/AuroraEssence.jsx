import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AuroraEssence - An immersive mood switch for the Aurora scene.
 * Refactored for "UI Downgrade" - Minimalist, unobtrusive, wake-on-hover.
 */
const AuroraEssence = ({ mode, onToggle }) => {
  const targetMode = mode === 'simple' ? 'simulation' : 'simple';
  const isTargetDynamic = targetMode === 'simulation';

  return (
    <button
      onClick={onToggle}
      className="group relative w-10 h-10 rounded-full focus:outline-none transition-all duration-700 opacity-80 hover:opacity-100 active:scale-95 active:opacity-100"
      role="switch"
      aria-checked={mode === 'simulation'}
      aria-label={mode === 'simulation' ? "切换到柔光极光" : "切换到灵动极光"}
      title={mode === 'simulation' ? "切换到柔光极光" : "切换到灵动极光"}
    >
      {/* 1. Ice Shell (Container) - Minimalist glass */}
      <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden z-10">
        
        {/* 2. Essence Core (The Preview) - Always visible, brighter on hover */}
        <AnimatePresence mode="wait">
          {isTargetDynamic ? (
            /* Previewing DYNAMIC (Storm/Dance) - Brighter Cold Colors */
            <motion.div
              key="dynamic-preview"
              className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-1000 ease-in"
            >
              {/* Swirling Gradient - Only moves on hover */}
              <motion.div 
                className="absolute inset-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-cyan-500/60 via-purple-500/60 to-teal-400/60 blur-md"
                initial={{ rotate: 0, scale: 1 }}
                whileHover={{ 
                  rotate: 360,
                  scale: 1.2,
                  transition: { duration: 8, repeat: Infinity, ease: "linear" }
                }}
              />
            </motion.div>
          ) : (
            /* Previewing CALM (Peace/Soft) */
            <motion.div
              key="static-preview"
              className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-1000 ease-in"
            >
              {/* Breathing Glow - Deep Ocean Colors */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-blue-400/60 to-cyan-300/60 blur-md"
                initial={{ opacity: 0.6 }}
                whileHover={{ 
                  opacity: [0.6, 0.9, 0.6],
                  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Subtle Refraction (Always visible) */}
        <div className="absolute top-2 left-2 w-3 h-1.5 bg-white/30 rounded-full blur-[1px]" />
      </div>

      {/* 4. No External Glow - Pure Stealth */}
    </button>
  );
};

export default AuroraEssence;
