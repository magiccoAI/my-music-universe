import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane, useTexture, Stats } from '@react-three/drei';

const Cover = ({ data, position, rotation, scale, onClick }) => {
  const meshRef = useRef();
  const texture = useTexture(`/covers/${data.cover.split('/').pop()}`);
  const { camera } = useThree();
  const [frameCount, setFrameCount] = useState(0);

  useFrame(({ clock }) => {
    // Update every 3 frames to reduce computation
    setFrameCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount % 3 === 0) {
        if (meshRef.current) {
          // Subtle floating animation
          meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5 + data.id) * 0.1;
          meshRef.current.lookAt(camera.position);
        }
      }
      return nextCount;
    });
  });

  return (
    <>
      <Stats /> {/* Add performance monitoring */}
      <Plane
        args={[1, 1]}
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={(event) => {
          event.stopPropagation();
          onClick(data, position);
        }}
      >
        <meshBasicMaterial attach="material" map={texture} transparent />
      </Plane>
    </>
  );
};

export default Cover;