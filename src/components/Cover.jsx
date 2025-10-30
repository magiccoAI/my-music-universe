import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three'; // Import THREE

const Cover = ({ data, position, rotation, scale, onClick, texture, onVisible, isMobile }) => {
  const meshRef = useRef();
  const { camera } = useThree();
  const frustum = new THREE.Frustum();
  const box = new THREE.Box3();

  useFrame(({ clock }) => {
    // Subtle floating animation
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5 + data.id) * 0.1;
      meshRef.current.lookAt(camera.position);

      // Frustum culling for lazy loading
      if (onVisible && isMobile) { // Only for mobile and if onVisible callback is provided
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
        frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));

        box.setFromObject(meshRef.current);
        if (frustum.intersectsBox(box)) {
          onVisible(data.id); // Notify parent component that this cover is visible
        }
      }
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