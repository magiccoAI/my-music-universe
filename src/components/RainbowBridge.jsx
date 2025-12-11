import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RainbowBridge = () => {
  const meshRef = useRef();

  // Custom Shader for a volumetric, striped rainbow
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    
    // Function to convert HSL to RGB
    vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
    }

    void main() {
      // vUv.x is along the tube length (0 to 1)
      // vUv.y is around the tube cross-section (0 to 1)
      
      // We want the rainbow colors to band along the tube's "top" surface.
      // Let's assume the texture coords are standard for TorusGeometry.
      
      // Adjust y to center the spectrum on the top face
      // We map vUv.y (0-1) to a hue range.
      // We want distinct bands ("horizontal stripes" along the arc).
      
      // Create a "stepped" look for stripes? Or just distinct bands.
      // Let's use a repeating sine pattern to create "stripes" overlaying the rainbow gradient?
      // Or just make the rainbow gradient itself.
      
      // Let's focus on the rainbow gradient first.
      // We map a portion of the UV.y to the full spectrum.
      // Assume 0.25 to 0.75 is the visible top arc of the tube.
      
      float t = vUv.y;
      
      // Shift so 0.5 is center top? 
      // Actually, let's just use the raw Y for now and see. 
      // Usually standard torus UVs wrap around.
      
      // Make it look like "stripes" by quantizing the gradient slightly?
      // "Let the rainbow have horizontal stripes" -> maybe they mean distinct bands.
      // Let's add a subtle scanline effect to emphasize "stripes".
      
      float bands = 7.0; // 7 colors of rainbow
      float quantizedT = floor(t * bands) / bands;
      
      // Smooth rainbow gradient
      // We want Red on outside, Violet on inside.
      // On a torus, this depends on UV mapping. 
      // Let's assume standard mapping and reverse if needed.
      float hue = mix(0.0, 0.75, t); 
      
      vec3 color = hsl2rgb(vec3(hue, 1.0, 0.5));
      
      // Add "stripe" interference lines (scanlines) running parallel to the arc
      // This interprets "horizontal stripes" as a texture detail
      float stripe = sin(vUv.y * 50.0) * 0.5 + 0.5;
      color += stripe * 0.1; 

      // Rim lighting / Fresnel for 3D volume effect
      vec3 viewDir = vec3(0.0, 0.0, 1.0); // Approx view dir in view space? No, use normal.
      // Simple opacity falloff at edges of the tube to make it look gaseous/light-based
      // We use the normal's Y component relative to the tube center?
      // Actually, just fade out the "bottom" of the tube so it looks like an arc, not a donut.
      
      float alpha = 1.0;
      
      // Fade out the ends of the arc (vUv.x)
      float edgeFade = smoothstep(0.0, 0.1, vUv.x) * (1.0 - smoothstep(0.9, 1.0, vUv.x));
      
      // Fade out the "back/bottom" of the tube cross-section
      // Keep only the top-facing part visible
      // vUv.y usually goes 0-1 around. Let's say 0.25-0.75 is top?
      // Let's just use a broad window.
      
      alpha *= edgeFade * 0.6; // Base opacity
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame((state) => {
    if (meshRef.current) {
        // Optional: Slowly pulse or move?
        // meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group position={[0, -18, -15]} rotation={[0.2, 0, 0]}>
      <mesh ref={meshRef}>
        {/* 
            TorusGeometry(radius, tube, radialSegments, tubularSegments, arc) 
            radius: 30 (Wide arc)
            tube: 3 (Thick)
            arc: Math.PI / 1.2 (Not quite a full semicircle, slightly flatter)
        */}
        <torusGeometry args={[30, 4, 32, 100, Math.PI]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default RainbowBridge;
