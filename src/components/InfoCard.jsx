import React, { useRef, useState, useEffect, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Vector3, MathUtils } from 'three';
import AudioPreview from './AudioPreview';

const InfoCard = memo(({ data: music, onClose: onCardClose, isMobile }) => {
  const { camera } = useThree();
  const cardRef = useRef(); // For 3D group (position/scale)
  const htmlRef = useRef(); // For HTML DOM element (click detection)
  
  // 动画进度状态 (0 -> 1)
  const progress = useRef(0);

  // 每次 music 变化时重置动画
  useEffect(() => {
    progress.current = 0;
  }, [music]);

  // 初始化位置，避免第一帧闪烁
  const initialPosition = React.useMemo(() => {
      if (!music) return [0, 0, 0];
      return new Vector3(...music.position);
  }, [music]);

  useFrame((state, delta) => {
    if (cardRef.current && music) {
      // 动画：平滑插值 progress 到 1
      // 这里的 10 是平滑速度，可以调整
      progress.current = MathUtils.damp(progress.current, 1, 10, delta);

      const coverWorldPosition = new Vector3(...music.position);
      const distToCover = camera.position.distanceTo(coverWorldPosition);
      const cameraDirection = new Vector3();
      camera.getWorldDirection(cameraDirection);

      // 获取相机视角的右向量
      const cameraRight = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

      // --- 智能位置策略：3D跟随 -> HUD模式平滑过渡 ---
      // 策略：
      // 1. 远距离 (> 6)：保持"孪生"跟随模式，卡片在封面旁。
      // 2. 近距离 (< 3)：切换到 HUD (平视显示) 模式，卡片"吸附"在屏幕适合阅读的位置，不受透视干扰。
      // 3. 中间距离：平滑插值，避免突变。

      // A. 计算标准 3D 跟随位置 (Twin Mode)
      const sideOffset = 0.8 + (distToCover * 0.02);
      const ndcCover = coverWorldPosition.clone().project(camera);
      // 封面在左(-)，卡片去右(+)；封面在右(+)，卡片去左(-)
      const preferRight = ndcCover.x < 0; 
      
      const rightDir = cameraRight.clone().multiplyScalar(
        (preferRight ? sideOffset : -sideOffset) * progress.current
      );
      
      // 计算浮动动画偏移
      const baseY = coverWorldPosition.y;
      const floatY = !isMobile ? Math.sin(state.clock.getElapsedTime() * 0.5 + (music.id || 0)) * 0.1 : 0;

      // Twin Mode Position (与封面同平面)
      const twinPosition = new Vector3()
        .copy(coverWorldPosition)
        .add(rightDir);
      twinPosition.y += floatY; // 加上浮动动画

      // B. 计算 HUD 模式位置 (HUD Mode)
      // 目标：固定在相机前方一定距离，屏幕的左侧或右侧
      const hudDist = 4; // 固定在相机前 4 单位处
      
      // 计算该距离下的视锥体尺寸
      const vFOV = MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * Math.tan(vFOV / 2) * hudDist;
      const visibleWidth = visibleHeight * camera.aspect;
      
      // HUD 偏移：放在屏幕宽度的 1/4 处 (即中心和边缘的中间)
      const hudOffsetX = visibleWidth * 0.22 * (preferRight ? 1 : -1);
      
      const hudPosition = new Vector3()
        .copy(camera.position)
        .add(cameraDirection.clone().multiplyScalar(hudDist)) // 相机前方
        .add(cameraRight.clone().multiplyScalar(hudOffsetX)); // 横向偏移
        
      // 稍微向下一点，留出顶部空间
      const cameraUp = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      hudPosition.add(cameraUp.multiplyScalar(-visibleHeight * 0.05));

      // C. 混合两个位置
      // 距离区间 [3, 7]：<3 完全HUD, >7 完全Twin
      const blendStart = 3;
      const blendEnd = 7;
      const blendFactor = MathUtils.clamp((distToCover - blendStart) / (blendEnd - blendStart), 0, 1);
      
      // 最终位置插值 (lerp)
      // blendFactor 0 (近) -> use HUD
      // blendFactor 1 (远) -> use Twin
      const finalPosition = new Vector3().lerpVectors(hudPosition, twinPosition, blendFactor);

      // 直接更新 ref 位置
      cardRef.current.position.copy(finalPosition);

      // 2. 动态缩放
      // 计算卡片到相机的实际距离
      const distToCard = camera.position.distanceTo(finalPosition);
      
      // 更加激进的缩放策略：
      // 目标：让卡片在屏幕上的视觉大小保持相对恒定，不要因为距离近而变得巨大
      
      // 基础缩放：默认是1
      let scale = 1;

      // 动态调整缩放以抑制近距离的放大效果
      // 阈值提高到 12，并使用指数衰减让近距离更小
      const adaptiveThreshold = 12;
      
      if (distToCard < adaptiveThreshold) {
        // 指数衰减：距离越近，缩小得更明显
        scale = Math.pow(distToCard / adaptiveThreshold, 1.2);
        
        // 设置最小缩放值，防止太近时消失
        scale = Math.max(0.22, scale); 
      }

      // 动画：缩放也从小变大 (0.5 -> 1.0 * targetScale)
      const animatedScale = scale * (0.5 + 0.5 * progress.current);

      cardRef.current.scale.set(animatedScale, animatedScale, animatedScale);
    }
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCardClose();
      }
    };

    const handleClickOutside = (event) => {
      if (music && htmlRef.current && !htmlRef.current.contains(event.target)) {
        onCardClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCardClose, music]);

  const isValidUrl = music && music.url && (music.url.startsWith('http://') || music.url.startsWith('https://'));

  if (!music) return null;

  return (
    <group ref={cardRef} position={initialPosition}>
      <Html 
        transform 
        sprite 
        distanceFactor={isMobile ? 10 : 8}
      >
        <div
          ref={htmlRef}
          className="bg-white/90 p-3 rounded-xl shadow-2xl backdrop-blur-sm text-gray-800 border border-gray-100 relative"
          style={{
            maxWidth: isMobile ? 'min(80vw, 360px)' : 'min(40vw, 360px)',
            overflow: 'visible',
            fontSize: isMobile ? 'clamp(12px, 2.5vw, 16px)' : 'clamp(12px, 1.2vw, 15px)',
            lineHeight: 1.4,
            wordBreak: 'break-word'
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-card-title"
        >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onCardClose();
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="mb-2 pr-6">
          <h3 id="info-card-title" className="font-extrabold text-xl text-indigo-800 leading-snug">{music.music}</h3>
        </div>

        <div className="space-y-1 text-base">
          <p>
            <span className="text-gray-500 mr-1">艺术家:</span>
            <strong className="font-semibold text-gray-900">{music.artist}</strong>
          </p>
          <p>
            <span className="text-gray-500 mr-1">专辑:</span>
            <span className="text-gray-700">{music.album}</span>
          </p>
        </div>

        <div className="border-b border-gray-200 my-2"></div>

        <div className="text-xs space-y-1">
          <p>
            <span className="text-gray-500 mr-1">推文:</span>
            <span className="text-gray-600">{music.title}</span>
          </p>
          <p>
            <span className="text-gray-500 mr-1">分享日期:</span>
            <span className="text-gray-600">{music.date}</span>
          </p>
          {music.note && (
            <p>
              <span className="text-gray-500 mr-1">备注:</span>
              <span className="italic text-gray-600">{music.note}</span>
            </p>
          )}
        </div>

        {/* Audio Preview */}
        <AudioPreview term={`${music.artist} ${music.music}`} isMobile={isMobile} />

        {isValidUrl ? (
          <a
            href={music.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 mt-3 block text-center rounded text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            onClick={(e) => e.stopPropagation()}
            aria-label={`View original source for ${music.music} (opens in a new tab)`}
          >
            <span>查看原文</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        ) : (
          music.url && <p className="text-red-500 text-xs mt-3">链接地址无效</p>
        )}
        {!isMobile && (
          <div className="mt-2 pt-2 border-t border-gray-100 text-center">
            <span className="text-[10px] text-gray-400">(按 ESC 关闭)</span>
          </div>
        )}
      </div>
      </Html>
    </group>
  );
});

export default InfoCard;
