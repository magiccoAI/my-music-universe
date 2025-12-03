import React, { useState, useEffect, useRef } from 'react';

const TerminalText = ({ lines, speed = 50, delay = 1000, className = "" }) => {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const scrollRef = useRef(null);

  // Reset if lines change significantly (optional, but good for safety)
  useEffect(() => {
    if (lines.length === 0) return;
  }, [lines]);

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;

    const currentLineText = lines[currentLineIndex];

    if (currentCharIndex < currentLineText.length) {
      // Typing behavior
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          if (newLines[currentLineIndex] === undefined) {
            newLines[currentLineIndex] = '';
          }
          newLines[currentLineIndex] = currentLineText.slice(0, currentCharIndex + 1);
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Line finished, wait before next line
      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex, currentCharIndex, lines, speed, delay]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLines]);

  return (
    <div 
      ref={scrollRef}
      className={`font-mono text-xs md:text-sm text-sky-300/70 p-4 bg-black/40 rounded-lg border border-sky-500/10 backdrop-blur-sm overflow-y-auto ${className}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      {displayedLines.map((line, index) => (
        <div key={index} className="mb-1 break-words">
          <span className="mr-2 text-sky-500/50 select-none">$</span>
          {line}
          {index === currentLineIndex && index < lines.length && (
            <span className="animate-pulse inline-block w-1.5 h-3 bg-sky-400 ml-1 align-middle shadow-[0_0_5px_rgba(56,189,248,0.8)]"></span>
          )}
        </div>
      ))}
      {currentLineIndex >= lines.length && (
         <div className="mb-1">
         <span className="mr-2 text-sky-500/50 select-none">$</span>
         <span className="animate-pulse inline-block w-1.5 h-3 bg-sky-400 ml-1 align-middle shadow-[0_0_5px_rgba(56,189,248,0.8)]"></span>
       </div>
      )}
    </div>
  );
};

export default TerminalText;
