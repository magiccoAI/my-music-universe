import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const Stars = ({ isMobile }) => {
  const ref = useRef();
  const numStars = isMobile ? 1500 : 5000; // Reduced stars for mobile
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
      // 移动端通常没有鼠标 hover，所以这个效果主要针对桌面端
      if (!isMobile && mouse) {
          ref.current.rotation.x += mouse.y * 0.00005;
          ref.current.rotation.y += mouse.x * 0.00005;
      }
    }
  });

  return (
    <group>
      {/* Original Stars */}
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

      {/* ✨ Floating Particles - Layer 1: Close and active (Cyan/Blue tint) */}
      <Sparkles 
        count={isMobile ? 50 : 200} 
        scale={[20, 20, 20]} 
        size={4} 
        speed={0.4} 
        opacity={0.6}
        color="#a5f3fc" // Cyan-200
      />

      {/* ✨ Floating Particles - Layer 2: Widespread background dust (White) */}
      <Sparkles 
        count={isMobile ? 100 : 500} 
        scale={[50, 50, 50]} 
        size={2} 
        speed={0.2} 
        opacity={0.4}
        color="#ffffff" 
      />

      {/* ✨ Floating Particles - Layer 3: Occasional brighter glints (Purple tint) */}
      <Sparkles 
        count={isMobile ? 10 : 50} 
        scale={[30, 30, 30]} 
        size={10} 
        speed={0.5} 
        opacity={0.8}
        color="#e879f9" // Purple-400
        noise={1} // Add some noise for irregular movement
      />
    </group>
  );
};

export default Stars;
