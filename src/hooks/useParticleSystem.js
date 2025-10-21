import { useState, useEffect, useCallback, useMemo } from 'react';

// 节流函数
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 粒子系统自定义 Hook
 * @param {Object} config - 粒子系统配置
 * @param {Array} config.EMOJIS - 粒子使用的表情符号数组
 * @param {Object} config.LIFE - 粒子生命周期配置
 * @param {number} config.LIFE.BASE - 基础生命值
 * @param {number} config.LIFE.RANDOM - 随机生命值范围
 * @param {number} config.LIFE.BURST - 爆发粒子生命值
 * @param {Object} config.SIZE - 粒子大小配置
 * @param {number} config.SIZE.BASE - 基础大小
 * @param {number} config.SIZE.RANDOM - 随机大小范围
 * @param {number} config.SIZE.BURST - 爆发粒子大小
 * @param {Object} config.LIMITS - 粒子数量限制
 * @param {number} config.LIMITS.NORMAL - 普通状态下最大粒子数
 * @param {number} config.LIMITS.BURST - 爆发状态下最大粒子数
 * @param {Object} config.PHYSICS - 物理参数
 * @param {number} config.PHYSICS.GRAVITY - 重力
 * @param {number} config.PHYSICS.FRICTION - 摩擦力
 * @param {number} config.PHYSICS.SCALE_DECAY - 大小衰减率
 * @param {number} config.THROTTLE_MS - 节流时间（毫秒）
 * @returns {Object} 粒子系统状态和处理函数
 */
const useParticleSystem = (config) => {
  const defaultConfig = {
    EMOJIS: ['⭐', '✨', '🎵', '🎶'],
    LIFE: {
      BASE: 40,
      RANDOM: 20,
      BURST: 50
    },
    SIZE: {
      BASE: 12,
      RANDOM: 8,
      BURST: 18
    },
    LIMITS: {
      NORMAL: 200,
      BURST: 300
    },
    PHYSICS: {
      GRAVITY: 0.2,
      FRICTION: 0.95,
      SCALE_DECAY: 0.96
    },
    THROTTLE_MS: 50
  };

  // 合并默认配置和用户配置
  const finalConfig = { ...defaultConfig, ...config };
  
  const [particles, setParticles] = useState([]);

  const createParticle = useCallback(({ x, y, vx = 0, vy = 0, type, life, size }) => ({
    id: Date.now() + Math.random(),
    x,
    y,
    vx,
    vy,
    type,
    life,
    size,
  }), []);

  const mouseMoveHandler = useCallback((e) => {
    const newParticle = createParticle({
      x: e.clientX,
      y: e.clientY,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      type: finalConfig.EMOJIS[Math.floor(Math.random() * finalConfig.EMOJIS.length)],
      life: finalConfig.LIFE.BASE + Math.random() * finalConfig.LIFE.RANDOM,
      size: finalConfig.SIZE.BASE + Math.random() * finalConfig.SIZE.RANDOM
    });
    setParticles((prev) => [...prev.slice(-finalConfig.LIMITS.NORMAL), newParticle]);
  }, [createParticle, finalConfig]);

  const handleMouseMove = useMemo(
    () => throttle(mouseMoveHandler, finalConfig.THROTTLE_MS),
    [mouseMoveHandler, finalConfig.THROTTLE_MS]
  );

  const handleMouseClick = useCallback((e) => {
    const burstParticles = [];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = Math.random() * 5 + 2;
      burstParticles.push(createParticle({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: finalConfig.EMOJIS[Math.floor(Math.random() * finalConfig.EMOJIS.length)],
        life: finalConfig.LIFE.BURST,
        size: finalConfig.SIZE.BURST + Math.random() * finalConfig.SIZE.RANDOM
      }));
    }
    setParticles((prev) => [...prev.slice(-finalConfig.LIMITS.NORMAL), ...burstParticles]);
  }, [createParticle, finalConfig]);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    if (touch) {
      handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    }
  }, [handleMouseMove]);

  // 粒子动画更新
  useEffect(() => {
    let mounted = true;

    const updateParticles = () => {
      if (!mounted) return;

      setParticles((prev) => 
        prev 
          .map((p) => ({
            ...p,
            x: p.x + (p.vx || 0),
            y: p.y + (p.vy || 0) + finalConfig.PHYSICS.GRAVITY,
            vx: (p.vx || 0) * finalConfig.PHYSICS.FRICTION,
            vy: (p.vy || 0) * finalConfig.PHYSICS.FRICTION,
            life: p.life - 1,
            size: p.size * finalConfig.PHYSICS.SCALE_DECAY,
          }))
          .filter((p) => p.life > 0)
          .slice(-finalConfig.LIMITS.BURST)
      );
    };

    const interval = setInterval(updateParticles, 30);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [finalConfig]);

  // 渲染粒子的组件 - 不使用 React Three Fiber 相关功能
  const ParticleRenderer = () => (
    <>
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
            zIndex: 9999,
          }}
        >
          {p.type}
        </span>
      ))}
    </>
  );

  return { 
    particles, 
    handleMouseMove, 
    handleMouseClick, 
    handleTouchMove,
    ParticleRenderer
  };
};

export default useParticleSystem;