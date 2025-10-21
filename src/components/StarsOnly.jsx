import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Stars = () => {
  const ref = useRef();
  const numStars = 5000; // Increased number of stars
  const radius = 100; // Increased radius for a wider spread

  const positions = useMemo(() => {
    const positions = new Float32Array(numStars * 3);
    for (let i = 0; i < numStars; i++) {
      const r = radius * (1 - Math.random() * Math.random()); // Denser center
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [numStars, radius]);

  useFrame(({ clock, mouse }) => {
    if (ref.current) {
      // Subtle rotation
      ref.current.rotation.x += 0.00005;
      ref.current.rotation.y += 0.0001;

      // Mouse interaction: move stars slightly based on mouse position
      // Adjust these multipliers for desired sensitivity
      ref.current.rotation.x += mouse.y * 0.00005;
      ref.current.rotation.y += mouse.x * 0.00005;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial attach="material" color="white" size={0.1} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
};

export default Stars;