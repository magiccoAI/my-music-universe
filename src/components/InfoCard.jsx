import React, { useRef, useState, useEffect, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Vector3 } from 'three/src/math/Vector3';

const InfoCard = memo(({ data: music, onClose: onCardClose, isMobile }) => {
  const { camera } = useThree();
  const cardRef = useRef();
  const [cardPosition, setCardPosition] = useState([0, 0, 0]);

  useFrame(() => {
    if (cardRef.current && music) {
      const coverWorldPosition = new Vector3(...music.position);
      const cameraForward = new Vector3();
      camera.getWorldDirection(cameraForward);

      const offsetDistance = 1.5;
      const newCardPosition = new Vector3()
        .copy(coverWorldPosition)
        .add(cameraForward.multiplyScalar(-offsetDistance));

      newCardPosition.y += 0.7;
      setCardPosition([newCardPosition.x, newCardPosition.y, newCardPosition.z]);
    }
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCardClose();
      }
    };

    const handleClickOutside = (event) => {
      if (music && cardRef.current && !cardRef.current.contains(event.target)) {
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
    <Html position={cardPosition} transform sprite ref={cardRef}>
      <div
        className="bg-white/90 p-3 rounded-xl shadow-2xl backdrop-blur-sm max-w-[200px] text-gray-800 text-sm border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2">
          <h3 className="font-extrabold text-xl text-indigo-800 leading-snug">{music.music}</h3>
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

        {isValidUrl ? (
          <a
            href={music.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 mt-3 block text-center rounded text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span>查看原文</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        ) : (
          music.url && <p className="text-red-500 text-xs mt-3">链接地址无效</p>
        )}
      </div>
    </Html>
  );
});

export default InfoCard;