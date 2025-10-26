import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

import { useTexture } from '@react-three/drei';

const Cover = ({ data, position, rotation, scale, onClick, frustum }) => {
  const texture = useTexture(`/${data.cover}`);
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