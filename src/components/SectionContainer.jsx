import React from 'react';

const SectionContainer = ({ sectionKey, icon, title, subtitle, onHover, onLeave, hoveredSection, children }) => {
  return (
    <section className="section-container" onMouseEnter={onHover} onMouseLeave={onLeave}>
      <div className="section-header">
        <span className="section-icon">{icon}</span>
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </div>
      <div className="section-content">{children}</div>
    </section>
  );
};

export default SectionContainer;