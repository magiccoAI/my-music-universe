import React, { useRef } from 'react';
import { Cloud } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

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
      {/* 核心材质：纯白、不发光、轻微透明 */}
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      
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
  // 移动端：使用极简几何体云朵
  if (isMobile) {
      return (
        <group>
           {/* 1. 强力环境光：确保云朵是白的 */}
           <ambientLight intensity={1.5} />
           
           {/* 2. 移动端云朵实例 */}
           <MobileSimpleCloud position={[0, 4, -15]} scale={1.5} speed={0.5} />
        </group>
      );
  }

  // 桌面端：保持原有高质量体积云
  return (
    <group>
      {/* 
        💡 光照增强系统
        默认场景只有 intensity=0.5 的环境光，这会导致白色云朵看起来是灰色的（被阴影覆盖）。
        为了实现纯白云朵效果，我们在云层组件内部添加强光源，这只会影响“白天”主题
        （因为 CloudsOnly 组件只有在白天主题下才会被加载渲染）。
      */}
      
      {/* 1. 强力环境光：消除阴影，提升整体亮度基准 */}
      <ambientLight intensity={1.5} />
      
      {/* 2. 模拟太阳光：从上方照射，给云层顶部增加高光 */}
      <directionalLight position={[0, 10, 5]} intensity={2.0} color="#ffffff" />
      
      {/* 3. 补光：从下方微弱照射，防止云底太黑 */}
      <directionalLight position={[0, -10, 0]} intensity={0.5} color="#e6f0ff" />


      {/* 
        ☁️ 云层系统 
        Cloud 组件参数说明:
        opacity: 云朵透明度
        speed: 飘动速度
        width: 云朵宽度范围
        depth: 云朵深度范围
        segments: 云朵分段数（影响精细度，越低性能越好）
        position: [x, y, z] 位置
        color: 云朵颜色
      */}
      
      {/* 背景层：略带一点点灰度增加体积感，但整体要亮 */}
      <Cloud 
        opacity={0.5} 
        speed={0.2} 
        width={20} 
        depth={1.5} 
        segments={isMobile ? 10 : 20} // 移动端降低分段
        position={[0, -5, -20]}
        color="#f0f0f0" 
      />
      
      {/* 移动端只保留核心云朵，减少渲染压力 */}
      {!isMobile && (
        <>
            {/* 中景层：高亮纯白云朵 */}
            <Cloud 
                opacity={0.9} 
                speed={0.25} 
                width={10} 
                depth={2} 
                segments={20} 
                position={[-8, 2, -12]} // 左上方
                color="#ffffff" 
            />

            <Cloud 
                opacity={0.9} 
                speed={0.25} 
                width={10} 
                depth={2} 
                segments={20} 
                position={[8, -2, -12]} // 右下方
                color="#ffffff" 
            />

            {/* 远景点缀 */}
            <Cloud 
                opacity={0.7} 
                speed={0.2} 
                width={15} 
                depth={1} 
                segments={15} 
                position={[-15, 10, -18]} 
                color="#ffffff" 
            />

            <Cloud 
                opacity={0.7} 
                speed={0.2} 
                width={15} 
                depth={1} 
                segments={15} 
                position={[15, 5, -15]} 
                color="#ffffff" 
            />
        </>
      )}

      {/* 移动端保留核心云朵，但稍微简化参数以平衡性能与效果 */}
      {isMobile && (
        <>
          {/* 主云朵：左上 */}
          <Cloud 
              opacity={0.8} 
              speed={0.2} 
              width={10} 
              depth={1} 
              segments={10} 
              position={[-6, 4, -15]} 
              color="#ffffff" 
          />
          
          {/* 辅助云朵：右下，平衡构图 */}
          <Cloud 
              opacity={0.8} 
              speed={0.25} 
              width={12} 
              depth={1.5} 
              segments={8} 
              position={[6, -2, -15]} 
              color="#ffffff" 
          />
        </>
      )}
    </group>
  );
};

export default CloudsOnly;
