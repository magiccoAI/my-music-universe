import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Cloud } from '@react-three/drei';
import * as THREE from 'three';

// 3D 立体彩虹 Shader (环形几何体)
const Rainbow3DShader = {
  vertexShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uOpacity;

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
      // 基于环形几何体的UV坐标生成彩虹
      float angle = atan(vPosition.x, vPosition.z); // 环形角度
      float radius = length(vPosition.xz); // 环形半径
      
      // 彩虹颜色映射 (从内到外)
      float hue = (radius - 70.0) / 15.0; // 70-85半径范围
      hue = clamp(hue, 0.0, 1.0);
      
      // 彩虹颜色序列 (从内到外: 紫→蓝→青→绿→黄→橙→红)
      vec3 rainbowColor = hsv2rgb(vec3(0.8 - hue * 0.8, 0.9, 1.0));
      
      // 基于法线的透明度 (让彩虹看起来更立体)
      float normalFactor = abs(dot(vNormal, vec3(0.0, 1.0, 0.0)));
      float alpha = smoothstep(0.3, 0.7, normalFactor);
      
      // 边缘柔化
      alpha *= smoothstep(70.0, 72.0, radius) * smoothstep(85.0, 83.0, radius);
      
      // 动态光效
      float glow = sin(uTime * 0.5 + angle * 3.0) * 0.1 + 0.9;
      rainbowColor *= glow;
      
      // 总体透明度控制
      alpha *= uOpacity * 0.6;
      
      gl_FragColor = vec4(rainbowColor, alpha);
    }
  `
};

// 3D 地面草地 Shader - 增强版
const MeadowGroundShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vNormal;
    uniform float uTime;
    
    // 噪声函数
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
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
      vUv = uv;
      vec3 pos = position;
      vNormal = normal;
      
      // 增强地形起伏 - 更自然的丘陵
      float elevation = noise(pos.xy * 0.03) * 6.0;
      elevation += noise(pos.xy * 0.01 + uTime * 0.1) * 2.0; // 动态起伏
      elevation += noise(pos.xy * 0.08) * 3.0; // 细节起伏
      pos.z += elevation;
      
      // 草叶风效 - 顶点动画
      float windStrength = noise(pos.xy * 0.2 + uTime * 0.5) * 0.3;
      pos.x += sin(pos.y * 2.0 + uTime * 2.0) * windStrength;
      pos.y += cos(pos.x * 2.0 + uTime * 1.8) * windStrength * 0.5;
      
      vPos = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vNormal;
    uniform float uTime;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

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
      vec2 pos = vPos.xy * 0.1;
      
      // 增强风效
      float wind = noise(pos * 0.5 + vec2(uTime * 0.2, uTime * 0.1));
      float windDetail = noise(pos * 3.0 + vec2(uTime * 0.3, 0.0));
      
      // 高级草地配色 - 明亮非墨绿色系
      vec3 soil = vec3(0.18, 0.15, 0.1); // 土壤底色 - 更明亮
      vec3 shadowGreen = vec3(0.15, 0.4, 0.2); // 阴影区绿 - 更明亮
      vec3 midGreen = vec3(0.3, 0.7, 0.3); // 中间调草绿 - 鲜亮
      vec3 highlightGreen = vec3(0.5, 0.9, 0.4); // 高光嫩绿 - 非常明亮
      
      // 基于法线方向的光照模拟
      float lightFactor = max(0.0, dot(vNormal, vec3(0.0, 1.0, 0.0))) + 0.3;
      
      // 基于噪声的草地纹理
      float grassPattern = noise(pos * 8.0);
      vec3 grass = mix(shadowGreen, midGreen, grassPattern);
      grass = mix(grass, highlightGreen, wind * 0.4 + lightFactor * 0.3);
      
      // 土壤显露（在陡坡或特定区域）
      float slope = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 1.0, 0.0)));
      grass = mix(grass, soil, slope * 0.8);
      
      // 花朵生成系统 - 增强版
      float flowerDensity = noise(pos * 6.0 + vec2(50.0));
      float flowerMask = smoothstep(0.75, 0.85, flowerDensity);
      
      // 多种花朵类型
      float flowerType = noise(pos * 2.0);
      vec3 flowerColor;
      
      if (flowerType < 0.33) {
        // 白色雏菊
        flowerColor = vec3(1.0, 0.98, 0.92);
        flowerColor += vec3(noise(pos * 20.0) * 0.1); // 花瓣细节
      } else if (flowerType < 0.66) {
        // 淡紫色薰衣草
        flowerColor = vec3(0.8, 0.7, 0.9);
        flowerColor = mix(flowerColor, vec3(0.9, 0.8, 1.0), windDetail);
      } else {
        // 黄色小野花
        flowerColor = vec3(1.0, 0.9, 0.4);
        flowerColor *= (0.9 + noise(pos * 15.0) * 0.2); // 颜色变化
      }
      
      // 花朵大小和分布
      float flowerSize = smoothstep(0.8, 0.9, flowerDensity);
      vec3 finalColor = mix(grass, flowerColor, flowerMask * flowerSize);
      
      // 距离淡出效果 (移除青绿色雾气，仅保留边缘透明)
      float dist = length(vPos.xy);
      
      // 让草地在边缘自然透明消失，不添加雾气颜色
      float alpha = 1.0 - smoothstep(120.0, 150.0, dist);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

const RainbowMeadow = () => {
  const meadowRef = useRef();
  const rainbowRef = useRef(); // This ref will now be attached to the Mesh
  const rainbowMaterialRef = useRef(); // Separate ref for material uniforms
  
  const meadowUniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  const rainbowUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 1.0 }
  }), []);

  useFrame((state) => {
    if (meadowRef.current) {
      meadowRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    if (rainbowMaterialRef.current) {
      rainbowMaterialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    if (rainbowRef.current) {
      // 让彩虹缓慢浮动 - 直接操作 Mesh
      rainbowRef.current.position.y = 10 + Math.sin(state.clock.getElapsedTime() * 0.2) * 2;
    }
  });

  return (
    <group>
      {/* 无限延伸的草地 (旋转圆盘) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]}>
        <circleGeometry args={[150, 64]} />
        <shaderMaterial
          ref={meadowRef}
          vertexShader={MeadowGroundShader.vertexShader}
          fragmentShader={MeadowGroundShader.fragmentShader}
          uniforms={meadowUniforms}
          transparent
        />
      </mesh>

      {/* 3D 立体虹桥 (置于专辑墙后面) */}
      <mesh 
        ref={rainbowRef}
        position={[0, 8, -20]} 
        rotation={[0, 0, 0]}
      >
        <torusGeometry args={[40, 8, 32, 32, Math.PI * 0.6]} />
        <shaderMaterial
          ref={rainbowMaterialRef}
          vertexShader={Rainbow3DShader.vertexShader}
          fragmentShader={Rainbow3DShader.fragmentShader}
          uniforms={rainbowUniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 漂浮的花瓣/光尘粒子 */}
      <Sparkles 
        count={200}
        scale={[60, 20, 60]}
        size={4}
        speed={0.4}
        opacity={0.5}
        color="#fff"
        position={[0, -5, 0]}
      />
      
      {/* 远处的装饰云 */}
      <Cloud position={[-40, 20, -60]} opacity={0.5} speed={0.2} segments={20} />
      <Cloud position={[40, 30, -70]} opacity={0.5} speed={0.2} segments={20} />

    </group>
  );
};

export default RainbowMeadow;
