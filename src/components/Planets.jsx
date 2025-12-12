import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ------------------------------------------------------------------
// 1. 流体星球 Shader (Fluid Planet Shader)
// ------------------------------------------------------------------
// 增加 uTime 实现流动，使用噪声模拟星云表面
const planetVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;

  // 简单的 3D 噪声函数
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    
    // 顶点微动：让星球表面像呼吸一样微微起伏
    float noiseVal = snoise(position * 0.5 + uTime * 0.2);
    vec3 newPos = position + normal * noiseVal * 0.2;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const planetFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform vec3 uSecondaryColor;
  uniform float uIntensity;
  uniform float uTime;

  // 简单的 2D 噪声
  float random (in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
  }
  float noise (in vec2 st) {
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
    // 1. 动态流体纹理
    // 使用多层噪声混合，产生类似木星表面的流动感
    float n1 = noise(vUv * 3.0 + vec2(uTime * 0.1, 0.0));
    float n2 = noise(vUv * 6.0 - vec2(0.0, uTime * 0.15));
    float fluid = mix(n1, n2, 0.5);
    
    // 混合两种颜色
    vec3 baseColor = mix(uColor, uSecondaryColor, fluid);
    
    // 2. 漫反射 (假定光源在左上方)
    vec3 lightDir = normalize(vec3(-1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    
    // 3. 菲涅尔边缘发光 (Fresnel) - 增强梦幻感
    vec3 viewDirection = normalize(-vPosition);
    float fresnel = dot(viewDirection, vNormal);
    float atmosphere = pow(1.0 - fresnel, 2.5) * uIntensity;
    
    // 呼吸灯效果
    float breath = sin(uTime * 0.5) * 0.1 + 0.9;
    
    // 4. 最终合成
    // 基础色 + 漫反射阴影 + 强烈的边缘发光
    vec3 finalColor = baseColor * (diff * 0.6 + 0.4);
    finalColor += uSecondaryColor * atmosphere * breath;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// ------------------------------------------------------------------
// 2. 粒子光环 (Particle Ring)
// ------------------------------------------------------------------
// 使用 Points 替代 Mesh，彻底解决透明度遮挡问题，并增加闪烁
const ParticleRing = ({ radius, width, color, count = 2000 }) => {
  const pointsRef = useRef();
  
  // 生成粒子数据
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      // 随机角度
      const angle = Math.random() * Math.PI * 2;
      // 随机半径：集中在圆环带上
      // 使用 sqrt 分布让粒子均匀分布在圆环面积上，而不是聚集在内圈
      const r = radius + (Math.random() - 0.5) * width;
      
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // 极薄的厚度
      
      // 颜色微调
      col[i * 3] = baseColor.r;
      col[i * 3 + 1] = baseColor.g;
      col[i * 3 + 2] = baseColor.b;
      
      // 随机大小
      siz[i] = Math.random() * 2;
    }
    return { positions: pos, colors: col, sizes: siz };
  }, [radius, width, color, count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // 缓慢旋转
      pointsRef.current.rotation.z -= 0.0005;
      
      // 简单的闪烁动画可以通过材质的 size 或 opacity 实现，这里保持简单旋转
    }
  });

  return (
    <points ref={pointsRef} rotation={[Math.PI / 3, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size" // 需要在 Shader 中支持，或者使用 PointsMaterial 的 sizeAttenuation
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      {/* 使用标准点材质，开启定点颜色 */}
      <pointsMaterial 
        size={0.15} 
        vertexColors 
        transparent 
        opacity={0.6} 
        sizeAttenuation 
        depthWrite={false} // 关键：关闭深度写入，解决遮挡黑边问题
        blending={THREE.AdditiveBlending} // 发光叠加
      />
    </points>
  );
};


// ------------------------------------------------------------------
// 3. 梦幻星球组件 (Dream Planet Component)
// ------------------------------------------------------------------
const Planet = ({ position, size, color, secondaryColor, ringColor, hasRing, rotationSpeed = 0.002, isMobile }) => {
  const meshRef = useRef();
  const groupRef = useRef();
  
  // 交互：鼠标视差
  const { mouse } = useThree();
  
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uSecondaryColor: { value: new THREE.Color(secondaryColor || color) },
    uIntensity: { value: 1.2 },
    uTime: { value: 0 }
  }), [color, secondaryColor]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Shader 动画
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = time;
      meshRef.current.rotation.y += rotationSpeed;
    }
    
    // 视差交互 (仅桌面端)
    if (!isMobile && groupRef.current) {
      // 目标位置：原始位置 + 鼠标偏移
      // 越远的物体视差越小，这里简化处理，统一轻微移动
      const targetX = position[0] + mouse.x * 2;
      const targetY = position[1] + mouse.y * 2;
      
      // 平滑插值 (Lerp)
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;
      
      // 轻微注视旋转
      groupRef.current.rotation.x = mouse.y * 0.05;
      groupRef.current.rotation.y = mouse.x * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 行星主体 */}
      <mesh ref={meshRef}>
        {/* 增加几何体段数以支持顶点波动，移动端适当降低 */}
        <sphereGeometry args={[size, isMobile ? 32 : 64, isMobile ? 32 : 64]} />
        <shaderMaterial
          vertexShader={planetVertexShader}
          fragmentShader={planetFragmentShader}
          uniforms={uniforms}
          transparent // 开启透明，配合边缘发光
        />
      </mesh>
      
      {/* 粒子光环 */}
      {hasRing && (
        <ParticleRing 
          radius={size * 1.8} 
          width={size * 1.5} 
          color={ringColor} 
          count={isMobile ? 800 : 2000} // 移动端减少粒子
        />
      )}
    </group>
  );
};

const Planets = ({ isMobile }) => {
  return (
    <group>
      {/* 
        主行星：梦幻粉蓝渐变 (Unicorn)
        - 巨大的流体水晶球
      */}
      <Planet 
        isMobile={isMobile}
        position={[50, 30, -100]} 
        size={22} 
        color="#fbcfe8" // Pink 200
        secondaryColor="#22d3ee" // Cyan 400
        ringColor="#ffe4e6" // Rose 100
        hasRing={true}
        rotationSpeed={0.0005}
      />

      {/* 伴星 1：橙色琥珀 (Amber) */}
      <Planet 
        isMobile={isMobile}
        position={[-50, 15, -130]} 
        size={10} 
        color="#fcd34d" // Amber 300
        secondaryColor="#fb923c" // Orange 400
        hasRing={false}
        rotationSpeed={0.001}
      />
      
      {/* 增加一些环境点光源，照亮这些发光体附近的星尘 */}
      <pointLight position={[40, 30, -80]} intensity={1.5} color="#fbcfe8" distance={100} />
      <pointLight position={[-50, 15, -110]} intensity={1} color="#fcd34d" distance={80} />
    </group>
  );
};

export default Planets;
