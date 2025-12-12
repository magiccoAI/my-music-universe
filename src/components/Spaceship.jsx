import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';

// Low-poly Sci-Fi Cruiser
const SciFiShip = ({ engineColor = "#00ffff" }) => {
  return (
    <group rotation={[0, -Math.PI / 2, 0]} scale={0.8}>
      {/* Main Body - Elongated Hexagonal Prism */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.4, 4, 6]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cockpit */}
      <mesh position={[0, 0.3, -0.5]}>
        <boxGeometry args={[0.5, 0.3, 1.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Wings - Delta Shape */}
      <mesh position={[0, 0, 0.5]}>
        <cylinderGeometry args={[0, 2, 0.1, 3]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Vertical Stabilizers */}
      <mesh position={[0.8, 0.5, 1.5]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.1, 0.8, 1]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[-0.8, 0.5, 1.5]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.1, 0.8, 1]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* Engine Glows */}
      <group position={[0, 0, 2.1]}>
        <mesh>
            <sphereGeometry args={[0.25]} />
            <meshBasicMaterial color={engineColor} toneMapped={false} />
        </mesh>
        <pointLight color={engineColor} intensity={3} distance={5} />
      </group>
    </group>
  );
};

const Spaceship = ({ boundary = 40, isMobile }) => {
  const groupRef = useRef();
  
  // Initial position: Start far left
  const position = useRef(new THREE.Vector3(
    -boundary - 10, 
    5, 
    2 // Slightly in front of the album wall (z=0)
  ));
  
  // Flight parameters
  const flybyParams = useRef({
    speed: 8,
    amplitudeY: 2,
    frequencyY: 0.5,
    amplitudeZ: 5,
    frequencyZ: 0.3
  });

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Move Right (+X)
    position.current.x += flybyParams.current.speed * delta;
    
    // Smooth Sine Wave Flight Path
    position.current.y = 5 + Math.sin(time * flybyParams.current.frequencyY) * flybyParams.current.amplitudeY;
    position.current.z = 2 + Math.cos(time * flybyParams.current.frequencyZ) * flybyParams.current.amplitudeZ;
    
    // Banking (Roll) based on Z-movement
    const bankAngle = Math.cos(time * flybyParams.current.frequencyZ) * 0.5;
    groupRef.current.rotation.x = bankAngle * 0.5; // Pitch
    groupRef.current.rotation.z = -bankAngle; // Roll
    
    // Reset when out of bounds (Right side)
    if (position.current.x > boundary + 10) {
        // Reset to left
        position.current.x = -boundary - 10;
        // Randomize for next pass
        flybyParams.current.speed = 6 + Math.random() * 6; // Random speed 6-12
        flybyParams.current.amplitudeY = 2 + Math.random() * 3;
        flybyParams.current.amplitudeZ = 3 + Math.random() * 4;
    }
    
    groupRef.current.position.copy(position.current);
  });

  return (
    <group ref={groupRef}>
      {/* Engine Trail */}
      <Trail
        width={isMobile ? 1 : 1.5} 
        length={isMobile ? 5 : 8} 
        color={new THREE.Color("#00ffff")} 
        attenuation={(t) => t * t}
      >
          <SciFiShip />
      </Trail>
    </group>
  );
};

export default Spaceship;
