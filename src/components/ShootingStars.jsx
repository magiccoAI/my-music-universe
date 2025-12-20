import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 流星材质 Shader
const shootingStarShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uOpacity;

    void main() {
      // vUv.x: 0 (尾部) -> 1 (头部)
      // vUv.y: 0 (下边缘) -> 1 (上边缘)

      // 头部高亮，尾部渐隐
      // 使用 x^2 让尾部淡出得更快
      float tailFade = pow(vUv.x, 2.0); 

      // 纵向居中发光 (模拟线条粗细)
      float distY = abs(vUv.y - 0.5) * 2.0; // 0 (center) -> 1 (edge)
      float shape = 1.0 - distY;
      shape = pow(shape, 3.0); // 边缘锐化，使线条看起来更细更亮

      float alpha = tailFade * shape * uOpacity;
      
      // 头部更白 (x 接近 1 时混合白色)
      vec3 finalColor = mix(uColor, vec3(1.0), smoothstep(0.8, 1.0, vUv.x));

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

const ShootingStar = ({ id, onComplete }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  
  // 初始化流星参数
  const config = useMemo(() => {
    // 随机位置：
    // X: -40 到 40 (宽范围)
    // Y: 10 到 30 (高空)
    // Z: -30 到 -60 (背景深处)
    const startX = (Math.random() - 0.5) * 80;
    const startY = 15 + Math.random() * 25; 
    const startZ = -30 - Math.random() * 30;
    
    const position = new THREE.Vector3(startX, startY, startZ);
    
    // 随机方向：斜向下
    // X 速度：随机左右
    // Y 速度：必定向下 (-10 到 -20)
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 30, 
      -15 - Math.random() * 15,   
      0
    );
    
    // 计算旋转角 (Z轴旋转)，使平面长轴对齐速度方向
    const angleZ = Math.atan2(velocity.y, velocity.x);

    // 随机尺寸
    // 长: 8 - 15
    // 宽: 0.2 - 0.4
    const length = 8 + Math.random() * 7;
    const width = 0.2 + Math.random() * 0.2;

    // 随机颜色 (青色、淡紫、白色)
    const colors = ['#a5f3fc', '#e879f9', '#ffffff', '#c4b5fd'];
    const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);

    return {
      position,
      velocity,
      scale: [length, width, 1],
      rotationZ: angleZ,
      speed: 1.0 + Math.random() * 0.5, // 速度倍率
      lifetime: 1.2 + Math.random() * 1.0, // 存活时间
      color
    };
  }, []);

  const [finished, setFinished] = useState(false);
  const time = useRef(0);

  useFrame((state, delta) => {
    if (finished) return;

    time.current += delta;
    
    if (time.current > config.lifetime) {
      setFinished(true);
      onComplete(id);
      return;
    }

    // 移动
    if (meshRef.current) {
        meshRef.current.position.addScaledVector(config.velocity, delta * config.speed);
    }
    
    // 渐隐控制
    if (materialRef.current) {
        // 快速淡入 (0.2s)，最后 0.3s 淡出
        const fadeIn = Math.min(time.current * 5.0, 1.0);
        const fadeOut = Math.max(0.0, Math.min(1.0, (config.lifetime - time.current) * 3.0));
        materialRef.current.uniforms.uOpacity.value = fadeIn * fadeOut;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={config.position} 
      rotation={[0, 0, config.rotationZ]}
      scale={config.scale}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={shootingStarShader.vertexShader}
        fragmentShader={shootingStarShader.fragmentShader}
        uniforms={{
            uColor: { value: config.color },
            uOpacity: { value: 0.0 }
        }}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

const ShootingStars = () => {
  const [stars, setStars] = useState([]);
  const nextId = useRef(0);
  const timeoutRef = useRef();

  useEffect(() => {
    const spawnStar = () => {
        // 如果标签页不可见，可能不需要生成？(useFrame 会暂停，但 setTimeout 不会)
        // 不过 React 状态更新是安全的。
        
        const id = nextId.current++;
        setStars(prev => [...prev, { id }]);
        
        // 随机下次生成时间 (2秒 - 8秒)
        const nextDelay = 2000 + Math.random() * 6000; 
        timeoutRef.current = setTimeout(spawnStar, nextDelay);
    };

    // 初始延迟
    timeoutRef.current = setTimeout(spawnStar, 2000);
    
    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const removeStar = (id) => {
    setStars(prev => prev.filter(s => s.id !== id));
  };

  return (
    <group>
      {stars.map(star => (
        <ShootingStar key={star.id} id={star.id} onComplete={removeStar} />
      ))}
    </group>
  );
};

export default ShootingStars;
