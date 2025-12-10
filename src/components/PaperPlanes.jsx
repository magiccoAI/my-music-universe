import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail, Html } from '@react-three/drei';
import * as THREE from 'three';

// A simple procedural airplane model component
const SimpleAirplane = ({ propellerRef }) => {
  return (
    <group scale={0.5}>
      {/* Fuselage: Pointing along X axis */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <capsuleGeometry args={[0.3, 3, 4, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Wings: Wide in Z, centered */}
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.8, 0.1, 3.5]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>

      {/* Tail - Horizontal */}
      <mesh position={[-1.2, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.1, 1.2]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>

      {/* Tail - Vertical */}
      <mesh position={[-1.2, 0.5, 0]}>
        <boxGeometry args={[0.8, 1.0, 0.1]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>

      {/* Cockpit */}
      <mesh position={[0.5, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.5]} />
        <meshStandardMaterial color="#88ccff" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Propeller (Optional visual detail) */}
      <mesh ref={propellerRef} position={[1.5, 0, 0]} rotation={[0, 0, 0]}>
         <boxGeometry args={[0.1, 2.2, 0.2]} />
         <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};

const Plane = ({ data, onPlaneClick, boundary = 30, isMobile }) => {
  const groupRef = useRef();
  const propellerRef = useRef(); // Ref for the propeller
  const [hovered, setHovered] = useState(false);
  // Speed: Move from left to right
  const [speed] = useState(() => 5 + Math.random() * 3); 
  
  // Random starting position
  const position = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * boundary * 2, 
    (Math.random() * 10) - 5, 
    (Math.random() * 10) - 15 
  ));
  
  // Offset for sine wave motion
  const offset = useRef(Math.random() * 100);

  // Click animation state
  const [clicked, setClicked] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const currentSpeed = hovered ? speed * 0.5 : speed;
    const time = state.clock.getElapsedTime();

    // 1. Move Left to Right (+X)
    position.current.x += currentSpeed * delta;
    
    // 2. Gentle sine wave movement in Y and Z
    position.current.y += Math.sin(time * 2 + offset.current) * 0.02;
    position.current.z += Math.cos(time * 1.5 + offset.current) * 0.01;
    
    // Propeller rotation
    if (propellerRef.current) {
        propellerRef.current.rotation.x += 15 * delta; // Spin fast around X axis
    }

    // 3. Reset when out of bounds (Right side)
    if (position.current.x > boundary) {
      position.current.x = -boundary;
      position.current.y = (Math.random() * 14) - 2; 
      position.current.z = (Math.random() * 10) - 5;  
    }

    // 4. Update position
    groupRef.current.position.copy(position.current);

    // 5. Orientation
    const bank = Math.cos(time * 2 + offset.current) * 0.1;
    const pitch = Math.cos(time * 2 + offset.current) * 0.05;
    
    groupRef.current.rotation.set(0, 0, 0); 
    groupRef.current.rotation.x = bank; // Roll around fuselage axis (X)
    groupRef.current.rotation.z = pitch; // Pitch nose up/down (around Z axis)

    // Click feedback (Spin)
    if (clicked) {
         groupRef.current.scale.setScalar(0.8 + Math.sin(time * 20) * 0.2);
    } else {
         groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(true);
    setTimeout(() => setClicked(false), 300); // Reset click state after 300ms
    onPlaneClick(groupRef.current.position.toArray());
  };

  const PlaneContent = (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={() => { if(!isMobile) { document.body.style.cursor = 'pointer'; setHovered(true); } }}
      onPointerOut={() => { if(!isMobile) { document.body.style.cursor = 'auto'; setHovered(false); } }}
    >
      <SimpleAirplane propellerRef={propellerRef} />
      
      {hovered && !isMobile && (
           <Html position={[0, 2, 0]}>
              <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium text-gray-800 pointer-events-none whitespace-nowrap shadow-lg border border-white/50">
                  ✈️ 探索音乐
              </div>
          </Html>
      )}
    </group>
  );

  if (isMobile) {
      return PlaneContent;
  }

  return (
    <Trail
        width={0.8} // Thinner trail
        length={4} // Shorter trail
        color={new THREE.Color(1, 1, 1)} 
        attenuation={(t) => t * t} // Quadratic attenuation to fade out smoothly but not look like a tadpole
        target={groupRef} 
    >
        {PlaneContent}
    </Trail>
  );
};

const PaperPlanes = ({ count = 5, musicData, onRecommend, isMobile }) => {
  const planes = useMemo(() => new Array(count).fill(0).map((_, i) => i), [count]);

  const handlePlaneClick = (planePosition) => {
    if (!musicData || musicData.length === 0) return;
    
    // Randomly select an album
    const randomIndex = Math.floor(Math.random() * musicData.length);
    const randomAlbum = musicData[randomIndex];
    
    onRecommend(randomAlbum, planePosition);
  };

  return (
    <group>
      {planes.map((i) => (
        <Plane key={i} onPlaneClick={handlePlaneClick} isMobile={isMobile} />
      ))}
      <ambientLight intensity={0.5} />
    </group>
  );
};

export default PaperPlanes;
