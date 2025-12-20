import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const SkyMountains = () => {
  return (
    <group>
      <mesh position={[0, 40, -120]}>
        <planeGeometry args={[400, 200]} />
        <meshBasicMaterial color="#bde8ff" />
      </mesh>
      <mesh position={[-40, 20, -80]}>
        <coneGeometry args={[30, 40, 4]} />
        <meshStandardMaterial color="#e5f0ff" />
      </mesh>
      <mesh position={[30, 18, -90]}>
        <coneGeometry args={[28, 38, 4]} />
        <meshStandardMaterial color="#d4ecff" />
      </mesh>
      <mesh position={[5, 16, -70]}>
        <coneGeometry args={[24, 32, 4]} />
        <meshStandardMaterial color="#e0f2ff" />
      </mesh>
    </group>
  );
};

const FlowerField = ({ count = 140 }) => {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(
    () => [
      new THREE.Color('#f9c5d1'),
      new THREE.Color('#fde68a'),
      new THREE.Color('#bfdbfe'),
      new THREE.Color('#bbf7d0'),
    ],
    []
  );

  React.useEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      const radius = 18 + Math.random() * 24;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = -10 + Math.sin(angle) * radius;
      const y = -4.9;
      dummy.position.set(x, y, z);
      const s = 0.2 + Math.random() * 0.18;
      dummy.scale.set(s, s, s);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      mesh.current.setColorAt(i, colors[i % colors.length]);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) {
      mesh.current.instanceColor.needsUpdate = true;
    }
  }, [count, dummy, colors]);

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <circleGeometry args={[0.25, 5]} />
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  );
};

const GroundFlowers = ({ isMobile }) => {
  const flowerCount = isMobile ? 90 : 160;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, -5]}>
        <circleGeometry args={[60, 64]} />
        <meshStandardMaterial color="#b7e28a" />
      </mesh>
      <FlowerField count={flowerCount} />
    </group>
  );
};

const LakeIslands = () => {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, -5.1, -22]} scale={[1.6, 1, 1]}>
        <circleGeometry args={[14, 40]} />
        <meshStandardMaterial color="#4ba3f5" metalness={0.1} roughness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-18, -5, -18]} scale={[0.7, 0.7, 1]}>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial color="#b4e48a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, -4.9, -16]} scale={[0.55, 0.55, 1]}>
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial color="#bde7a0" />
      </mesh>
    </group>
  );
};

const CabinAndBridge = () => {
  return (
    <group position={[10, -5, -26]}>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[6.4, 4, 5]} />
        <meshStandardMaterial color="#f4e0c8" />
      </mesh>
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[7, 2.4, 5.6]} />
        <meshStandardMaterial color="#d1b38b" />
      </mesh>
      <mesh position={[-5.5, 2.3, 3]}>
        <boxGeometry args={[11, 1.2, 3.2]} />
        <meshStandardMaterial color="#e6d5b8" />
      </mesh>
      <mesh position={[-7.5, 1.2, 3]}>
        <boxGeometry args={[2, 1.2, 3.2]} />
        <meshStandardMaterial color="#c9b79a" />
      </mesh>
    </group>
  );
};

const LakeSparkles = () => {
  return (
    <Sparkles
      count={120}
      scale={[26, 4, 16]}
      size={2}
      speed={0.2}
      opacity={0.4}
      color="#fef9c3"
      position={[-10, -4.5, -22]}
    />
  );
};

const DayMeadowLakeScene = ({ isMobile }) => {
  const { scene } = useThree();
  const targetBackground = useMemo(() => new THREE.Color('#bde8ff'), []);

  React.useEffect(() => {
    const previousBackground = scene.background;
    scene.background = targetBackground;
    return () => {
      scene.background = previousBackground;
    };
  }, [scene, targetBackground]);

  useFrame(() => {});

  return (
    <group>
      <SkyMountains />
      <GroundFlowers isMobile={isMobile} />
      <LakeIslands />
      <LakeSparkles />
      <CabinAndBridge />
    </group>
  );
};

export default DayMeadowLakeScene;

