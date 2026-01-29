import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  void main() {
    vUv = uv;
    // 全向遮罩，用于在边缘处减弱顶点位移，防止穿透
    float edgeFactor = pow(4.0 * uv.x * (1.0 - uv.x), 1.0);
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // 模拟极光的幕布褶皱感 (Curtain folds)
    float fold = sin(modelPosition.x * 0.15 + uTime * 0.2) * 2.0;
    fold += sin(modelPosition.x * 0.35 - uTime * 0.1) * 1.0;
    
    // 增加垂直方向的扭动
    float ripple = sin(modelPosition.z * 0.2 + uTime * 0.3) * 1.5;
    
    // 应用边缘权重，减弱位移
    modelPosition.z += (fold + ripple) * edgeFactor;
    modelPosition.y += sin(modelPosition.x * 0.1 + uTime * 0.1) * 2.0 * edgeFactor;
    
    // ----------------------------------------------------------------------
    // 新增：极光幕透视视觉效果 (Perspective Visual Effect)
    // ----------------------------------------------------------------------
    // 目标：使靠近“专辑墙”一侧（假设为 UV.x ~ 0.5 或特定角度）的极光幕看起来更高大
    // 实现：根据 UV.x 计算高度缩放因子
    
    // 将 UV.x 映射到 -1 到 1 (0 -> -1, 0.5 -> 0, 1 -> 1) 
    // 或者直接使用 sin/cos 函数
    // 假设 UV.x = 0.5 是正对专辑墙的位置 (视线前方)
    
    float viewAngle = uv.x * 6.28318; // 0 ~ 2PI
    
    // 使用 cosine 函数创建一个平滑的波峰
    // 当 uv.x = 0.5 (PI) 时，cos(PI) = -1。我们希望这里最大。
    // 所以使用 -cos(angle) 或者 cos(angle + PI)
    // scaleFactor 范围：1.0 (远端) ~ 1.6 (近端)
    
    float heightScale = 1.3 + 0.4 * -cos(viewAngle); 
    
    // 仅缩放 Y 轴，保持底部相对稳定（如果需要）
    // 这里简单地整体缩放 Y
    modelPosition.y *= heightScale;

    // ----------------------------------------------------------------------
    
    vElevation = fold + ripple;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform vec3 uColor1; // 底部颜色 (通常是绿色)
  uniform vec3 uColor2; // 中部颜色
  uniform vec3 uColor3; // 顶部颜色 (通常是红色/紫色)
  uniform float uIntensity;
  uniform float uOpacity;
  
  // 简单的伪随机函数
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  // 1D 噪声，用于生成垂直射线
  float noise(float x) {
      float i = floor(x);
      float f = fract(x);
      float u = f * f * (3.0 - 2.0 * f);
      return mix(random(vec2(i, 0.0)), random(vec2(i + 1.0, 0.0)), u);
  }
  
  // FBM (Fractal Brownian Motion) 用于更自然的射线
  float fbm(float x) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
          v += a * noise(x);
          x = x * 2.0;
          a *= 0.5;
      }
      return v;
  }
  
  void main() {
    float t = uTime * 0.3;
    
    // 生成垂直射线效果 (Vertical Rays)
    // 通过大幅拉伸 X 方向的噪声并保持 Y 方向相对静止
    float rayX = vUv.x * 25.0 + t;
    float rays = fbm(rayX) * 0.6;
    rays += fbm(rayX * 2.5 - t * 0.5) * 0.3;
    rays += fbm(rayX * 5.0 + t * 0.2) * 0.1;
    
    // 让射线有随时间变化的“闪烁”感
    float shimmer = sin(vUv.x * 50.0 + t * 2.0) * 0.05;
    rays += shimmer;
    
    // 极光的核心强度
    float strength = smoothstep(0.1, 0.9, rays);
    
    // 垂直分布：极光通常有一个清晰的底部边缘，向上逐渐变淡
    float bottomFade = smoothstep(0.0, 0.2, vUv.y);
    float topFade = smoothstep(1.0, 0.4, vUv.y);
    float verticalMask = bottomFade * topFade;
    
    // 全向柔和遮罩，解决边缘切割感
    // 使用 pow 函数创建非线性、向两侧完美消隐的遮罩
    // 调整最后的指数可以控制边缘的“柔软度”，值越小越柔和
    float omniMask = pow(4.0 * vUv.x * (1.0 - vUv.x), 0.8);
    
    float alpha = strength * verticalMask * omniMask;
    
    // 更加真实的颜色分层 (基于提供的图片分析)
    // 底部: 鲜绿色 -> 中间: 黄绿色 -> 顶部: 红色/紫色
    vec3 color;
    if (vUv.y < 0.5) {
        color = mix(uColor1, uColor2, vUv.y * 2.0);
    } else {
        color = mix(uColor2, uColor3, (vUv.y - 0.5) * 2.0);
    }
    
    // 增加射线的亮度贡献
    color += vec3(rays * 0.4);
    
    // 整体发光增强
    color *= (1.2 + rays * 0.5) * uIntensity;
    
    gl_FragColor = vec4(color, alpha * 0.9 * uOpacity);
  }
