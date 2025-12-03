import React, { useEffect, useRef } from 'react';

const MouseParticleEffect = () => {
  // 使用 Ref 存储状态，避免 React 重渲染
  const particlesRef = useRef([]);
  const ripplesRef = useRef([]); // 新增：存储波纹效果
  const canvasRef = useRef(null);
  const animationFrameId = useRef();
  const noteEmojis = ['⭐', '✨', '🎵', '🎶'];
  
  // 节流控制
  const lastParticleTime = useRef(0);

  // 创建拖尾粒子
  const createParticle = (x, y) => {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5, // 稍微增加一点初始速度
      vy: (Math.random() - 0.5) * 1.5,
      emoji: noteEmojis[Math.floor(Math.random() * noteEmojis.length)],
      life: 30 + Math.random() * 15,
      maxLife: 45,
      size: 12 + Math.random() * 8,
    };
  };

  // 创建波纹 (点击效果)
  const createRipple = (x, y) => {
    return {
      x,
      y,
      radius: 10,
      maxRadius: 100,
      alpha: 0.8,
      lineWidth: 3,
      color: `hsl(${Math.random() * 360}, 70%, 70%)` // 随机柔和颜色
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const handleMouseMove = (e) => {
      const now = Date.now();
      // 保持 25ms 的生成间隔，平衡性能与视觉密度
      if (now - lastParticleTime.current > 25) {
        particlesRef.current.push(createParticle(e.clientX, e.clientY));
        lastParticleTime.current = now;
        
        // 限制粒子总数
        if (particlesRef.current.length > 150) {
          particlesRef.current.shift();
        }
      }
    };

    const handleMouseClick = (e) => {
      // 1. 创建视觉波纹 (Sound Wave)
      // 这种仅仅绘制圆圈的操作比绘制文字粒子要快得多
      ripplesRef.current.push(createRipple(e.clientX, e.clientY));

      // 2. 物理交互 (Repulsion/Shockwave)
      // 对现有的粒子施加斥力，产生"冲击波"效果
      // 这复用了现有粒子，不需要创建新对象，极度节省性能且效果酷炫
      const clickX = e.clientX;
      const clickY = e.clientY;
      const repulsionRadius = 200;
      const forceStrength = 15;

      particlesRef.current.forEach(p => {
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < repulsionRadius && distance > 0) {
          const force = (1 - distance / repulsionRadius) * forceStrength;
          p.vx += (dx / distance) * force;
          p.vy += (dy / distance) * force;
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleMouseClick);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // A. 渲染波纹 (底层)
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.lineWidth;
        ctx.globalAlpha = r.alpha;
        ctx.stroke();
        
        // 更新波纹
        r.radius += 2.5; // 扩散速度
        r.alpha -= 0.02; // 消失速度
        r.lineWidth *= 0.95; // 线条变细

        if (r.alpha <= 0) {
          ripplesRef.current.splice(i, 1);
        }
      }

      // B. 渲染粒子 (上层)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        
        p.x += p.vx;
        p.y += p.vy + 0.2; // Gravity
        p.vx *= 0.94; // Friction
        p.vy *= 0.94;
        p.life--;
        p.size *= 0.97;

        if (p.life > 0) {
          ctx.font = `${p.size}px Arial`;
          ctx.globalAlpha = Math.min(p.life / 20, 1);
          ctx.fillStyle = "white"; // Emoji 实际上不受 fillStyle 影响，但为了规范
          ctx.fillText(p.emoji, p.x, p.y);
        } else {
          particlesRef.current.splice(i, 1);
        }
      }
      
      ctx.globalAlpha = 1.0;
      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseClick);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ display: 'block' }}
    />
  );
};

export default MouseParticleEffect;
