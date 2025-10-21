import React from 'react';
import MusicalNotes from './MusicalNotes';
import MouseParticleEffect from './MouseParticleEffect';

const R3FEffects = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <MusicalNotes />
      <MouseParticleEffect />
    </>
  );
};

export default R3FEffects;