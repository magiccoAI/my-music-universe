import React, { useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const Rainbow3DShader = {
  vertexShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vViewPosition;
    
    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vViewPosition;
    uniform float uTime;
    uniform float uOpacity;

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
      // Geometric mapping for concentric bands (Horizontal stripes)
      // Radius of torus is 110, tube radius is 8.
      // Distance from center (0,0) of the torus ring determines the band.
      float d = length(vPosition.xy);
      
      // Map distance roughly from inner (102) to outer (118)
      float normalizedDist = (d - 102.0) / 16.0;
      normalizedDist = clamp(normalizedDist, 0.0, 1.0);
      
      // Rainbow colors: Red (outer) -> Violet (inner)
      // HSV: Red=0, Violet=0.75
      // normalizedDist 1.0 (Outer) -> Hue 0.0 (Red)
      // normalizedDist 0.0 (Inner) -> Hue 0.75 (Violet)
      float hue = 0.75 - normalizedDist * 0.75;
      
      // More vibrant colors
      vec3 baseColor = hsv2rgb(vec3(hue, 0.85, 1.0)); 
      
      // Lighting for 3D volume effect
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      vec3 lightDir = normalize(vec3(0.2, 1.0, 0.5));
      
      // Diffuse
      float diff = max(dot(normal, lightDir), 0.0);
      
      // Specular (glossy)
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
      
      // Fresnel (rim light)
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);
      
      // Combine for "Light/Ethereal" look
      // Add white/light to the base color
      vec3 finalColor = baseColor + vec3(0.2); 
      finalColor += vec3(1.0) * spec * 0.6; // Strong specular
      finalColor += baseColor * fresnel * 0.8; // Strong glowing edge
      
      // Add a subtle flow/shimmer effect
      float flow = sin(vUv.x * 12.0 - uTime * 1.5) * 0.5 + 0.5;
      finalColor += baseColor * flow * 0.2;

      // Transparency
      float alpha = uOpacity * 0.4; // Base is very transparent
      alpha += fresnel * 0.4; // Edges are more visible
      alpha = clamp(alpha, 0.0, 1.0);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

const MeadowGroundShader = {
  vertexShader: `
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
      vUv = uv;
      vec3 pos = position;
      vNormal = normal;
      
      // Terrain noise
      float elevation = noise(pos.xy * 0.03) * 6.0;
      elevation += noise(pos.xy * 0.01 + uTime * 0.1) * 2.0;
      elevation += noise(pos.xy * 0.08) * 3.0;
      
      // Create a depression for the lake
      // Lake is centered at (0,0) in mesh space (which is xz in world space)
      // Lake radius is roughly 45. We want a smooth transition.
      float dist = length(pos.xy);
      float lakeRadius = 42.0;
      float bankWidth = 15.0;
      
      // 0.0 inside lake, 1.0 outside bank
      float lakeMask = smoothstep(lakeRadius, lakeRadius + bankWidth, dist);
      
      // Flatten the area under the lake and blend to terrain
      // We push the lake bottom down
      float lakeBed = -2.0; 
      elevation = mix(lakeBed, elevation, lakeMask);

      pos.z += elevation;
      
      // Wind effect only affects areas outside the lake
      float windStrength = noise(pos.xy * 0.2 + uTime * 0.5) * 0.3 * lakeMask;
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
      
      float wind = noise(pos * 0.5 + vec2(uTime * 0.2, uTime * 0.1));
      float windDetail = noise(pos * 3.0 + vec2(uTime * 0.3, 0.0));
      
      vec3 soil = vec3(0.24, 0.19, 0.12);
      vec3 shadowGreen = vec3(0.2, 0.55, 0.3);
      vec3 midGreen = vec3(0.45, 0.85, 0.45);
      vec3 highlightGreen = vec3(0.7, 0.96, 0.6);
      
      float lightFactor = max(0.0, dot(vNormal, vec3(0.0, 1.0, 0.0))) + 0.3;
      
      float grassPattern = noise(pos * 8.0);
      vec3 grass = mix(shadowGreen, midGreen, grassPattern);
      grass = mix(grass, highlightGreen, wind * 0.4 + lightFactor * 0.3);
      
      float slope = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 1.0, 0.0)));
      grass = mix(grass, soil, slope * 0.5);
      
      // Beach/Sand transition around the lake
      float dist = length(vPos.xy);
      float lakeRadius = 42.0;
      float bankWidth = 8.0;
      float sandMask = 1.0 - smoothstep(lakeRadius, lakeRadius + bankWidth, dist);
      
      vec3 sandColor = vec3(0.76, 0.7, 0.5);
      grass = mix(grass, sandColor, sandMask * 0.8);

      float flowerDensity = noise(pos * 6.0 + vec2(50.0));
      float flowerMask = smoothstep(0.75, 0.85, flowerDensity);
      
      // Remove flowers from sand/lake area
      flowerMask *= (1.0 - sandMask);
      
      float flowerType = noise(pos * 2.0);
      vec3 flowerColor;
      
      if (flowerType < 0.33) {
        flowerColor = vec3(1.0, 0.98, 0.92);
        flowerColor += vec3(noise(pos * 20.0) * 0.1);
      } else if (flowerType < 0.66) {
        flowerColor = vec3(0.8, 0.7, 0.9);
        flowerColor = mix(flowerColor, vec3(0.9, 0.8, 1.0), windDetail);
      } else {
        flowerColor = vec3(1.0, 0.9, 0.4);
        flowerColor *= (0.9 + noise(pos * 15.0) * 0.2);
      }
      
      float flowerSize = smoothstep(0.8, 0.9, flowerDensity);
      vec3 finalColor = mix(grass, flowerColor, flowerMask * flowerSize);
      
      float alpha = 1.0;
      // Soft edge for the whole ground
      alpha = 1.0 - smoothstep(130.0, 150.0, dist);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

const MagicLakeShader = {
  vertexShader: `
    varying vec3 vPos;
    varying vec3 vNormal;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uRadius;

    float wave(vec2 p, float freq, float speed, float amp) {
      float t = uTime * speed;
      return sin(dot(p, vec2(freq, freq * 1.2)) + t) * amp;
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      vec2 p = pos.xy;
      float d = length(p);
      float base = wave(p, 0.08, 0.4, 0.4);
      base += wave(p + 10.0, 0.16, 0.7, 0.18);
      base += wave(p * 1.7, 0.24, 0.9, 0.12);
      float fade = smoothstep(uRadius, uRadius * 0.4, d);
      pos.z += base * fade;
      vPos = pos;
      vec3 displacedNormal = normalize(vec3(-base * 0.4, -base * 0.4, 1.0));
      vNormal = displacedNormal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vPos;
    varying vec3 vNormal;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uRadius;

    void main() {
      float d = length(vPos.xy);
      float depth = clamp(d / uRadius, 0.0, 1.0);
      vec3 shallowColor = vec3(0.75, 0.96, 0.93);
      vec3 midColor = vec3(0.15, 0.74, 0.84);
      vec3 deepColor = vec3(0.02, 0.32, 0.5);
      vec3 waterColor = mix(shallowColor, midColor, depth);
      waterColor = mix(waterColor, deepColor, depth * depth);
      float fresnel = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
      fresnel = clamp(fresnel * 1.2, 0.0, 1.0);
      vec3 highlight = vec3(0.9, 1.0, 1.0);
      waterColor = mix(waterColor, highlight, fresnel * 0.6);
      float caustic = sin(vPos.x * 0.15 + uTime * 0.8) * cos(vPos.y * 0.21 + uTime * 0.9);
      caustic = smoothstep(0.4, 0.9, caustic);
      waterColor += vec3(0.2, 0.4, 0.5) * caustic * (1.0 - depth);
      float edgeFade = 1.0 - smoothstep(uRadius * 0.98, uRadius, d);
      float alpha = 0.92 * edgeFade;
      gl_FragColor = vec4(waterColor, alpha);
    }
  `,
};

const WaterfallShader = {
  vertexShader: `
    varying vec2 vUv;
    uniform float uTime;

    void main() {
      vUv = uv;
      vec3 pos = position;
      float offset = sin((uv.x + uTime * 0.6) * 12.0) * 0.12;
      pos.x += offset;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uOpacity;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      float flow = fract(vUv.y - uTime * 0.9);
      float density = smoothstep(0.15, 0.0, abs(vUv.x - 0.5));
      float noise = hash(vec2(vUv.x * 18.0, flow * 32.0));
      float streaks = smoothstep(0.4, 0.9, noise + density);
      float alpha = streaks * uOpacity;
      vec3 baseColor = vec3(0.7, 0.92, 1.0);
      vec3 color = mix(baseColor * 0.7, baseColor * 1.3, streaks);
      gl_FragColor = vec4(color, alpha);
    }
  `,
};

const SwayingGrass = ({ count = 600, radius = 120 }) => {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(() => {
    const array = [];
    let i = 0;
    while (i < count) {
      const angle = Math.random() * Math.PI * 2;
      const r = 20 + Math.random() * (radius - 20);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      
      // Check distance from lake center (0, -8)
      const distToLake = Math.sqrt(x * x + (z + 8) * (z + 8));
      if (distToLake > 48) { // 45 is lake radius, added buffer
        const y = -13.5 + Math.random() * 0.4;
        const swaySpeed = 0.8 + Math.random() * 0.6;
        const swayOffset = Math.random() * Math.PI * 2;
        const height = 1.4 + Math.random() * 0.8;
        array.push({ x, y, z, swaySpeed, swayOffset, height });
        i++;
      }
    }
    return array;
  }, [count, radius]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    seeds.forEach((item, i) => {
      const sway = Math.sin(t * item.swaySpeed + item.swayOffset) * 0.25;
      dummy.position.set(item.x, item.y, item.z);
      dummy.rotation.z = sway;
      dummy.scale.set(0.2, item.height, 0.2);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <planeGeometry args={[0.25, 1]} />
      <meshStandardMaterial color="#7ed38c" side={THREE.DoubleSide} />
    </instancedMesh>
  );
};

const MeadowFlowers = ({ count = 80, radius = 80 }) => {
  const stemsRef = useRef();
  const headsRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Use white for all flowers as requested
  const whiteColor = useMemo(() => new THREE.Color('#ffffff'), []);

  const seeds = useMemo(() => {
    const result = [];
    let i = 0;
    while (i < count) {
      const angle = Math.random() * Math.PI * 2;
      const r = 10 + Math.random() * (radius - 20);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      
      // Check distance from lake center (0, -8)
      const distToLake = Math.sqrt(x * x + (z + 8) * (z + 8));
      
      if (distToLake > 48) { // 45 is lake radius, added buffer
        const y = -13.3;
        const h = 0.7 + Math.random() * 0.6;
        result.push({ x, y, z, h, color: whiteColor });
        i++;
      }
    }
    return result;
  }, [count, radius, whiteColor]);

  React.useEffect(() => {
    if (!stemsRef.current || !headsRef.current) return;
    seeds.forEach((item, i) => {
      dummy.position.set(item.x, item.y + item.h * 0.5, item.z);
      dummy.scale.set(0.08, item.h, 0.08);
      dummy.updateMatrix();
      stemsRef.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(item.x, item.y + item.h, item.z);
      dummy.scale.set(0.3, 0.3, 0.3);
      dummy.updateMatrix();
      headsRef.current.setMatrixAt(i, dummy.matrix);
      headsRef.current.setColorAt(i, item.color);
    });
    stemsRef.current.instanceMatrix.needsUpdate = true;
    headsRef.current.instanceMatrix.needsUpdate = true;
    if (headsRef.current.instanceColor) {
      headsRef.current.instanceColor.needsUpdate = true;
    }
  }, [seeds, dummy]);

  return (
    <group>
      <instancedMesh ref={stemsRef} args={[null, null, count]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
        <meshStandardMaterial color="#4ade80" />
      </instancedMesh>
      <instancedMesh ref={headsRef} args={[null, null, count]}>
        <circleGeometry args={[0.4, 8]} />
        <meshBasicMaterial color="#ffffff" /> 
      </instancedMesh>
    </group>
  );
};

const MagicLake = () => {
  const lakeRef = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRadius: { value: 45 },
    }),
    []
  );

  useFrame((state) => {
    if (lakeRef.current) {
      lakeRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -14.4, -8]}>
      <circleGeometry args={[45, 96]} />
      <shaderMaterial
        ref={lakeRef}
        vertexShader={MagicLakeShader.vertexShader}
        fragmentShader={MagicLakeShader.fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
};

const RockWithFalls = ({ position, amplitude, speed, size = [6, 3, 4], waterfallWidth = 3 }) => {
  const groupRef = useRef();
  const waterfallMatRef = useRef();
  const baseY = position[1];
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0.9 },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      const y = baseY + Math.sin(t * speed) * amplitude;
      groupRef.current.position.y = y;
      groupRef.current.rotation.y = t * 0.25;
    }
    if (waterfallMatRef.current) {
      waterfallMatRef.current.uniforms.uTime.value = t;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial
          color="#506b73"
          roughness={0.9}
          metalness={0.05}
          emissive="#22d3ee"
          emissiveIntensity={0.45}
        />
      </mesh>
      <mesh position={[0, -2.8, 0]} scale={[waterfallWidth, 6, 1]}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <shaderMaterial
          ref={waterfallMatRef}
          vertexShader={WaterfallShader.vertexShader}
          fragmentShader={WaterfallShader.fragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>
    </group>
  );
};

const EnergyLineShader = {
  vertexShader: `
    varying vec2 vUv;
    varying float vProgress;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vProgress = position.x; // Assuming geometry is aligned along X or UV mapping handles it
      vec3 pos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    
    void main() {
      float flow = fract(vUv.x * 2.0 - uTime * 0.5);
      float glow = smoothstep(0.4, 0.6, flow) * (1.0 - smoothstep(0.6, 0.8, flow));
      float core = 1.0 - abs(vUv.y - 0.5) * 2.0;
      core = smoothstep(0.5, 1.0, core);
      
      vec3 color = vec3(0.4, 0.8, 1.0);
      float alpha = (core * 0.5 + glow * 0.8) * 0.6;
      
      gl_FragColor = vec4(color, alpha);
    }
  `,
};

// --- Stylized Big Tree with Wind Animation & Fake Shadow ---

// Shader for InstancedMesh leaves with wind and color variation
const TreeWindShader = {
  vertexShader: `
    attribute vec3 instanceColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vColor;
    uniform float uTime;
    
    // Simple 3D noise function
    float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(fract(sin(dot(i + vec3(0, 0, 0), vec3(12.9898, 78.233, 37.719))) * 43758.5453),
                           fract(sin(dot(i + vec3(1, 0, 0), vec3(12.9898, 78.233, 37.719))) * 43758.5453), f.x),
                       mix(fract(sin(dot(i + vec3(0, 1, 0), vec3(12.9898, 78.233, 37.719))) * 43758.5453),
                           fract(sin(dot(i + vec3(1, 1, 0), vec3(12.9898, 78.233, 37.719))) * 43758.5453), f.x), f.y),
                   mix(mix(fract(sin(dot(i + vec3(0, 0, 1), vec3(12.9898, 78.233, 37.719))) * 43758.5453),
                           fract(sin(dot(i + vec3(1, 0, 1), vec3(12.9898, 78.233, 37.719))) * 43758.5453), f.x),
                       mix(fract(sin(dot(i + vec3(0, 1, 1), vec3(12.9898, 78.233, 37.719))) * 43758.5453),
                           fract(sin(dot(i + vec3(1, 1, 1), vec3(12.9898, 78.233, 37.719))) * 43758.5453), f.x), f.y), f.z);
    }

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vColor = instanceColor;
      
      vec3 pos = position;
      
      // Calculate wind based on world position (approximated)
      // We apply wind *before* instance matrix to simulate local leaf flutter
      // OR *after* instance matrix to simulate branch sway.
      // Let's do a simple flutter effect here.
      
      float windSpeed = 1.0;
      float windStrength = 0.1;
      
      // Use instance matrix translation part for phase
      vec3 instancePos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      
      float n = noise(vec3(instancePos.x * 0.5 + uTime * windSpeed, instancePos.z * 0.5, uTime * 0.2));
      
      pos.x += (n - 0.5) * windStrength;
      pos.y += (n - 0.5) * windStrength * 0.5;
      pos.z += (n - 0.5) * windStrength;
      
      vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vColor;
    
    uniform vec3 uLightDir;
    
    void main() {
      vec3 norm = normalize(vNormal);
      vec3 lightDir = normalize(uLightDir);
      
      float diff = max(dot(norm, lightDir), 0.0);
      // Soft lighting
      float lightIntensity = smoothstep(0.0, 1.0, diff) * 0.6 + 0.4;
      
      float fresnel = pow(1.0 - max(dot(norm, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
      
      // Use instance color
      vec3 finalColor = vColor * lightIntensity;
      finalColor += vec3(1.0) * fresnel * 0.15;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// Component for the Lush Tree with dense foliage
const LushTree = ({ position, scale = 1.0, isMobile = false }) => {
  const leavesRef = useRef();
  const shadowRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uLightDir: { value: new THREE.Vector3(0.5, 1.0, 0.5) }
  }), []);

  // Shadow Blob Shader (Fake Shadow)
  const shadowShader = useMemo(() => ({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        vec2 center = vec2(0.5);
        float dist = distance(vUv, center);
        float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
        gl_FragColor = vec4(0.0, 0.1, 0.0, alpha * 0.5); 
      }
    `
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (leavesRef.current && leavesRef.current.material && leavesRef.current.material.uniforms) {
      leavesRef.current.material.uniforms.uTime.value = t;
    }
    if (shadowRef.current) {
       shadowRef.current.scale.setScalar(1.0 + Math.sin(t * 0.5) * 0.05);
    }
  });

  // Procedural generation of trunk and branches
  const treeStructure = useMemo(() => {
    let seed = 42; // Fixed seed for deterministic shape
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const branches = [];
    const leafPositions = [];
    
    // Main Trunk
    branches.push({ 
      start: [0, 0, 0], 
      end: [0, 2.5, 0], 
      thickness: 1.0 
    });

    const addBranch = (start, length, angleY, angleX, depth) => {
      // Leaf generation: Add leaves along branches for the last 2 levels
      if (depth <= 2) {
         const clusters = Math.max(1, Math.ceil(length * 2.5));
         for(let i=0; i<clusters; i++) {
            const t = i / clusters;
            const pos = [
              start[0] + (Math.sin(angleY) * Math.cos(angleX) * length) * t,
              start[1] + (Math.sin(angleX) * length) * t,
              start[2] + (Math.cos(angleY) * Math.cos(angleX) * length) * t
            ];
            
            // Add a cloud of leaves around this point
            // Increase density significantly
            // Mobile optimization: Reduce leaf count
            const baseLeafCount = depth === 0 ? 12 : 6;
            const leafCount = isMobile ? Math.ceil(baseLeafCount * 0.5) : baseLeafCount; 

            for(let j=0; j<leafCount; j++) {
               leafPositions.push({
                 pos: [
                   pos[0] + (random()-0.5) * 1.8,
                   pos[1] + (random()-0.5) * 1.8,
                   pos[2] + (random()-0.5) * 1.8
                 ],
                 scale: 0.5 + random() * 0.6, // Smaller, more numerous leaves
                 color: random(),
                 rotation: [random()*Math.PI, random()*Math.PI, random()*Math.PI]
               });
            }
         }
      }

      if (depth === 0) return;

      const end = [
        start[0] + Math.sin(angleY) * Math.cos(angleX) * length,
        start[1] + Math.sin(angleX) * length,
        start[2] + Math.cos(angleY) * Math.cos(angleX) * length
      ];

      branches.push({ start, end, thickness: 1.0 * Math.pow(0.65, 5-depth) });

      // Split into sub-branches
      const subBranches = 2 + Math.floor(random() * 2.5); // 2 to 4 branches
      for (let i = 0; i < subBranches; i++) {
        addBranch(
          end, 
          length * 0.75, 
          angleY + (random() - 0.5) * 2.5, 
          angleX + (random() - 0.5) * 1.2, 
          depth - 1
        );
      }
    };

    // Initial Branching - Upward reaching like the photo
    addBranch([0, 2.5, 0], 3.0, 0, Math.PI/3.5, 4);
    addBranch([0, 2.5, 0], 3.0, Math.PI, Math.PI/3.5, 4);
    
    return { branches, leafPositions };
  }, [isMobile]);

  // Update InstancedMesh for leaves with colors
  useLayoutEffect(() => {
    if (!leavesRef.current) return;
    
    // Palette based on the realistic tree image (varied greens)
    const colors = [
      new THREE.Color('#4d7c0f'), // Dark moss green
      new THREE.Color('#15803d'), // Green
      new THREE.Color('#65a30d'), // Lime green
      new THREE.Color('#3f6212'), // Dark olive
      new THREE.Color('#84cc16'), // Bright lime
    ];

    treeStructure.leafPositions.forEach((leaf, i) => {
      dummy.position.set(leaf.pos[0], leaf.pos[1], leaf.pos[2]);
      // Use stored random rotation
      if (leaf.rotation) {
        dummy.rotation.set(leaf.rotation[0], leaf.rotation[1], leaf.rotation[2]);
      } else {
        // Fallback if not present (should be present now)
        dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
      }
      
      dummy.scale.setScalar(leaf.scale * 1.5); // Increase scale slightly
      dummy.updateMatrix();
      leavesRef.current.setMatrixAt(i, dummy.matrix);
      
      const colorIndex = Math.floor(leaf.color * colors.length);
      leavesRef.current.setColorAt(i, colors[colorIndex]);
    });
    
    leavesRef.current.instanceMatrix.needsUpdate = true;
    if (leavesRef.current.instanceColor) leavesRef.current.instanceColor.needsUpdate = true;
  }, [treeStructure, dummy]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Shadow */}
      <mesh 
        ref={shadowRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.1, 0]} 
      >
        <planeGeometry args={[16, 16]} />
        <shaderMaterial 
          transparent 
          depthWrite={false}
          vertexShader={shadowShader.vertexShader}
          fragmentShader={shadowShader.fragmentShader}
        />
      </mesh>

      {/* Trunk and Branches */}
      {treeStructure.branches.map((b, i) => {
         const len = new THREE.Vector3(...b.end).distanceTo(new THREE.Vector3(...b.start));
         const mid = new THREE.Vector3().addVectors(new THREE.Vector3(...b.start), new THREE.Vector3(...b.end)).multiplyScalar(0.5);
         const direction = new THREE.Vector3().subVectors(new THREE.Vector3(...b.end), new THREE.Vector3(...b.start)).normalize();
         const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
         
         return (
           <mesh key={i} position={mid} quaternion={quaternion}>
             <cylinderGeometry args={[b.thickness * 0.7, b.thickness, len, 8]} />
             <meshStandardMaterial color="#3e2723" roughness={1.0} />
           </mesh>
         );
      })}

      {/* Lush Leaves - Using MeshStandardMaterial for guaranteed visibility */}
      <instancedMesh 
        ref={leavesRef} 
        args={[null, null, treeStructure.leafPositions.length]}
        frustumCulled={false}
      >
         {/* Using Dodecahedron for a leafy cluster look */}
         <dodecahedronGeometry args={[0.4, 0]} />
         {/* Use white color so instance colors tint it correctly */}
         <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.1} />
      </instancedMesh>
    </group>
  );
};


const EnergyConnection = ({ start, end }) => {
  const lineRef = useRef();
  const curve = useMemo(() => {
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.y -= 2; // Sagging effect
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.05, 8, false]} />
      <shaderMaterial
        ref={lineRef}
        vertexShader={EnergyLineShader.vertexShader}
        fragmentShader={EnergyLineShader.fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const FloatingRocks = () => {
  const rockPos1 = useMemo(() => new THREE.Vector3(-12, -4, -18), []);
  const rockPos2 = useMemo(() => new THREE.Vector3(0, -2.5, -12), []);
  const rockPos3 = useMemo(() => new THREE.Vector3(11, -4.2, -16), []);

  return (
    <group>
      <RockWithFalls position={rockPos1} amplitude={0.9} speed={0.7} waterfallWidth={3.2} />
      <RockWithFalls position={rockPos2} amplitude={0.7} speed={0.9} waterfallWidth={2.6} />
      <RockWithFalls position={rockPos3} amplitude={1.0} speed={0.6} waterfallWidth={3.4} />
      
      <EnergyConnection start={rockPos1} end={rockPos2} />
      <EnergyConnection start={rockPos2} end={rockPos3} />
    </group>
  );
};

const Fish = ({ initialAngle, radius, speed, y, phase, color, scale }) => {
  const groupRef = useRef();
  const tailRef = useRef();
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Movement around the center
    const currentAngle = initialAngle + t * speed * 0.2;
    // Vary radius slightly
    const r = radius + Math.sin(t * 2 + phase) * 1.0;
    
    const x = Math.cos(currentAngle) * r;
    const z = Math.sin(currentAngle) * r - 8; // Center at lake
    
    groupRef.current.position.set(x, y, z);
    
    // Orientation: Face direction of movement (tangent)
    // Tangent angle is currentAngle + PI/2
    // We add some wiggle to the whole fish rotation
    const wiggle = Math.sin(t * 10 + phase) * 0.1;
    groupRef.current.rotation.y = -currentAngle + wiggle;

    // Tail animation (wagging)
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 15 + phase) * 0.8;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Streamlined Body Construction using two cones */}
      <group>
        {/* Front Body (Head) - Points Forward (+Z) */}
        <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.2, 0.5, 12]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
        </mesh>
        
        {/* Rear Body - Tapers Backward (-Z) */}
        <mesh position={[0, 0, -0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.2, 0.7, 12]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Tail - Attached to Rear Body */}
        <group position={[0, 0, -0.7]} ref={tailRef}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.15, 0.4, 12]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
          </mesh>
        </group>

        {/* Fins */}
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
           <coneGeometry args={[0.08, 0.3, 8]} />
           <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
           <coneGeometry args={[0.08, 0.3, 8]} />
           <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
};

const LowPolyCat = ({ position, rotation, scale = 1, color = "#333333" }) => {
  const group = useRef();
  const tailRef = useRef();

  useFrame((state) => {
    if (group.current) {
      // Breathing
      group.current.scale.y = scale * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.02);
    }
    if (tailRef.current) {
      // Tail sway
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={[scale, scale, scale]}>
       {/* Body */}
       <mesh position={[0, 0.25, 0]}>
         <boxGeometry args={[0.4, 0.4, 0.7]} />
         <meshStandardMaterial color={color} roughness={0.8} />
       </mesh>

       {/* Head */}
       <mesh position={[0, 0.55, 0.45]}>
         <boxGeometry args={[0.35, 0.35, 0.35]} />
         <meshStandardMaterial color={color} roughness={0.8} />
       </mesh>

       {/* Ears */}
       <mesh position={[0.1, 0.75, 0.45]} rotation={[0, 0, 0.2]}>
          <coneGeometry args={[0.08, 0.2, 4]} />
          <meshStandardMaterial color={color} roughness={0.8} />
       </mesh>
       <mesh position={[-0.1, 0.75, 0.45]} rotation={[0, 0, -0.2]}>
          <coneGeometry args={[0.08, 0.2, 4]} />
          <meshStandardMaterial color={color} roughness={0.8} />
       </mesh>

       {/* Legs */}
       <mesh position={[0.12, 0.1, 0.25]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2]} />
          <meshStandardMaterial color={color} />
       </mesh>
       <mesh position={[-0.12, 0.1, 0.25]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2]} />
          <meshStandardMaterial color={color} />
       </mesh>
       <mesh position={[0.12, 0.1, -0.25]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2]} />
          <meshStandardMaterial color={color} />
       </mesh>
       <mesh position={[-0.12, 0.1, -0.25]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2]} />
          <meshStandardMaterial color={color} />
       </mesh>

       {/* Tail */}
       <group ref={tailRef} position={[0, 0.35, -0.35]}>
         <mesh rotation={[0.5, 0, 0]} position={[0, 0.15, 0]}>
           <cylinderGeometry args={[0.04, 0.04, 0.4]} />
           <meshStandardMaterial color={color} />
         </mesh>
       </group>
    </group>
  );
};

const LowPolyRabbit = ({ position, rotation, scale = 1, color = "#ffffff" }) => {
  const group = useRef();
  
  // Hop animation
  useFrame((state) => {
    if (group.current) {
      // Hopping effect
      const t = state.clock.elapsedTime * 3 + position[0]; // Offset by position so they don't hop in sync
      const hopHeight = Math.abs(Math.sin(t)) * 0.5 * scale;
      group.current.position.y = position[1] + hopHeight;
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.7, 0.3]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.1, 1.05, 0.25]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.06, 0.5, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 1.05, 0.25]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.06, 0.5, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.3, -0.35]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      
      {/* Feet */}
      <mesh position={[-0.2, 0.1, 0.2]}>
        <boxGeometry args={[0.15, 0.1, 0.25]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.2, 0.1, 0.2]}>
         <boxGeometry args={[0.15, 0.1, 0.25]} />
         <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.2, 0.1, -0.2]}>
         <boxGeometry args={[0.15, 0.1, 0.25]} />
         <meshStandardMaterial color={color} />
      </mesh>
       <mesh position={[0.2, 0.1, -0.2]}>
         <boxGeometry args={[0.15, 0.1, 0.25]} />
         <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

const MeadowAnimals = () => {
  // Static positions for simplicity, could be randomized
  return (
    <group>
       {/* Cats */}
       <LowPolyCat position={[48, -14.8, 20]} rotation={[0, -Math.PI / 4, 0]} scale={1.5} color="#333333" />
       <LowPolyCat position={[52, -14.8, 18]} rotation={[0, -Math.PI / 3, 0]} scale={1.2} color="#FFFFFF" />

       {/* Rabbits */}
       <LowPolyRabbit position={[-50, -14.8, 30]} rotation={[0, Math.PI / 2, 0]} scale={1.0} />
       <LowPolyRabbit position={[-48, -14.8, 32]} rotation={[0, Math.PI / 4, 0]} scale={0.8} />
       <LowPolyRabbit position={[-52, -14.8, 28]} rotation={[0, Math.PI, 0]} scale={0.9} />
       
       <LowPolyRabbit position={[20, -14.8, 60]} rotation={[0, 0, 0]} scale={1.1} />
       <LowPolyRabbit position={[25, -14.8, 55]} rotation={[0, -Math.PI / 2, 0]} scale={0.9} />
    </group>
  );
};

const UnderwaterLife = ({ count = 8, radius = 25 }) => {
  const fishColors = useMemo(() => [
    '#ff7f50', // Coral
    '#ffd700', // Gold
    '#ff4500', // OrangeRed
    '#00ced1', // DarkTurquoise
    '#ffffff', // White
  ], []);

  const fishes = useMemo(() => {
    return new Array(count).fill().map((_, i) => ({
      initialAngle: (Math.PI * 2 * i) / count, // Distribute evenly
      radius: 10 + Math.random() * 15,
      speed: 0.5 + Math.random() * 0.4,
      y: -14.6 + Math.random() * 0.5, 
      phase: Math.random() * Math.PI * 2,
      color: fishColors[i % fishColors.length],
      scale: 0.6 + Math.random() * 0.4
    }));
  }, [count, fishColors]);

  return (
    <group>
      {fishes.map((fish, i) => (
        <Fish key={i} {...fish} />
      ))}
    </group>
  );
};

const LilyPad = ({ position, rotation, scale }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[scale, scale, scale]}>
      {/* Single Leaf Mesh - Vibrant Green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.5, 32, 0, Math.PI * 1.85]} />
        <meshStandardMaterial 
          color="#4ade80" 
          roughness={0.6} 
          metalness={0.1} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Stem/Center Connection */}
      <mesh position={[0, 0.02, 0]}>
         <cylinderGeometry args={[0.05, 0.05, 0.05, 8]} />
         <meshStandardMaterial color="#fcd34d" />
      </mesh>
    </group>
  );
};

const LotusFlower = ({ position, scale = 1, color = "#f472b6" }) => {
  const petals = useMemo(() => {
    const p = [];
    
    // Outer Layer (Wide, open)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      p.push({
        rotY: angle,
        rotX: Math.PI / 6, // 30 degrees tilt
        scale: [0.5, 1.2, 0.1], // Width, Length, Thickness
        pos: [0, 0, 0], // Pivot at center
        color: color,
        offset: 0.6 // Distance from center for the mesh itself
      });
    }

    // Middle Layer (More upright)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 8;
      p.push({
        rotY: angle,
        rotX: Math.PI / 3, // 60 degrees tilt
        scale: [0.4, 1.0, 0.1],
        pos: [0, 0.1, 0],
        color: '#ff9ecd', // Lighter
        offset: 0.5
      });
    }

    // Inner Layer (Cup)
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      p.push({
        rotY: angle,
        rotX: Math.PI / 2.2, // Almost vertical
        scale: [0.3, 0.8, 0.1],
        pos: [0, 0.2, 0],
        color: '#ffb7e0', // Very light
        offset: 0.4
      });
    }

    return p;
  }, [color]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Petals */}
      {petals.map((petal, i) => (
        <group key={i} rotation={[0, petal.rotY, 0]} position={petal.pos}>
          {/* Petal Pivot Group: Rotates X to tilt up */}
          <group rotation={[petal.rotX, 0, 0]}>
            {/* Actual Petal Mesh: Offset along Y (local up) so pivot is at base */}
            <mesh position={[0, petal.offset, 0]} scale={petal.scale}>
               <sphereGeometry args={[1, 16, 16]} />
               <meshStandardMaterial 
                 color={petal.color} 
                 roughness={0.4} 
                 metalness={0.1}
                 emissive={petal.color}
                 emissiveIntensity={0.2}
               />
            </mesh>
          </group>
        </group>
      ))}
      
      {/* Center Pod */}
      <group position={[0, 0.4, 0]}>
        {/* Seed pod */}
        <mesh>
          <cylinderGeometry args={[0.2, 0.1, 0.2, 12]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.8} />
        </mesh>
        {/* Stamens - simple ring of points */}
        <mesh position={[0, 0.1, 0]}>
           <torusGeometry args={[0.15, 0.02, 8, 16]} />
           <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
};

const PondVegetation = ({ count = 12, radius = 40 }) => {
  const items = useMemo(() => {
    const vegetation = [];
    for (let i = 0; i < count; i++) {
      // Random position within radius, but avoid very center
      const r = 5 + Math.sqrt(Math.random()) * (radius - 5);
      const theta = Math.random() * Math.PI * 2;
      const x = Math.sin(theta) * r;
      const z = Math.cos(theta) * r - 8; // Offset to match lake center z=-8
      
      // 20% chance of having a flower, max 3 flowers total
      const hasFlower = i < 3; // Force first 3 to have flowers for visibility
      
      vegetation.push({
        position: [x, -14.35, z], // Slightly above water surface (-14.4)
        rotation: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 0.6,
        hasFlower,
        flowerColor: Math.random() > 0.5 ? '#f472b6' : '#ffffff' // Pink or White
      });
    }
    return vegetation;
  }, [count, radius]);

  return (
    <group>
      {items.map((item, i) => (
        <group key={i}>
          <LilyPad position={item.position} rotation={item.rotation} scale={item.scale} />
          {item.hasFlower && (
            <LotusFlower 
              position={[item.position[0], item.position[1] + 0.1, item.position[2]]} 
              scale={item.scale * 0.6}
              color={item.flowerColor}
            />
          )}
        </group>
      ))}
    </group>
  );
};

const SunRain = ({ count = 1000, active = true }) => {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const drops = useMemo(() => {
    return new Array(count).fill().map(() => ({
      x: (Math.random() - 0.5) * 250,
      z: (Math.random() - 0.5) * 150 - 20, 
      y: Math.random() * 60 + 10,
      speed: 0.6 + Math.random() * 0.8,
      len: 1.0 + Math.random() * 1.5
    }));
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    let visibleCount = 0;
    drops.forEach((drop, i) => {
      drop.y -= drop.speed;
      if (drop.y < -15) {
        if (active) {
          drop.y = 40 + Math.random() * 20;
        }
      }
      
      // Only update matrix if drop is somewhat within view or just let it fall
      // To save performance, we could stop updating very low drops, but for simplicity:
      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.scale.set(1, drop.len, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <boxGeometry args={[0.04, 1, 0.04]} />
      <meshBasicMaterial color="#fffacd" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
};

const RainbowMeadow = ({ isRaining = true, isMobile = false }) => {
  const { scene } = useThree();
  const meadowRef = useRef();
  const rainbowRef = useRef();
  const rainbowMaterialRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meadowRef.current) {
      meadowRef.current.uniforms.uTime.value = t;
    }
    if (rainbowMaterialRef.current) {
      rainbowMaterialRef.current.uniforms.uTime.value = t;
    }
    if (rainbowRef.current) {
      // Gentle floating motion for the rainbow
      rainbowRef.current.position.y = 8 + Math.sin(t * 0.2) * 0.5;
    }
  });

  const rainbowUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 1.0 },
    }),
    []
  );

  // Mobile optimization constants
  const grassCount = isMobile ? 200 : 800;
  const flowerCount = isMobile ? 40 : 120;
  const pondVegCount = isMobile ? 5 : 15;
  const rainCount = isMobile ? 300 : 1000;
  const sparkleCount = isMobile ? 60 : 220;
  const underwaterCount = isMobile ? 3 : 8;
  const groundSegments = isMobile ? 32 : 64;
  const rainbowRadialSegments = isMobile ? 16 : 32;
  const rainbowTubularSegments = isMobile ? 64 : 128;

  return (
    <group>
      {/* 1. 环境光效 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.0} castShadow />

      {/* 2. 地面与草地 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]}>
        <circleGeometry args={[200, groundSegments]} />
        <shaderMaterial
          ref={meadowRef}
          vertexShader={MeadowGroundShader.vertexShader}
          fragmentShader={MeadowGroundShader.fragmentShader}
          uniforms={{ uTime: { value: 0 }, uRadius: { value: 45.0 } }}
          transparent
        />
      </mesh>

      <group position={[0, 0.5, 0]}>
         <SwayingGrass count={grassCount} />
         <MeadowFlowers count={flowerCount} />
      </group>

      <group>
        <MagicLake isMobile={isMobile} />
        <UnderwaterLife count={underwaterCount} />
        <PondVegetation count={pondVegCount} radius={40} />
      </group>

      <MeadowAnimals />
      
      <LushTree position={[-50, -13.5, -10]} scale={3.0} isMobile={isMobile} />

      <FloatingRocks />
      
      <SunRain count={rainCount} active={isRaining} />

      <mesh ref={rainbowRef} position={[0, -15, -50]} rotation={[0, 0, 0]}>
        <torusGeometry args={[110, 8, rainbowRadialSegments, rainbowTubularSegments, Math.PI]} /> 
        <shaderMaterial
          ref={rainbowMaterialRef}
          vertexShader={Rainbow3DShader.vertexShader}
          fragmentShader={Rainbow3DShader.fragmentShader}
          uniforms={rainbowUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      <Sparkles
        count={sparkleCount}
        scale={[60, 20, 60]}
        size={4}
        speed={0.35}
        opacity={0.45}
        color="#ffffff"
        position={[0, -5, 0]}
      />
    </group>
  );
};

export default RainbowMeadow;
