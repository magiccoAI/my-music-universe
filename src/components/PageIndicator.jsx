import React, { useEffect, useState } from 'react';

const PageIndicator = ({ sections }) => {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-40% 0px -40% 0px', // Activate when section is in the middle 20% of viewport
        threshold: 0
      }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <nav className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40 hidden md:block">
      <div className="relative flex flex-col items-end gap-6">
        {/* Connecting Line */}
        <div className="absolute right-[5px] top-0 bottom-0 w-[2px] bg-white/10 rounded-full -z-10" />

        {sections.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={(e) => handleClick(e, id)}
            className="group relative flex items-center justify-end"
            aria-label={`Scroll to ${label}`}
          >
            {/* Label (Visible on hover only) */}
            <span
              className={`mr-4 px-3 py-1 rounded-md text-sm font-medium tracking-wide transition-all duration-300
                opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0
                ${activeId === id 
                  ? 'bg-white/10 text-cyan-300 backdrop-blur-sm border border-cyan-500/30' 
                  : 'text-white/60 group-hover:bg-black/40'
                }`}
            >
              {label}
            </span>

            {/* Dot Indicator */}
            <div
              className={`relative w-3 h-3 rounded-full border-2 transition-all duration-300
                ${activeId === id
                  ? 'bg-cyan-400 border-cyan-400 scale-125 shadow-[0_0_15px_rgba(34,211,238,0.8)]'
                  : 'bg-transparent border-white/30 hover:border-white/80 hover:bg-white/20'
                }`}
            >
              {/* Pulse effect for active dot */}
              {activeId === id && (
                <span className="absolute -inset-1 rounded-full bg-cyan-400/30 animate-ping" />
              )}
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default PageIndicator;
