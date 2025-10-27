import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
// import * as THREE from 'three'; // No longer needed here

// import { useTexture } from '@react-three/drei'; // No longer needed here

const Cover = ({ data, position, rotation, scale, onClick, texture }) => {
  // const texture = useTexture(`${process.env.PUBLIC_URL}/${data.cover}`); // Removed
  const meshRef = useRef();
  const { camera } = useThree();

  useFrame(({ clock }) => {
    // Subtle floating animation
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5 + data.id) * 0.1;
      meshRef.current.lookAt(camera.position);
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();
    onClick(data, position);
  };

  if (!texture) {
    return null; // Don't render if texture is not loaded
  }

  return (
    <>
      <Plane
        args={[1, 1]}
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
      >
        <meshBasicMaterial attach="material" map={texture} transparent />
      </Plane>
    </>
  );
};

export default Cover;