`;

// 移动端专用 Shader：减少 FBM 迭代次数，移除部分细节计算
const fragmentShaderMobile = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uIntensity;
  uniform float uOpacity;
  
  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  float noise(float x) {
      float i = floor(x);
      float f = fract(x);
      float u = f * f * (3.0 - 2.0 * f);
      return mix(random(vec2(i, 0.0)), random(vec2(i + 1.0, 0.0)), u);
  }
  
  // Mobile Optimization: Reduced iterations (4 -> 2)
  float fbm(float x) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 2; i++) {
          v += a * noise(x);
          x = x * 2.0;
          a *= 0.5;
      }
      return v;
  }
  
  void main() {
    float t = uTime * 0.3;
    
    float rayX = vUv.x * 25.0 + t;
    float rays = fbm(rayX) * 0.6;
    // Mobile Optimization: Simplified layering
    rays += fbm(rayX * 2.5 - t * 0.5) * 0.3;
    
    // Mobile Optimization: Removed shimmer calculation
    
    float strength = smoothstep(0.1, 0.9, rays);
    
    float bottomFade = smoothstep(0.0, 0.2, vUv.y);
    float topFade = smoothstep(1.0, 0.4, vUv.y);
    float verticalMask = bottomFade * topFade;
    
    float omniMask = pow(4.0 * vUv.x * (1.0 - vUv.x), 0.8);
    
    float alpha = strength * verticalMask * omniMask;
    
    vec3 color;
    // Mobile Optimization: Simplified color mixing (less conditional logic if possible, but branching is okay here)
    if (vUv.y < 0.5) {
        color = mix(uColor1, uColor2, vUv.y * 2.0);
    } else {
        color = mix(uColor2, uColor3, (vUv.y - 0.5) * 2.0);
    }
    
    color += vec3(rays * 0.4);
    color *= (1.2 + rays * 0.5) * uIntensity;
    
    gl_FragColor = vec4(color, alpha * 0.9 * uOpacity);
  }
`;

const SimulationAurora = ({ 
  position = [0, 0, 0], // 移动到世界中心
  isMobile = false,
  auroraIntensity = 1.0,
  auroraSpeed = 1.0,
  auroraOpacity = 1.0
}) => {
  const materialRef1 = useRef();
  const materialRef2 = useRef();
  
  const uniforms1 = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#22c55e') }, // 鲜绿色 (Green 500)
    uColor2: { value: new THREE.Color('#a3e635') }, // 黄绿色 (Lime 400)
    uColor3: { value: new THREE.Color('#e11d48') }, // 玫瑰红 (Rose 600)
    uIntensity: { value: auroraIntensity },
    uOpacity: { value: auroraOpacity }
  }), [auroraIntensity, auroraOpacity]);
  
  const uniforms2 = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#06b6d4') }, // 青色 (Cyan 500)
    uColor2: { value: new THREE.Color('#2dd4bf') }, // 蒂芙尼蓝 (Teal 400)
    uColor3: { value: new THREE.Color('#7c3aed') }, // 紫色 (Violet 600)
    uIntensity: { value: auroraIntensity * 0.8 }, // 第二层稍弱
    uOpacity: { value: auroraOpacity }
  }), [auroraIntensity, auroraOpacity]);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * auroraSpeed;
    if (materialRef1.current) {
      materialRef1.current.uniforms.uTime.value = time;
    }
    if (materialRef2.current) {
      materialRef2.current.uniforms.uTime.value = time;
    }
  });
  
  useEffect(() => {
    if (materialRef1.current) {
      materialRef1.current.uniforms.uOpacity.value = auroraOpacity;
    }
    if (materialRef2.current) {
      materialRef2.current.uniforms.uOpacity.value = auroraOpacity;
    }
  }, [auroraOpacity]);
  
  // Performance Optimization:
  // Desktop: 192/96 segments (reduced from 256/128, visual difference negligible)
  // Mobile: 64/32 segments (reduced from 128/64, significant performance boost)
  const innerCylinderArgs = isMobile 
    ? [180, 180, 100, 64, 32, true] 
    : [200, 200, 120, 192, 96, true];
    
  const outerCylinderArgs = isMobile
    ? [220, 220, 110, 64, 32, true]
    : [250, 250, 130, 192, 96, true];
    
  // Select shader based on platform
  const activeFragmentShader = isMobile ? fragmentShaderMobile : fragmentShader;

  return (
    <group position={position}>
      {/* 内层极光 */}
      <mesh rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={innerCylinderArgs} />
        <shaderMaterial
          ref={materialRef1}
          uniforms={uniforms1}
          vertexShader={vertexShader}
          fragmentShader={activeFragmentShader}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* 外层极光，半径更大，旋转错开，无缩放 */}
      <mesh rotation={[0, Math.PI + 0.8, 0]}>
        <cylinderGeometry args={outerCylinderArgs} />
        <shaderMaterial
          ref={materialRef2}
          uniforms={uniforms2}
          vertexShader={vertexShader}
          fragmentShader={activeFragmentShader}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default SimulationAurora;
