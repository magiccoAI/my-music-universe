import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useTexture } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Snowfall from './Snowfall';

const SnowGroundShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vNormal;
    uniform float uTime;
    
    // Simple noise function
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
      
      // Detailed terrain noise
      float elevation = 0.0;
      elevation += noise(pos.xy * 0.05) * 4.0;
      elevation += noise(pos.xy * 0.1) * 2.0;
      elevation += noise(pos.xy * 0.5) * 0.5;
      
      // Make center area slightly flatter for the album display
      float dist = length(pos.xy);
      float flatMask = smoothstep(15.0, 30.0, dist);
      pos.z += elevation * flatMask; // Apply elevation mostly outside center
      
      vPos = pos;
      
      // Approximate normal for lighting
      float d = 0.1;
      float e1 = noise((pos.xy + vec2(d,0)) * 0.05) * 4.0 + noise((pos.xy + vec2(d,0)) * 0.1) * 2.0;
      float e2 = noise((pos.xy + vec2(0,d)) * 0.05) * 4.0 + noise((pos.xy + vec2(0,d)) * 0.1) * 2.0;
      vec3 p1 = vec3(pos.x + d, pos.y, e1 * flatMask);
      vec3 p2 = vec3(pos.x, pos.y + d, e2 * flatMask);
      vec3 norm = normalize(cross(p2 - pos, p1 - pos));
      vNormal = norm;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vNormal;
    uniform sampler2D uTexture;
    
    void main() {
      // Basic snow color
      vec3 snowColor = vec3(0.96, 0.98, 1.0); // Clean white
      vec3 shadowColor = vec3(0.85, 0.90, 0.95); // Bluish shadow
      
      // Light direction (Top-Rightish)
      vec3 lightDir = normalize(vec3(0.5, 0.8, 0.3));
      float diff = max(dot(vNormal, lightDir), 0.0);
      
      // Texture detail
      vec4 texColor = texture2D(uTexture, vUv * 10.0);
      
      // Mix shadow and light based on normal
      vec3 finalColor = mix(shadowColor, snowColor, diff);
      
      // Add texture detail subtly
      finalColor *= (0.9 + texColor.r * 0.2);
      
      // Distance fog (simple linear)
      float dist = length(vPos.xy);
      float fogFactor = smoothstep(40.0, 90.0, dist);
      vec3 fogColor = vec3(0.85, 0.92, 0.99); // Sky color match
      
      finalColor = mix(finalColor, fogColor, fogFactor);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const MountainRange = () => {
  // Create a few large rugged mountains in the background
  const mountains = useMemo(() => {
    return [
      { pos: [-30, 0, -60], scale: [50, 45, 40], rot: [0, 0.5, 0] },
      { pos: [0, 0, -80], scale: [70, 60, 50], rot: [0, 0, 0] }, // Main peak
      { pos: [35, 0, -55], scale: [45, 40, 35], rot: [0, -0.4, 0] },
      { pos: [-55, 0, -40], scale: [40, 30, 40], rot: [0, 0.8, 0] },
      { pos: [55, 0, -45], scale: [35, 35, 35], rot: [0, -0.6, 0] },
    ];
  }, []);

  return (
    <group>
      {mountains.map((m, i) => (
        <mesh key={i} position={m.pos} rotation={m.rot} scale={m.scale}>
          {/* Use cone with low radial segments for low-poly look, or high for smooth */}
          <coneGeometry args={[1, 1, 4, 1]} /> 
          <meshStandardMaterial 
            color="#f1f5f9" 
            roughness={0.9}
            metalness={0.1}
            flatShading={true}
          />
        </mesh>
      ))}
      {/* Add a secondary layer of smaller peaks for detail */}
       {mountains.map((m, i) => (
        <mesh key={`sub-${i}`} position={[m.pos[0] * 0.8 + 10, -5, m.pos[2] + 10]} rotation={[0, m.rot[1] + 1, 0]} scale={[m.scale[0]*0.5, m.scale[1]*0.4, m.scale[2]*0.5]}>
          <coneGeometry args={[1, 1, 4, 1]} />
          <meshStandardMaterial 
            color="#e2e8f0" 
            roughness={1}
            flatShading={true}
          />
        </mesh>
      ))}
    </group>
  );
};

const ChristmasTree = ({ scale = 1 }) => (
  <group scale={scale}>
    <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
      <meshStandardMaterial color="#4a3728" roughness={0.9} />
    </mesh>
    {/* Layers of leaves */}
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
      <coneGeometry args={[1.4, 1.8, 8]} />
      <meshStandardMaterial color="#1e4620" roughness={0.8} flatShading />
    </mesh>
    <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
      <coneGeometry args={[1.1, 1.5, 8]} />
      <meshStandardMaterial color="#2d5a30" roughness={0.8} flatShading />
    </mesh>
    <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
      <coneGeometry args={[0.7, 1.2, 8]} />
      <meshStandardMaterial color="#3d7040" roughness={0.8} flatShading />
    </mesh>
    {/* Snow on top */}
    <mesh position={[0, 1.75, 0.05]} rotation={[-0.1,0,0]}>
       <coneGeometry args={[0.72, 0.4, 8]} />
       <meshStandardMaterial color="#fff" roughness={1} />
    </mesh>
     <mesh position={[0, 1.15, 0.08]} rotation={[-0.1,0,0]}>
       <coneGeometry args={[1.12, 0.4, 8]} />
       <meshStandardMaterial color="#fff" roughness={1} />
    </mesh>
  </group>
);

const ScatteredTrees = React.memo(() => {
  const trees = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r = 20 + Math.random() * 30;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r - 10;
      return {
        key: i,
        position: [x, 0, z],
        scale: 1.5 + Math.random()
      };
    });
  }, []);

  return (
    <>
      {trees.map(tree => (
        <group key={tree.key} position={tree.position}>
          <ChristmasTree scale={tree.scale} />
        </group>
      ))}
    </>
  );
});

