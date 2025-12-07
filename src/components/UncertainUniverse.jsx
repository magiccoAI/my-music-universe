import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// 模拟数据 - 实际项目中可以使用你的音乐数据
const MOCK_DATA = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  title: `Artwork ${i + 1}`,
  year: 2016 + (i % 8),
  type: i % 2 === 0 ? 'Artwork' : 'Installation',
  // 随机分布在 3D 空间中
  position: [
    (Math.random() - 0.5) * 30, // x: -15 to 15
    (Math.random() - 0.5) * 20, // y: -10 to 10
    (Math.random() - 0.5) * 15 - 5 // z: -12.5 to 2.5 (bias away from camera)
  ],
  color: new THREE.Color().setHSL(Math.random(), 0.6, 0.6)
}));

function FloatingCard({ data }) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  // 缓慢漂浮动画
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + data.id) * 0.002;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + data.id) * 0.05;
    }
  });

  return (
    <group position={data.position}>
      {/* 卡片主体 (PlaneGeometry) */}
      <mesh 
        ref={meshRef}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.1 : 1}
      >
        <planeGeometry args={[3, 2]} /> {/* 3x2 aspect ratio */}
        <meshStandardMaterial 
          color={data.color} 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 关联的文字信息 (Html组件) */}
      {/* @react-three/drei 的 Html 组件可以将 DOM 元素“粘”在 3D 物体上 */}
      <Html
        position={[0, -1.2, 0]} // 位于卡片下方
        center
        distanceFactor={15} // 根据距离缩放大小
        style={{
          pointerEvents: 'none', // 让鼠标事件穿透到后面的 3D 场景
          whiteSpace: 'nowrap',
          color: 'black',
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 0.3s'
        }}
      >
        <div style={{ fontFamily: 'sans-serif', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{data.title}</div>
          <div style={{ fontSize: '0.8em', color: '#555' }}>
            {data.year} · {data.type}
          </div>
        </div>
      </Html>
    </group>
  );
}

function FogController() {
  // 添加雾效，这是 "Uncertain" 风格的关键
  // 雾的颜色应该与背景色一致 (这里假设是浅灰色/白色)
  return <fog attach="fog" args={['#f0f0f0', 5, 35]} />;
}

export default function UncertainUniverse() {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#f0f0f0' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        
        {/* 雾效：让远处的物体逐渐消失，产生“不确定性”和深度的感觉 */}
        <FogController />
        
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} />

        <group>
          {MOCK_DATA.map((item) => (
            <FloatingCard key={item.id} data={item} />
          ))}
        </group>

        {/* 允许用户旋转和缩放查看 */}
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
