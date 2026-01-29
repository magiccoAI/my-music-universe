import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = ` 
 varying vec2 vUv; 
 varying float vElevation; 
 uniform float uTime; 
 void main() { 
 vUv = uv; 
 vec4 modelPosition = modelMatrix * vec4(position, 1.0); 
 
 // 简单的顶点波动，模拟飘动感 
 float elevation = sin(modelPosition.x * 0.5 + uTime * 0.5) * 0.5 
 + sin(modelPosition.z * 0.3 + uTime * 0.3) * 0.5; 
 
 modelPosition.y += elevation; 
 vElevation = elevation; 
 vec4 viewPosition = viewMatrix * modelPosition; 
 vec4 projectedPosition = projectionMatrix * viewPosition; 
 gl_Position = projectedPosition; 
 } 
 `; 
 const fragmentShader = ` 
 varying vec2 vUv; 
 varying float vElevation; 
 uniform float uTime; 
 uniform vec3 uColor1; 
 uniform vec3 uColor2; 
 // 简单的伪随机函数 
 float random(vec2 st) { 
 return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); 
 } 
 // 2D 噪声 
 float noise(vec2 st) { 
 vec2 i = floor(st); 
 vec2 f = fract(st); 
 float a = random(i); 
 float b = random(i + vec2(1.0, 0.0)); 
 float c = random(i + vec2(0.0, 1.0)); 
 float d = random(i + vec2(1.0, 1.0)); 
 vec2 u = f * f * (3.0 - 2.0 * f); 
 return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y; 
 } 
 void main() { 
 // 极光纹理生成 
 float t = uTime * 0.2; 
 
 // 多层噪声叠加，模拟极光的光束 
 float strength = 0.0; 
 
 // 第一层 
 float n1 = noise(vec2(vUv.x * 10.0 + t, vUv.y * 2.0 - t * 0.5)); 
 strength += n1 * 0.5; 
 
 // 第二层 - 更细的细节 
 float n2 = noise(vec2(vUv.x * 20.0 - t * 1.5, vUv.y * 5.0 + t * 0.2)); 
 strength += n2 * 0.3; 
 
 // 限制范围，让光带更清晰 
 // strength = smoothstep(0.3, 0.8, strength); 
 strength = smoothstep(0.2, 0.9, strength); // 增加对比度 
 
 // 垂直渐变：底部强，顶部弱 
 float yFade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.2, vUv.y); 
 // 水平渐变：左右两侧淡出，解决遮罩边缘可见问题 
 float xFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x); 
 float alpha = strength * yFade * xFade; 
 
 // 颜色混合 
 vec3 color = mix(uColor1, uColor2, vUv.y + strength * 0.2); 
 
 // 增加一点发光感 
 // color += vec3(strength * 0.2); 
 
 // 整体颜色增强，更强烈 
 color = color * 2.0 + vec3(strength * 0.5); 
 gl_FragColor = vec4(color, alpha * 0.8); // 稍微提高透明度基数 
 } 
 `; 
 const SimpleAurora = ({ position = [0, 10, -50], scale = [1, 1, 1], isMobile = false }) => { 
 const materialRef1 = useRef(); 
 const materialRef2 = useRef(); 
 
 const uniforms = useMemo(() => ({ 
 uTime: { value: 0 }, 
 uColor1: { value: new THREE.Color('#22c55e') }, // 更鲜艳的绿色 
 uColor2: { value: new THREE.Color('#d946ef') }, // 更鲜艳的紫色 (Fuchsia) 
 }), []); 
 useFrame(({ clock }) => { 
 const time = clock.getElapsedTime(); 
 if (materialRef1.current) { 
 materialRef1.current.uniforms.uTime.value = time; 
 } 
 if (materialRef2.current) { 
 materialRef2.current.uniforms.uTime.value = time; 
 } 
 }); 
 // 移动端优化配置 
 const geometryArgs = isMobile 
 ? [100, 40, 24, 24] // 移动端大幅降低顶点数 (64->24) 
 : [100, 40, 64, 64]; // 桌面端保持高精度 
 return ( 
 <group position={position} scale={scale}> 
 {/* 创建几个不同层次的极光带 */} 
 <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}> 
        <planeGeometry args={geometryArgs} /> 
        <shaderMaterial 
          ref={materialRef1} 
          uniforms={uniforms} 
          vertexShader={vertexShader} 
          fragmentShader={fragmentShader} 
          transparent={true} 
          side={THREE.DoubleSide} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
        /> 
      </mesh> 
      {/* 移动端优化：只渲染一层极光以减少 Overdraw（过度绘制）。
          桌面端保留两层以获得更丰富的层次感。 */} 
      {!isMobile && (
        <mesh position={[0, -5, -10]} rotation={[0, 0.1, 0]}> 
          <planeGeometry args={[100, 40, 64, 64]} /> 
          <shaderMaterial 
            ref={materialRef2} 
            uniforms={{ 
              ...uniforms, 
              uTime: { value: 0 }, 
              uColor1: { value: new THREE.Color('#06b6d4') }, // 鲜艳的青色 (Cyan 500) 
              uColor2: { value: new THREE.Color('#e879f9') } // 鲜艳的粉紫 (Purple 400) 
            }} 
            vertexShader={vertexShader} 
            fragmentShader={fragmentShader} 
            transparent={true} 
            side={THREE.DoubleSide} 
            depthWrite={false} 
            blending={THREE.AdditiveBlending} 
          /> 
        </mesh> 
      )}
    </group> 
  ); 
};
 export default SimpleAurora;