const Backdrop = ({ texture, materialRef }) => {
  const { camera, size } = useThree();
  const [geometryArgs, setGeometryArgs] = useState([1, 1]);

  useEffect(() => {
    if (!texture?.image?.width || !texture?.image?.height) return;

    const imageAspect = texture.image.width / texture.image.height;
    const viewAspect = size.width / size.height;
    const distance = 220;
    const fovRad = THREE.MathUtils.degToRad(camera.fov);
    const visibleHeight = 2 * Math.tan(fovRad / 2) * distance;
    const visibleWidth = visibleHeight * viewAspect;

    let width;
    let height;
    if (imageAspect > viewAspect) {
      width = visibleWidth;
      height = visibleWidth / imageAspect;
    } else {
      width = visibleHeight * imageAspect;
      height = visibleHeight;
    }

    setGeometryArgs([width * 1.05, height * 1.05]);
  }, [camera.fov, size.height, size.width, texture]);

  return (
    <mesh position={[0, 40, -220]} rotation={[0, 0, 0]} renderOrder={-1000}>
      <planeGeometry args={geometryArgs} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        side={THREE.DoubleSide}
        fog={false}
        transparent
        opacity={1}
        depthWrite={false}
      />
    </mesh>
  );
};

const SnowMountain = ({
  bgImage = '/images/snow-bg.jpg',
  environment,
}) => {
  const { camera } = useThree();
  const snowPath = (process.env.PUBLIC_URL || '') + '/images/snow texture.jpg';
  const snowTex = useTexture(snowPath); 
  const [bgTexture, setBgTexture] = useState(null);
  const [prevBgTexture, setPrevBgTexture] = useState(null);
  const fadeT = useRef(1);
  const bgMatRef = useRef(null);
  const prevBgMatRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const url = (process.env.PUBLIC_URL || '') + bgImage;

    loader.load(
      url,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;

        fadeT.current = 0;
        setBgTexture((current) => {
          if (current) setPrevBgTexture(current);
          return tex;
        });
      },
      undefined,
      () => {}
    );

    return () => {
      cancelled = true;
    };
  }, [bgImage]);

  useFrame((_, delta) => {
    if (!bgTexture) return;

    if (!prevBgTexture) {
      if (bgMatRef.current) bgMatRef.current.opacity = 1;
      return;
    }

    const next = Math.min(1, fadeT.current + delta / 0.6);
    fadeT.current = next;

    if (bgMatRef.current) bgMatRef.current.opacity = next;
    if (prevBgMatRef.current) prevBgMatRef.current.opacity = 1 - next;

    if (next >= 1) {
      const old = prevBgTexture;
      setPrevBgTexture(null);
      if (prevBgMatRef.current) prevBgMatRef.current.opacity = 0;
      if (old) old.dispose();
    }
  });

  if (snowTex) {
    snowTex.wrapS = THREE.RepeatWrapping;
    snowTex.wrapT = THREE.RepeatWrapping;
  }

  useEffect(() => {
    camera.position.set(0, 3, 12);
    camera.lookAt(0, 2, 0);
  }, [camera]);

  const ambient = environment?.ambient ?? { intensity: 0.6, color: '#e0f2fe' };
  const sun = environment?.sun ?? { intensity: 1.2, color: '#ffffff', position: [20, 30, 10] };

  return (
    <group>
      {prevBgTexture && (
        <Backdrop
          texture={prevBgTexture}
          materialRef={prevBgMatRef}
        />
      )}
      {bgTexture && (
        <Backdrop
          texture={bgTexture}
          materialRef={bgMatRef}
        />
      )}

      <ambientLight intensity={ambient.intensity} color={ambient.color} />
      <directionalLight 
        position={sun.position} 
        intensity={sun.intensity} 
        castShadow 
        color={sun.color} 
        shadow-mapSize={[2048, 2048]}
      />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[200, 200, 128, 128]} />
        <shaderMaterial 
          vertexShader={SnowGroundShader.vertexShader}
          fragmentShader={SnowGroundShader.fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uTexture: { value: snowTex }
          }}
        />
      </mesh>

      <group position={[0, 0, -10]}>
        <MountainRange />
      </group>

      <group position={[0, -1.8, 0]}>
        <group position={[-8, 0, 5]}> <ChristmasTree scale={1.8} /> </group>
        <group position={[10, -0.2, 2]}> <ChristmasTree scale={1.5} /> </group>
        <group position={[-12, 0.5, -5]}> <ChristmasTree scale={2.2} /> </group>
        <group position={[14, 0, -8]}> <ChristmasTree scale={2.0} /> </group>
        <group position={[-4, 0, -12]}> <ChristmasTree scale={1.2} /> </group>
        <group position={[6, 0.2, -15]}> <ChristmasTree scale={1.6} /> </group>
        
        <ScatteredTrees />
      </group>

      <Snowfall count={2000} />
    </group>
  );
};

export default SnowMountain;
