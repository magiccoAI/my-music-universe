import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import { Frustum, Box3, TextureLoader, LinearFilter, Matrix4 } from 'three'; // Import THREE

const getOptimizedImageUrl = (originalCoverPath, isMobile) => {
  if (!originalCoverPath) return null; // Handle null or undefined paths

  const parts = originalCoverPath.split('/');
  const filename = parts[parts.length - 1];
  const [name, ext] = filename.split('.');

  const publicUrl = process.env.PUBLIC_URL || '';

  // For mobile, always try to load optimized webp images
  if (isMobile) {
    return `${publicUrl}/optimized-images/${name}.webp`;
  }

  // For desktop, if the original is already webp, use it. Otherwise, use optimized webp.
  if (ext === 'webp') {
    return originalCoverPath;
  } else {
    return `${publicUrl}/optimized-images/${name}.webp`;
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

const gFrustum = new Frustum();
const gBox = new Box3();
const gMatrix = new Matrix4();

// Texture loading queue manager
const textureQueue = [];
let activeLoads = 0;
const MAX_CONCURRENT_LOADS = 4; // Limit concurrent loads

const processQueue = () => {
  if (activeLoads >= MAX_CONCURRENT_LOADS || textureQueue.length === 0) return;

  const { item, retryCount, useOriginal, setLoadedTexture, setIsLoading, isMobile, callback } = textureQueue.shift();
  activeLoads++;

  const load = (currentItem, currentRetryCount, currentUseOriginal) => {
    const maxRetries = 2;
    let baseCoverPath = currentItem.cover;

    if (isMobile && currentItem.coverMobile) {
      baseCoverPath = currentItem.coverMobile;
    }

    let textureUrl;
    if (currentUseOriginal) {
      textureUrl = baseCoverPath;
    } else {
      textureUrl = getOptimizedImageUrl(baseCoverPath, isMobile);
    }

    if (!textureUrl) {
      console.warn('No texture URL generated for item:', currentItem);
      setIsLoading(false);
      activeLoads--;
      processQueue();
      return;
    }

    const loader = new TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(
      textureUrl,
      (texture) => {
        texture.minFilter = LinearFilter;
        setLoadedTexture(texture);
        setIsLoading(false);
        activeLoads--;
        processQueue();
        if (callback) callback();
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', textureUrl, error);
        if (!currentUseOriginal && currentRetryCount < maxRetries) {
          console.log(`Retrying with original image (${currentRetryCount + 1}/${maxRetries}):`, baseCoverPath);
          setTimeout(() => load(currentItem, currentRetryCount + 1, true), 500);
        } else if (currentUseOriginal && currentRetryCount < maxRetries) {
          console.log(`Retrying original image (${currentRetryCount + 1}/${maxRetries}):`, baseCoverPath);
          setTimeout(() => load(currentItem, currentRetryCount + 1, true), 500);
        } else {
          setIsLoading(false);
          activeLoads--;
          processQueue();
        }
      }
    );
  };

  load(item, retryCount, useOriginal);
};

const enqueueTextureLoad = (item, retryCount, useOriginal, setLoadedTexture, setIsLoading, isMobile) => {
  textureQueue.push({ item, retryCount, useOriginal, setLoadedTexture, setIsLoading, isMobile });
  processQueue();
};

const Cover = memo(({ data, position, rotation, scale, onClick, onVisible, isMobile }) => {
  const meshRef = useRef();
  const { camera } = useThree();
  // Removed per-instance object creation

  const [loadedTexture, setLoadedTexture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadTexture = useCallback((item, retryCount = 0, useOriginal = false) => {
    setIsLoading(true);
    enqueueTextureLoad(item, retryCount, useOriginal, setLoadedTexture, setIsLoading, isMobile);
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

  const frameCounter = useRef(Math.floor(Math.random() * 30)); // Random offset to stagger checks

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    // Subtle floating animation - DESKTOP ONLY
    if (!isMobile) {
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5 + data.id) * 0.1;
    }
    meshRef.current.lookAt(camera.position);

    // Frustum culling for lazy loading - MOBILE ONLY logic
    // For desktop, we load immediately (see useEffect above), so this check is redundant unless we want to unload.
    // Current logic only loads.
    if (isMobile && !loadedTexture && !isLoading) {
      frameCounter.current++;
      if (frameCounter.current % 30 === 0) {
        // Use global objects to avoid GC
        camera.updateMatrixWorld(); 
        // Note: We use the global gMatrix, gFrustum, gBox
        gMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        gFrustum.setFromProjectionMatrix(gMatrix);

        gBox.setFromObject(meshRef.current);
        if (gFrustum.intersectsBox(gBox)) {
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