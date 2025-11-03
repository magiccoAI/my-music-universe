import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three'; // Import THREE

const getOptimizedImageUrl = (originalCoverPath, isMobile) => {
  if (!originalCoverPath) return null; // Handle null or undefined paths

  const parts = originalCoverPath.split('/');
  const filename = parts[parts.length - 1];
  const [name, ext] = filename.split('.');

  // For mobile, always try to load optimized webp images
  if (isMobile) {
    return `/optimized-images/${name}.webp`;
  }

  // For desktop, if the original is already webp, use it. Otherwise, use optimized webp.
  if (ext === 'webp') {
    return originalCoverPath;
  } else {
    return `/optimized-images/${name}.webp`;
  }
};

const COLOR_PALETTE = [
  '#2E4057', // 深蓝灰
  '#4A6670', // 青灰
  '#5B7B7A', // 绿灰
  '#6D8B74', // 灰绿
  '#7E9C6F', // 橄榄绿
  '#8FAC69', // 黄绿
  '#996888', // 紫灰
  '#A67F8E', // 粉灰
  '#B39694', // 肉色灰
  '#C0AD99'  // 米灰
];

const getColorFromId = (id) => {
  if (!id) return COLOR_PALETTE[0];

  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
};

const Cover = memo(({ data, position, rotation, scale, onClick, onVisible, isMobile }) => {
  const meshRef = useRef();
  const { camera } = useThree();
  const frustum = new THREE.Frustum();
  const box = new THREE.Box3();

  const [loadedTexture, setLoadedTexture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadTexture = useCallback((item, retryCount = 0, useOriginal = false) => {
    setIsLoading(true);
    const maxRetries = 2;

    let baseCoverPath = item.cover; // Default to item.cover

    if (isMobile) {
      if (item.coverMobile) {
        baseCoverPath = item.coverMobile;
      }
    }

    let textureUrl;
    if (useOriginal) {
      textureUrl = baseCoverPath; // Fallback to original path
    } else {
      textureUrl = getOptimizedImageUrl(baseCoverPath, isMobile);
    }

    if (!textureUrl) {
      console.warn('No texture URL generated for item:', item);
      setIsLoading(false);
      return;
    }
      
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
        console.error('Error loading texture:', textureUrl, error);
        if (!useOriginal && retryCount < maxRetries) {
          console.log(`Retrying with original image (${retryCount + 1}/${maxRetries}):`, baseCoverPath);
          // If optimized image failed, try loading original image
          setTimeout(() => loadTexture(item, retryCount + 1, true), 500);
        } else if (useOriginal && retryCount < maxRetries) {
          console.log(`Retrying original image (${retryCount + 1}/${maxRetries}):`, baseCoverPath);
          setTimeout(() => loadTexture(item, retryCount + 1, true), 500);
        } else {
          setIsLoading(false);
        }
      }
    );
  }, [isMobile]);

  useEffect(() => {
    if (!data || isLoading || loadedTexture) return;
  
    // For desktop, load immediately. For mobile, rely on frustum culling or onVisible.
    if (!isMobile) {
      loadTexture(data);
    } else if (onVisible) {
      // If onVisible is provided for mobile, use it to trigger loading
      // This part might need external integration to actually call onVisible
      // For now, we'll keep the frustum culling in useFrame for mobile as well if onVisible is not handled externally.
      // If onVisible is meant to be an external trigger, this useEffect might need adjustment.
      // For simplicity, let's assume onVisible is handled by the parent or frustum culling will handle it.
    }
  }, [data, isMobile, isLoading, loadedTexture, onVisible, loadTexture]);

  useFrame(({ clock }) => {
    // Subtle floating animation
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5 + data.id) * 0.1;
      meshRef.current.lookAt(camera.position);

      // Frustum culling for lazy loading
      if (!loadedTexture && !isLoading) {
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
    // 使用生成的颜色作为占位符
    const placeholderColor = data ? getColorFromId(data.id) : COLOR_PALETTE[0];
    return (
      <Plane
        args={[1, 1]}
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
      >
        <meshBasicMaterial attach="material" color={placeholderColor} /> {/* 使用生成的颜色 */}
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