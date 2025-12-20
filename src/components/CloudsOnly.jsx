import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud } from '@react-three/drei';

// ☁️ 移动端极简云朵 (Low Poly Cloud)
// 使用简单的几何体组合，替代昂贵的体积云渲染
const MobileSimpleCloud = ({ position, scale = 1, speed = 0.5 }) => {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // 缓慢漂浮
    groupRef.current.position.x = position[0] + Math.sin(t * speed * 0.2) * 2;
    // 微微上下浮动
    groupRef.current.position.y = position[1] + Math.sin(t * speed * 0.5) * 0.5;
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* 主体 */}
      <mesh position={[0, 0, 0]}>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      {/* 左侧团块 */}
      <mesh position={[-1.2, -0.2, 0.5]} scale={0.7}>
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      {/* 右侧团块 */}
      <mesh position={[1.2, 0.3, -0.5]} scale={0.8}>
        <dodecahedronGeometry args={[1.3, 0]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      {/* 顶部团块 */}
      <mesh position={[0.4, 1.0, 0]} scale={0.6}>
        <dodecahedronGeometry args={[1.1, 0]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

const CloudsOnly = ({ isMobile }) => {
  if (!isMobile) {
    return (
      <group>
        <ambientLight intensity={1.5} />
        <directionalLight position={[0, 10, 5]} intensity={2.0} color="#ffffff" />
        <directionalLight position={[0, -10, 0]} intensity={0.5} color="#e6f0ff" />
        
        {/* 桌面端：使用 Drei 的仿真体积云 */}
        <Cloud
          opacity={0.5}
          speed={0.4} // 飘动速度
          width={20} // 云层宽度
          depth={5}  // 云层深度
          segments={40} // 粒子数量
          position={[0, 5, -20]}
          color="#ffffff"
        />
        <Cloud
          opacity={0.5}
          speed={0.3}
          width={15}
          depth={3}
          segments={30}
          position={[-15, 8, -25]}
          color="#ecfdf5" // 微微带点青色
        />
        <Cloud
          opacity={0.5}
          speed={0.35}
          width={15}
          depth={3}
          segments={30}
          position={[15, 2, -25]}
          color="#fff7ed" // 微微带点暖色
        />
      </group>
    );
  }

  return (
    <group>
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 10, 5]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[0, -10, 0]} intensity={0.5} color="#e6f0ff" />
      <MobileSimpleCloud position={[0, 4, -15]} scale={isMobile ? 1.5 : 2.0} speed={0.5} />
      <MobileSimpleCloud position={[-10, 6, -22]} scale={isMobile ? 1.2 : 1.6} speed={0.35} />
      <MobileSimpleCloud position={[10, 2, -25]} scale={isMobile ? 1.1 : 1.5} speed={0.4} />
      <MobileSimpleCloud position={[18, 8, -30]} scale={isMobile ? 0.95 : 1.3} speed={0.25} />
      <MobileSimpleCloud position={[-20, 3, -28]} scale={isMobile ? 0.9 : 1.2} speed={0.28} />
    </group>
  );
};

export default CloudsOnly;
