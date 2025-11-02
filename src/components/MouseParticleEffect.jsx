import React, { useState, useEffect, useRef } from 'react';

const MouseParticleEffect = () => {
  const [particles, setParticles] = useState([]);
  const noteEmojis = ['⭐', '✨', '🎵', '🎶'];
  const particleIdCounter = useRef(0);

  // 创建粒子函数
  const createParticle = ({ x, y, vx = 0, vy = 0, type, life, size }) => ({
    id: particleIdCounter.current++,
    x, y, vx, vy, type, life, size
  });

  // 鼠标移动生成拖尾粒子
  const handleMouseMove = (e) => {
    const newParticle = createParticle({
      x: e.clientX,
      y: e.clientY,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      type: noteEmojis[Math.floor(Math.random() * noteEmojis.length)],
      life: 40 + Math.random() * 20,
      size: 12 + Math.random() * 8
    });
    setParticles((prev) => [...prev.slice(-200), newParticle]);
  };

  // 鼠标点击爆发粒子
  const handleMouseClick = (e) => {
    const burstParticles = [];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = Math.random() * 5 + 2;
      burstParticles.push(createParticle({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: noteEmojis[Math.floor(Math.random() * noteEmojis.length)],
        life: 50,
        size: 18 + Math.random() * 8
      }));
    }
    setParticles((prev) => [...prev.slice(-200), ...burstParticles]);
  };

  // 粒子动画更新
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleMouseClick);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + (p.vx || 0),
            y: p.y + (p.vy || 0) + 0.2,
            vx: (p.vx || 0) * 0.95,
            vy: (p.vy || 0) * 0.95,
            life: p.life - 1,
            size: p.size * 0.96,
          }))
          .filter((p) => p.life > 0)
          .slice(-300)
      );
    }, 30);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseClick);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50"
    >
      {/* 粒子显示 */}
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            pointerEvents: 'none',
            fontSize: `${p.size}px`,
            opacity: Math.min(p.life / 50, 1),
            transform: 'translate(-50%, -50%)',
          }}
        >
          {p.type}
        </span>
      ))}
    </div>
  );
};

export default MouseParticleEffect;