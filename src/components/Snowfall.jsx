import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Snowfall = ({ count = 1000 }) => {
  const mesh = useRef();
  
  // Create particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      const speed = 0.05 + Math.random() * 0.1;
      const factor = 0.2 + Math.random() * 0.8; // Random size factor
      temp.push({ 
          x, y, z, 
          speed, 
          factor,
          vx: 0, vy: 0, vz: 0 // Velocity for interaction
      });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const targetVec = useMemo(() => new THREE.Vector3(), []);

  // Update loop
  useFrame((state) => {
    if (!mesh.current) return;
    
    // Setup Ray from Mouse
    raycaster.setFromCamera(state.pointer, state.camera);
    const ray = raycaster.ray;

    particles.forEach((particle, i) => {
      // 1. Natural Motion
      particle.y -= particle.speed;
      
      // Reset if below threshold
      if (particle.y < -25) {
        particle.y = 25;
        particle.x = (Math.random() - 0.5) * 50;
        particle.z = (Math.random() - 0.5) * 50;
        particle.vx = 0;
        particle.vy = 0;
        particle.vz = 0;
      }

      // 2. Interaction (Repulsion from Ray)
      // Get particle position
      tempVec.set(particle.x, particle.y, particle.z);
      
      // Calculate closest point on ray to particle
      // We can use ray.closestPointToPoint(point, target)
      ray.closestPointToPoint(tempVec, targetVec);
      
      // Distance from particle to that point on ray
      const distSq = tempVec.distanceToSquared(targetVec);
      const interactionRadius = 4; // Interaction radius
      const radiusSq = interactionRadius * interactionRadius;

      if (distSq < radiusSq) {
          // Repel direction: Particle - ClosestPoint
          // Normalized direction
          const dir = tempVec.sub(targetVec).normalize();
          
          // Force strength (stronger when closer)
          const force = (1 - distSq / radiusSq) * 0.02; 
          
          particle.vx += dir.x * force;
          particle.vy += dir.y * force;
          particle.vz += dir.z * force;
      }

      // Apply velocity
      particle.x += particle.vx;
      particle.y += particle.vy; 
      particle.z += particle.vz;

      // Damping (Friction)
      particle.vx *= 0.9;
      particle.vy *= 0.9;
      particle.vz *= 0.9;
      
      // Update instance matrix
      dummy.position.set(particle.x, particle.y, particle.z);
      
      // Add some sway
      dummy.position.x += Math.sin(particle.y) * 0.02;
      
      const s = 0.1 * particle.factor;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#e0f2fe" transparent opacity={0.7} />
    </instancedMesh>
  );
};

export default Snowfall;
