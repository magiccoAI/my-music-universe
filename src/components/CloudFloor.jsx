import React, { useMemo } from 'react';
import { Clouds, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import useIsMobile from '../hooks/useIsMobile';

const CloudFloor = () => {
  const isMobile = useIsMobile();

  // 移动端使用更简化的配置以保证性能
  const segments = isMobile ? 20 : 40;
  const bounds = isMobile ? [40, 4, 40] : [80, 6, 80];
  const volume = isMobile ? 10 : 20;

  // 材质配置：使用 MeshLambertMaterial 以获得更好的光照效果
  // 颜色微调为暖白色，模拟阳光照射
  const cloudMaterial = useMemo(() => new THREE.MeshLambertMaterial({
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    color: '#ffffff'
  }), []);

  return (
    <group position={[0, -15, -20]}>
      {/* 使用 Drei 的 Clouds (Instanced) 组件，性能优异 */}
      <Clouds material={THREE.MeshLambertMaterial} limit={400} texture={undefined}>
        <Cloud 
          seed={10}
          bounds={bounds} 
          volume={volume} 
          color="#ffffff" 
          position={[0, 0, 0]}
          segments={segments}
          opacity={0.6}
          speed={0.1} // 缓慢移动
          growth={4} // 体积膨胀感
          smallestVolume={0.4} // 最小体积
          distribute={(cloud, index) => ({
             point: cloud.position,
             rotation: cloud.rotation,
             volume: cloud.volume,
          })}
        />
        
        {/* 第二层，增加层次感 */}
        {!isMobile && (
          <Cloud 
            seed={20}
            bounds={[bounds[0] * 1.2, bounds[1], bounds[2] * 1.2]} 
            volume={volume * 0.8} 
            color="#edf2f7" // 稍带冷色阴影
            position={[10, -2, 10]}
            segments={segments}
            opacity={0.4}
            speed={0.15}
            growth={3}
          />
        )}
      </Clouds>
      
      {/* 底部环境光补光，防止云层底部过黑 */}
      <pointLight position={[0, -10, 0]} intensity={0.5} color="#e6f0ff" distance={50} decay={2} />
    </group>
  );
};

export default CloudFloor;
