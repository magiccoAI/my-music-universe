import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DesktopBoat = ({ position }) => {
  const groupRef = useRef();
  
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    
    // 🌍 关键修复：计算世界坐标下的波浪高度
    // 船只在父级 group ([25, -5, -40]) 中的本地位置是固定的，
    // 我们需要将其转换为世界坐标来匹配 DynamicWaveWater 的着色器算法
    const worldX = 25 - 8; // 父级 X + 本地 X
    const worldZ = -40 + 5; // 父级 Z + 本地 Z

    // 🌊 动画核心: 与 DynamicWaveWater 的波动算法完全同步
    let waterY = Math.sin(worldX * 0.05 + t * 0.5) * 1.5;
    waterY += Math.cos(worldZ * 0.05 + t * 0.5) * 1.5;
    waterY += Math.sin(worldX * 0.2 + t) * 0.5;

    // ⚖️ 浮力调整：
    // 1. 移除重复的 -5 基础高度（父级已经处于 -5）
    // 2. 提升浮力偏移到 0.8，确保船底（本地 y=-0.2）处于 waterY + 0.6 的位置
    groupRef.current.position.y = waterY + 0.8;

    // 2. 计算水面法线 (用于船体摇摆)
    const dfdx = 0.075 * Math.cos(worldX * 0.05 + t * 0.5) + 0.1 * Math.cos(worldX * 0.2 + t);
    const dfdz = -0.075 * Math.sin(worldZ * 0.05 + t * 0.5);

    // ⛵ 摇摆动画
    groupRef.current.rotation.z = dfdx * 0.3;
    groupRef.current.rotation.x = dfdz * 0.3;
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, -Math.PI / 6, 0]} scale={[1.8, 1.8, 1.8]}>
      {/* 🚤 船身 - 极简几何体 */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {/* 上宽下窄的船身，横向放置 */}
        <cylinderGeometry args={[0.5, 0.25, 2.5, 6]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>
      
      {/* 甲板装饰（防止看穿） */}
      <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
         <boxGeometry args={[0.8, 2.2, 0.1]} />
         <meshStandardMaterial color="#573e29" roughness={0.9} />
      </mesh>

      {/* 🚩 桅杆 */}
      <mesh position={[0, 1.8, 0.3]}>
        <cylinderGeometry args={[0.04, 0.06, 3.5, 4]} />
        <meshStandardMaterial color="#2a1810" roughness={0.9} />
      </mesh>

      {/* 🏳️ 主帆 - 白色三角帆 */}
      <mesh position={[0, 2.0, 0.8]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 0.1]}>
         {/* 压扁的圆锥体作为帆 */}
         <coneGeometry args={[1.2, 2.5, 4]} />
         <meshStandardMaterial color="#fefce8" roughness={0.4} />
      </mesh>
      
      {/* 🏳️ 副帆 - 小三角帆 */}
      <mesh position={[0, 1.2, -0.6]} rotation={[0, Math.PI / 2, 0]} scale={[0.8, 0.8, 0.1]}>
         <coneGeometry args={[0.8, 1.8, 4]} />
         <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
      </mesh>

      {/* 🏮 新增：船头挂灯 - 增加氛围感 */}
      <group position={[0, 1, 1.3]}>
        <mesh>
          <boxGeometry args={[0.2, 0.3, 0.2]} />
          <meshStandardMaterial color="#fcd34d" emissive="#fbbf24" emissiveIntensity={2} />
        </mesh>
        <pointLight intensity={5} distance={10} color="#fbbf24" />
      </group>
    </group>
  );
};

export default DesktopBoat;
