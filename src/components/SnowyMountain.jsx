import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple pseudo-random function
const random = (x, y) => {
  const sin = Math.sin(x * 12.9898 + y * 78.233);
  return (sin * 43758.5453) % 1;
};

// Simple value noise
const noise = (x, y) => {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const f = x - i;
  const g = y - j;

  // Four corners
  const a = random(i, j);
  const b = random(i + 1, j);
  const c = random(i, j + 1);
  const d = random(i + 1, j + 1);

  // Smooth interpolation
  const u = f * f * (3.0 - 2.0 * f);
  const v = g * g * (3.0 - 2.0 * g);

  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
};

// Fractal noise (fbm)
const fbm = (x, y, octaves = 4) => {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, y * frequency) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
};

// Ridged multifractal noise for sharp peaks
const ridgedNoise = (x, y, octaves = 6) => {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let weight = 1.0;
  
  for (let i = 0; i < octaves; i++) {
    // 1. Get noise
    let signal = noise(x * frequency, y * frequency);
    
    // 2. Make it absolute (ridges)
    signal = Math.abs(signal);
    
    // 3. Invert so ridges are up
    signal = 1.0 - signal;
    
    // 4. Square it to make ridges sharper
    signal = signal * signal;
    
    // 5. Weight by previous layer (optional, but good for terrain)
    signal *= weight;
    weight = signal * 1.5; // Update weight
    weight = Math.min(Math.max(weight, 0), 1);
    
    value += signal * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value * 2.0; // Scale up
};

const SnowyMountain = ({ position = [0, -15, 0], scale = 1 }) => {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    // Increase resolution for sharper details
    const geo = new THREE.PlaneGeometry(60, 60, 200, 200);
    
    const posAttribute = geo.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < posAttribute.count; i++) {
      vertex.fromBufferAttribute(posAttribute, i);
      
      const x = vertex.x;
      const y = vertex.y; // Z in world space
      
      const dist = Math.sqrt(x * x + y * y);
      const maxDist = 28;
      
      // Softer mask falloff
      let mask = 1 - Math.min(dist / maxDist, 1);
      mask = mask * mask * (3 - 2 * mask); // Smoothstep

      // Use Ridged Noise for main shape (sharp peaks)
      let height = ridgedNoise(x * 0.1, y * 0.1, 5) * 15;
      
      // Add FBM for general unevenness
      height += fbm(x * 0.2, y * 0.2, 3) * 4;

      // Apply mask
      vertex.z = height * mask;

      posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    // 2. Compute Normals FIRST to use for slope-based coloring
    geo.computeVertexNormals();

    // 3. Add vertex colors based on Slope and Height
    const colors = [];
    const colorAttribute = new THREE.BufferAttribute(new Float32Array(posAttribute.count * 3), 3);
    
    // Updated Palette based on the new reference image (Warm/Rust Rocks + White Snow)
    const snowColor = new THREE.Color(0xffffff); // Pure white snow
    const snowShadowColor = new THREE.Color(0xe0e8f0); // Blue-ish shadow for snow
    
    // Rust/Copper tones for the rocks
    const rockColorDark = new THREE.Color(0x5a3a2a); // Dark brownish rust
    const rockColorLight = new THREE.Color(0x8b5a3b); // Lighter copper/rust
    
    const normalAttribute = geo.attributes.normal;
    const normal = new THREE.Vector3();

    for (let i = 0; i < posAttribute.count; i++) {
      const h = posAttribute.getZ(i);
      normal.fromBufferAttribute(normalAttribute, i);
      
      const slope = normal.z; // 1 = flat, 0 = vertical
      
      // Noise to break up the texture patterns
      const noiseVal = noise(posAttribute.getX(i) * 0.5, posAttribute.getY(i) * 0.5);
      const microNoise = noise(posAttribute.getX(i) * 2.0, posAttribute.getY(i) * 2.0); // Detail noise

      let finalColor = new THREE.Color();

      // Rock vs Snow threshold
      // Steeper slopes (lower normal.z) get rock.
      // High peaks (h > 10) might shed snow more if they are very steep cliffs.
      // Low valleys (h < 2) accumulate snow.
      
      let slopeThreshold = 0.65;
      slopeThreshold += noiseVal * 0.15; // Vary threshold
      slopeThreshold -= (h * 0.01); // Higher areas slightly more likely to be rock if steep (wind blown)

      if (slope > slopeThreshold) {
        // SNOW
        finalColor.lerpColors(snowShadowColor, snowColor, 0.5 + microNoise * 0.5);
      } else {
        // ROCK (Rust colors)
        // Mix dark and light rock based on noise and height
        const rockMix = 0.5 + noiseVal * 0.5;
        finalColor.lerpColors(rockColorDark, rockColorLight, rockMix);
        
        // Add a bit of white noise to simulate frost on rocks
        if (microNoise > 0.6) {
             finalColor.lerp(snowColor, 0.2);
        }
      }
      
      // Bottom blending
      if (h < 1.0) {
         finalColor.lerp(snowColor, 1 - h);
      }

      colorAttribute.setXYZ(i, finalColor.r, finalColor.g, finalColor.b);
    }
    
    geo.setAttribute('color', colorAttribute);

    return geo;
  }, []);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Main Mountain Mesh */}
      <mesh 
        ref={meshRef} 
        geometry={geometry} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <meshStandardMaterial 
          vertexColors={true}
          roughness={0.7}
          metalness={0.1}
          flatShading={true} // Low poly aesthetic
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default SnowyMountain;
