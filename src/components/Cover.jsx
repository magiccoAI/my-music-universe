import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three'; // Import THREE

const getOptimizedImageUrl = (originalCoverPath, isMobile) => {
  if (!originalCoverPath) return null;

  if (!isMobile) {
    // For desktop, return the original path for higher quality
    return `${process.env.PUBLIC_URL}/${originalCoverPath}`;
  }

  // For mobile, return the optimized WebP path
  // Check if the path is already a webp image
  if (originalCoverPath.endsWith('.webp')) {
    return `${process.env.PUBLIC_URL}/${originalCoverPath}`;
  }

  const parts = originalCoverPath.split('/');
  const baseNameWithExtension = parts[parts.length - 1];
  const lastDotIndex = baseNameWithExtension.lastIndexOf('.');
  const fileName = lastDotIndex !== -1 ? baseNameWithExtension.substring(0, lastDotIndex) : baseNameWithExtension;
  return `${process.env.PUBLIC_URL}/optimized-images/${fileName}.webp`;
};

const Cover = memo(({ data, position, rotation, scale, onClick, onVisible, isMobile }) => {
  const meshRef = useRef();
  const { camera } = useThree();
  const frustum = new THREE.Frustum();
  const box = new THREE.Box3();

  const [loadedTexture, setLoadedTexture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadTexture = useCallback((item, retryCount = 0) => {
    setIsLoading(true);
    const maxRetries = 2;

    let baseCoverPath = item.cover; // Default to item.cover

    if (isMobile) {
      if (item.coverMobile) {
        baseCoverPath = item.coverMobile;
      }
    }

    const textureUrl = getOptimizedImageUrl(baseCoverPath, isMobile);
      
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        setLoadedTexture(texture);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', item.cover, error);
        if (retryCount < maxRetries) {
          console.log(`Retrying texture load (${retryCount + 1}/${maxRetries}):`, item.cover);
          setTimeout(() => loadTexture(item, retryCount + 1), 1000);
        } else {
          setIsLoading(false);
        }
      }
    );
  }, [isMobile]);

  useEffect(() => {
    if (!data || isLoading || loadedTexture) return;

    // For desktop or if onVisible is not provided, load immediately
    // For mobile, we rely on onVisible to trigger loading
    // The actual loading will be triggered by the useFrame's frustum culling
    if (!isMobile) {
      loadTexture(data);
    }
  }, [data, isMobile, isLoading, loadedTexture, onVisible, loadTexture]);

  useFrame(({ clock }) => {
    // Subtle floating animation
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5 + data.id) * 0.1;
      meshRef.current.lookAt(camera.position);

      // Frustum culling for lazy loading, only for desktop
      if (!isMobile && !loadedTexture && !isLoading) {
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
        frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));

        box.setFromObject(meshRef.current);
        if (frustum.intersectsBox(box)) {
          // Trigger loading when visible
          loadTexture(data);
        }
      }
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();
    onClick(data, position);
  };

  if (!loadedTexture) {
    // Render a placeholder or nothing if texture is not loaded
    return (
      <Plane
        args={[1, 1]}
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
      >
        <meshBasicMaterial attach="material" color="#808080" /> {/* Default gray color */}
      </Plane>
    );
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
        <meshBasicMaterial attach="material" map={loadedTexture} transparent />
      </Plane>
    </>
  );
});

export default Cover;