import React from 'react';
import SimpleAurora from './SimpleAurora';
import SimulationAurora from './SimulationAurora';

const Aurora = ({ variant, ...props }) => {
  if (variant === 'simulation') {
    return <SimulationAurora {...props} />;
  }
  return <SimpleAurora {...props} />;
};

export default Aurora;