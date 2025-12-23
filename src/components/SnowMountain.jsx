import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useTexture, useGLTF } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Snowfall from './Snowfall';

const SnowGroundShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vNormal;
    varying vec3 vViewDir; // Pass view direction to fragment shader
    varying float vElevation; // Pass elevation for alpenglow effect
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
      
      // Calculate background intensity based on Y (which is Z-depth in world space)
      // pos.y increases as we go further back into the screen
      float backFactor = smoothstep(-20.0, 80.0, pos.y);
      
      // Detailed terrain noise with increased amplitude in the background
      float elevation = 0.0;
      
      // Large low-frequency hills in the back
      elevation += noise(pos.xy * 0.02) * 12.0 * backFactor;
      
      // Medium details
      elevation += noise(pos.xy * 0.05) * 4.0 * (1.0 + backFactor * 2.0);
      
      // Small details
      elevation += noise(pos.xy * 0.1) * 2.0;
      elevation += noise(pos.xy * 0.5) * 0.5;
      
      // Make center area slightly flatter for the album display
      float dist = length(pos.xy);
      float flatMask = smoothstep(15.0, 40.0, dist); // Widen the flat area slightly transition
      pos.z += elevation * flatMask; 
      
      // Add a general upward slope at the very back to blend into background
      pos.z += smoothstep(50.0, 120.0, pos.y) * 25.0;
      
      // Store elevation for fragment shader
      vElevation = pos.z;

      vPos = (modelMatrix * vec4(pos, 1.0)).xyz; // Pass World Position
      
      // Calculate Normal in Object Space via Finite Difference
      float d = 0.5;
      // Helper to get elevation at a point
      #define GET_ELEV(p) ( \
          noise(p * 0.02) * 12.0 * smoothstep(-20.0, 80.0, p.y) + \
          noise(p * 0.05) * 4.0 * (1.0 + smoothstep(-20.0, 80.0, p.y) * 2.0) + \
          noise(p * 0.1) * 2.0 \
      ) * smoothstep(15.0, 40.0, length(p)) + smoothstep(50.0, 120.0, p.y) * 25.0

      float e1 = GET_ELEV((pos.xy + vec2(d,0)));
      float e2 = GET_ELEV((pos.xy + vec2(0,d)));
      float e0 = pos.z; // Current elevation
      
      vec3 p1 = vec3(pos.x + d, pos.y, e1);
      vec3 p2 = vec3(pos.x, pos.y + d, e2);
      vec3 p0 = vec3(pos.x, pos.y, e0);
      
      vec3 objectNormal = normalize(cross(p2 - p0, p1 - p0));
      
      // Transform Normal to World Space (using modelMatrix rotation)
      // Since scaling is uniform, mat3(modelMatrix) works for direction
      vNormal = normalize(mat3(modelMatrix) * objectNormal);
      
      // Calculate View Direction in World Space
      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vViewDir = normalize(cameraPosition - worldPosition.xyz);

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPos;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying float vElevation;
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform vec3 uSunColor;
    uniform vec3 uShadowColor;
    uniform vec3 uFogColor;
    uniform vec3 uSunPosition;
    uniform float uSunIntensity;
    uniform float uAmbientIntensity;
    
    // Simplex Noise for sparkles (simplified)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i); // Avoid truncation effects in permutation
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Re-normalize interpolants
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewDir);

      vec3 lightDir = normalize(uSunPosition - vPos);
      
      // 1. Diffuse Lighting (High Contrast)
      float NdotL = max(dot(normal, lightDir), 0.0);
      float wrap = 0.35;
      float NdotLWrap = (NdotL + wrap) / (1.0 + wrap);
      
      // Sharpen the shadow transition for dramatic effect (Chiaroscuro)
      float directLight = smoothstep(0.05, 0.85, NdotLWrap); 
      
      // 2. Rim Light / Fresnel (Golden Edge)
      float rim = 1.0 - max(dot(viewDir, normal), 0.0);
      rim = pow(rim, 3.0); 
      float rimIntensity = rim * max(dot(viewDir, lightDir), 0.0); 
      
      // 3. Sparkles (Micro-facets)
      float sparkleNoise = snoise(vUv * 200.0 + viewDir.xy * 10.0 + vec2(uTime * 0.6, -uTime * 0.4));
      float sparkle = smoothstep(0.8, 1.0, sparkleNoise) * directLight; 
      
      // Colors
      float ambientK = clamp(uAmbientIntensity, 0.0, 2.0);
      vec3 snowBase = mix(vec3(1.0), uShadowColor, 0.55) * (0.25 + 0.75 * ambientK);
      
      // Alpenglow Logic (日照金山)
      // Mask logic: High elevation + Far distance + Facing sun
      // vElevation is local Z height (0 to ~30)
      // vPos.z is World Z depth (Camera at +12, background at -Z)
      
      // Strict height mask for "Golden Line" effect (only the peaks)
      float heightMask = smoothstep(18.0, 30.0, vElevation); 
      
      // Fix smoothstep order: edge0 must be < edge1
      // We want 1.0 at far back (Z < -50) and 0.0 at near (Z > 0)
      // vPos.z ranges from +100 to -100.
      float distMask = 1.0 - smoothstep(-90.0, -20.0, vPos.z); 
      
      float slopeMask = smoothstep(0.7, 1.0, normal.y);     // Optional: Slope check, but normal.y is Up. Vertical faces are lower.
      
      float alpenglow = heightMask * distMask;
      alpenglow = pow(alpenglow, 3.0); // Sharpen curve to confine to top edge
      
      // Base Diffuse is White (Neutral)
      // Cap base intensity to prevent blinding white snow in center
      float baseIntensity = min(uSunIntensity, 1.1);
      vec3 baseDiffuse = vec3(1.0) * baseIntensity;
      
      // Warm Glow Diffuse (Gold)
      // Reduced multiplier to avoid overexposure
      vec3 warmDiffuse = uSunColor * (uSunIntensity * 1.1);
      
      // Mix them based on Alpenglow mask
      vec3 effectiveSunColor = mix(baseDiffuse, warmDiffuse, alpenglow);
      
      // Mix Base
      vec3 finalColor = snowBase + effectiveSunColor * directLight;
      
      // Add texture detail (Snow grain)
      vec4 texColor = texture2D(uTexture, vUv * 15.0);
      finalColor *= (0.8 + texColor.r * 0.4);
      
      // Add Sparkles (White/Gold)
      finalColor += sparkle * vec3(1.0, 0.9, 0.8) * 0.5;
      
      // Add Rim (Gold glowing edge) - Keep this warm for beauty
      finalColor += rimIntensity * uSunColor * 0.35 * uSunIntensity;

      // Distance fog
      float dist = length(vPos.xy);
      float fogFactor = smoothstep(40.0, 90.0, dist);
      finalColor = mix(finalColor, uFogColor, fogFactor);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const MountainRange = () => {
  // Create a few large rugged mountains in the background
  const mountains = useMemo(() => {
    return [
      { pos: [-30, -5, -60], scale: [25, 20, 20], rot: [0, 0.5, 0] },
      { pos: [0, -5, -80], scale: [35, 30, 25], rot: [0, 0, 0] }, // Main peak
      { pos: [35, -5, -55], scale: [20, 18, 15], rot: [0, -0.4, 0] },
      { pos: [-55, -5, -40], scale: [20, 15, 20], rot: [0, 0.8, 0] },
      { pos: [55, -5, -45], scale: [18, 18, 18], rot: [0, -0.6, 0] },
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

const ChristmasTree = ({ scale = 1, isMobile = false }) => {
  const segments = isMobile ? 4 : 8;
  return (
  <group scale={scale}>
    <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.12, 0.12, 1.2, segments]} />
      <meshStandardMaterial color="#4a3728" roughness={0.9} />
    </mesh>
    {/* Layers of leaves */}
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
      <coneGeometry args={[1.4, 1.8, segments]} />
      <meshStandardMaterial color="#1e4620" roughness={0.8} flatShading />
    </mesh>
    <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
      <coneGeometry args={[1.1, 1.5, segments]} />
      <meshStandardMaterial color="#2d5a30" roughness={0.8} flatShading />
    </mesh>
    <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
      <coneGeometry args={[0.7, 1.2, segments]} />
      <meshStandardMaterial color="#3d7040" roughness={0.8} flatShading />
    </mesh>
    {/* Snow on top */}
    <mesh position={[0, 1.75, 0.05]} rotation={[-0.1,0,0]}>
       <coneGeometry args={[0.72, 0.4, segments]} />
       <meshStandardMaterial color="#fff" roughness={1} />
    </mesh>
     <mesh position={[0, 1.15, 0.08]} rotation={[-0.1,0,0]}>
       <coneGeometry args={[1.12, 0.4, segments]} />
       <meshStandardMaterial color="#fff" roughness={1} />
    </mesh>
  </group>
);
};

const ScatteredTrees = React.memo(({ count = 15, isMobile = false }) => {
  const trees = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
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
  }, [count]);

  return (
    <>
      {trees.map(tree => (
        <group key={tree.key} position={tree.position}>
          <ChristmasTree scale={tree.scale} isMobile={isMobile} />
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

// Helper component to load custom GLTF/GLB models
// const SnowMountainModel = ({ path, ...props }) => {
//   const { scene } = useGLTF(path);
//   
//   useEffect(() => {
//     console.log('GLTF Loaded:', path);
//     scene.traverse((child) => {
//       if (child.isMesh) {
//         // Force a visible material to debug
//         child.material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
//         console.log('Mesh found:', child.name, 'Pos:', child.position, 'Scale:', child.scale);
//       }
//     });
//     
//     // Log the total bounding box
//     const box = new THREE.Box3().setFromObject(scene);
//     console.log('Total Bounds:', box.min, box.max, 'Size:', box.getSize(new THREE.Vector3()));
//   }, [scene, path]);
//
//   return <primitive object={scene} {...props} />;
// };

// Cute Two-Ball Snowman Component (Baymax Style Hands)
const Snowman = ({ position, scale = 1, rotation = [0, 0, 0], scarfColor = "#ff4444", isMobile = false }) => {
  const sphereSegments = isMobile ? 16 : 32;
  const smallSphereSegments = isMobile ? 8 : 16;
  const torusRadialSegments = isMobile ? 8 : 16;
  const torusTubularSegments = isMobile ? 16 : 32;

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* --- Body Parts (2 Balls) --- */}
      {/* Body Snowball */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.1, sphereSegments, sphereSegments]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Head Snowball (Big & Cute) */}
      <mesh position={[0, 2.4, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.85, sphereSegments, sphereSegments]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* --- Face --- */}
      {/* Eyes (Cute Black Beads) */}
      <mesh position={[-0.25, 2.5, 0.75]}>
        <sphereGeometry args={[0.08, smallSphereSegments, smallSphereSegments]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>
      <mesh position={[0.25, 2.5, 0.75]}>
        <sphereGeometry args={[0.08, smallSphereSegments, smallSphereSegments]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>

      {/* Blush (Pink Cheeks) */}
      <mesh position={[-0.45, 2.35, 0.65]}>
        <sphereGeometry args={[0.12, smallSphereSegments, smallSphereSegments]} />
        <meshStandardMaterial color="#ffaaaa" transparent opacity={0.6} roughness={1} />
      </mesh>
      <mesh position={[0.45, 2.35, 0.65]}>
        <sphereGeometry args={[0.12, smallSphereSegments, smallSphereSegments]} />
        <meshStandardMaterial color="#ffaaaa" transparent opacity={0.6} roughness={1} />
      </mesh>

      {/* Nose (Small Cute Carrot) */}
      <mesh position={[0, 2.4, 0.8]} rotation={[1.57, 0, 0]} castShadow>
        <coneGeometry args={[0.06, 0.3, smallSphereSegments]} />
        <meshStandardMaterial color="#ff8800" roughness={0.6} />
      </mesh>

      {/* Mouth (Simple Smile) */}
       <group position={[0, 2.25, 0.78]} rotation={[0.2, 0, 0]}>
         <mesh position={[-0.12, 0.02, 0]}> <sphereGeometry args={[0.03, 8, 8]} /> <meshStandardMaterial color="#1a1a1a" /> </mesh>
         <mesh position={[0, 0, 0.01]}> <sphereGeometry args={[0.03, 8, 8]} /> <meshStandardMaterial color="#1a1a1a" /> </mesh>
         <mesh position={[0.12, 0.02, 0]}> <sphereGeometry args={[0.03, 8, 8]} /> <meshStandardMaterial color="#1a1a1a" /> </mesh>
      </group>

      {/* --- Accessories --- */}
      {/* Scarf (Thick & Cozy) */}
      <mesh position={[0, 1.9, 0]} rotation={[1.8, 0, 0]}>
         <torusGeometry args={[0.55, 0.18, torusRadialSegments, torusTubularSegments]} />
         <meshStandardMaterial color={scarfColor} roughness={0.8} />
      </mesh>
      {/* Scarf Tail */}
      <mesh position={[0.35, 1.5, 0.4]} rotation={[0.2, 0, -0.4]}>
         <cylinderGeometry args={[0.18, 0.18, 0.9, smallSphereSegments]} />
         <meshStandardMaterial color={scarfColor} roughness={0.8} />
      </mesh>

      {/* Arms (Puffy Snow Arms - Baymax Style) */}
      <group position={[0, 1.1, 0]}>
         {/* Left Arm */}
         <mesh position={[-1.05, 0, 0]} rotation={[0, 0, 2.0]} castShadow>
            <capsuleGeometry args={[0.2, 0.8, 4, smallSphereSegments]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
         </mesh>
         
         {/* Right Arm */}
         <mesh position={[1.05, 0, 0]} rotation={[0, 0, -2.0]} castShadow>
            <capsuleGeometry args={[0.2, 0.8, 4, smallSphereSegments]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
         </mesh>
      </group>

    </group>
  );
};

const SnowMountain = ({
  bgImage = '/images/snow-bg.jpg',
  environment,
  fog,
  isMobile = false,
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
    
    // Optimization: Use mobile specific image if available for heavy assets
    let url = (process.env.PUBLIC_URL || '') + bgImage;
    if (isMobile && (bgImage.includes('snow-bg'))) {
      // Use the mobile optimized version from optimized-images folder
      // Check if it's the default snow-bg
      url = (process.env.PUBLIC_URL || '') + '/optimized-images/snow-bg-mobile.webp';
    }

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

    groundUniforms.uTime.value += delta;

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
  const fogColor = fog?.color ?? '#dbeafe';

  const groundUniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uTexture: { value: snowTex },
      uSunColor: { value: new THREE.Color('#ffffff') },
      uShadowColor: { value: new THREE.Color('#ffffff') },
      uFogColor: { value: new THREE.Color('#ffffff') },
      uSunPosition: { value: new THREE.Vector3() },
      uSunIntensity: { value: 1 },
      uAmbientIntensity: { value: 1 },
    };
  }, [snowTex]);

  useEffect(() => {
    if (!snowTex) return;
    groundUniforms.uTexture.value = snowTex;
  }, [snowTex, groundUniforms]);

  useEffect(() => {
    groundUniforms.uSunColor.value.set(sun.color);
    groundUniforms.uShadowColor.value.set(ambient.color);
    groundUniforms.uFogColor.value.set(fogColor);
    groundUniforms.uSunPosition.value.set(sun.position[0], sun.position[1], sun.position[2]);
    groundUniforms.uSunIntensity.value = sun.intensity ?? 1;
    groundUniforms.uAmbientIntensity.value = ambient.intensity ?? 1;
  }, [
    ambient.color,
    ambient.intensity,
    fogColor,
    sun.color,
    sun.intensity,
    sun.position?.[0],
    sun.position?.[1],
    sun.position?.[2],
    groundUniforms,
  ]);

  // Mobile optimization constants
  const groundSegments = isMobile ? 32 : 128;
  const shadowMapSize = isMobile ? [512, 512] : [2048, 2048];
  const scatteredTreeCount = isMobile ? 3 : 15;
  const snowCount = isMobile ? 300 : 2000;

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
        shadow-mapSize={shadowMapSize}
      />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[200, 200, groundSegments, groundSegments]} />
        <shaderMaterial 
          vertexShader={SnowGroundShader.vertexShader}
          fragmentShader={SnowGroundShader.fragmentShader}
          uniforms={groundUniforms}
        />
      </mesh>

      {/* Restored and scaled down procedural mountains as decoration (optional) */}
      {/* 
      <group position={[0, -2, -20]}>
        <MountainRange />
      </group>
      */}

      {/* 
        Custom Blender Model (Snow Mountain)
        We use a Clipping Plane or simply position it so only the top part is visible above ground.
      */}
      {/* <SnowMountainModel 
        path={`${process.env.PUBLIC_URL || ''}/model/Mountain.glb`}
        // Reset to origin to see raw model position
        position={[0, 0, 0]} 
        scale={1} 
      />  */}

      {/* DEBUG: Grid Helper to see the floor plane */}
      {/* <gridHelper args={[200, 50]} position={[0, -5, 0]} /> */}

      {/* Two Classic Snowmen */}
      <Snowman position={[-6, -2, -12]} rotation={[0, 0.5, 0]} scale={0.8} scarfColor="#ff4444" isMobile={isMobile} />
      <Snowman position={[6, -2, -12]} rotation={[0, -0.5, 0]} scale={0.8} scarfColor="#228822" isMobile={isMobile} />

      <group position={[0, -1.8, 0]}>
        <group position={[-8, 0, 5]}> <ChristmasTree scale={1.8} isMobile={isMobile} /> </group>
        <group position={[10, -0.2, 2]}> <ChristmasTree scale={1.5} isMobile={isMobile} /> </group>
        <group position={[-12, 0.5, -5]}> <ChristmasTree scale={2.2} isMobile={isMobile} /> </group>
        <group position={[14, 0, -8]}> <ChristmasTree scale={2.0} isMobile={isMobile} /> </group>
        <group position={[-4, 0, -12]}> <ChristmasTree scale={1.2} isMobile={isMobile} /> </group>
        <group position={[6, 0.2, -15]}> <ChristmasTree scale={1.6} isMobile={isMobile} /> </group>
        
        <ScatteredTrees count={scatteredTreeCount} isMobile={isMobile} />
      </group>

      <Snowfall count={snowCount} />
    </group>
  );
};

export default SnowMountain;
