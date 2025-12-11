import React, { useEffect, useRef, useState } from 'react';
import { Html, useTexture, Float } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Snowfall from './Snowfall';

const SlopedSnowField = ({ texture }) => {
  const geoRef = useRef();

  useEffect(() => {
    const g = geoRef.current;
    if (!g) return;
    const pos = g.attributes.position;
    const arr = pos.array;
    for (let i = 0; i < arr.length; i += 3) {
      const x = arr[i];
      const y = arr[i + 1];
      const d1 = Math.sin(x * 0.12) * 0.08;
      const d2 = Math.cos(y * 0.08) * 0.06;
      const d3 = Math.sin((x + y) * 0.05) * 0.04;
      arr[i + 2] += d1 + d2 + d3;
    }
    pos.needsUpdate = true;
    const uv = g.attributes.uv;
    g.setAttribute('uv2', new THREE.BufferAttribute(uv.array, 2));
    g.computeVertexNormals();
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -2, -10]} receiveShadow>
        <planeGeometry ref={geoRef} args={[60, 80, 256, 256]} />
        <meshPhysicalMaterial 
          color="#f7fbff"
          map={texture}
          bumpMap={texture}
          bumpScale={0.1}
          displacementMap={texture}
          displacementScale={0.65}
          roughness={0.85}
          metalness={0.02}
          roughnessMap={texture}
          aoMap={texture}
          aoMapIntensity={0.35}
          sheen={0.2}
          sheenColor="#ffffff"
          sheenRoughness={0.95}
        />
      </mesh>
    </group>
  );
};

const BottomBerm = () => (
  <group position={[0, -2.6, 8]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 10, 1, 1]} />
      <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
    </mesh>
  </group>
);

const RidgeBackdrop = () => (
  <group position={[0, 4.5, -80]}>
    <mesh rotation={[-0.06, 0, 0]}>
      <planeGeometry args={[300, 120]} />
      <meshBasicMaterial color="#e6edf6" transparent opacity={0.18} />
    </mesh>
  </group>
);

const ChristmasTree = ({ scale = 1 }) => (
  <group scale={scale}>
    <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.12, 0.12, 1.2, 16]} />
      <meshStandardMaterial color="#7c5a37" roughness={0.9} metalness={0.05} />
    </mesh>
    <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
      <coneGeometry args={[1.2, 1.8, 48]} />
      <meshStandardMaterial color="#1f6d3d" roughness={0.95} metalness={0.03} />
    </mesh>
    <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
      <coneGeometry args={[0.9, 1.6, 48]} />
      <meshStandardMaterial color="#1f6d3d" roughness={0.95} metalness={0.03} />
    </mesh>
    <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
      <coneGeometry args={[0.6, 1.4, 48]} />
      <meshStandardMaterial color="#1f6d3d" roughness={0.95} metalness={0.03} />
    </mesh>
    <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.02} />
    </mesh>
  </group>
);

const GarlandLights = ({ count = 80, height = 2.2, baseRadius = 1.2 }) => {
  const mesh = useRef();
  const dummy = React.useMemo(() => new THREE.Object3D(), []);
  const palette = React.useMemo(() => [
    new THREE.Color('#ffd166'),
    new THREE.Color('#ff6b6b'),
    new THREE.Color('#8be9fd'),
    new THREE.Color('#c3f584'),
    new THREE.Color('#fbcfe8'),
  ], []);

  useEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const y = 0.2 + t * (height - 0.4);
      const angle = i * 0.6;
      const r = baseRadius * (1 - y / height) + 0.1;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      mesh.current.setColorAt(i, palette[i % palette.length]);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.instanceColor.needsUpdate = true;
  }, [count, height, baseRadius, dummy, palette]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    const pulse = 0.6 + Math.sin(t * 2.2) * 0.25;
    mesh.current.material.opacity = pulse;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial vertexColors transparent opacity={0.7} />
    </instancedMesh>
  );
};

const SnowCaps = ({ scale = 1 }) => {
  const mesh = useRef();
  const dummy = React.useMemo(() => new THREE.Object3D(), []);
  const rings = React.useMemo(() => ([
    { y: 1.05 * scale, r: 1.0 * scale, count: 24 },
    { y: 1.62 * scale, r: 0.75 * scale, count: 20 },
    { y: 2.05 * scale, r: 0.5 * scale, count: 16 },
  ]), [scale]);

  useEffect(() => {
    if (!mesh.current) return;
    let idx = 0;
    rings.forEach((ring) => {
      for (let i = 0; i < ring.count; i++) {
        const a = (i / ring.count) * Math.PI * 2;
        const jitter = (Math.random() - 0.5) * 0.08 * scale;
        const x = Math.cos(a) * (ring.r + jitter);
        const z = Math.sin(a) * (ring.r + jitter);
        const y = ring.y + Math.sin(a * 3) * 0.03 * scale;
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(0.09 * scale + Math.random() * 0.03 * scale);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [rings, dummy, scale]);

  return (
    <instancedMesh ref={mesh} args={[null, null, rings.reduce((s, r) => s + r.count, 0)]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
    </instancedMesh>
  );
};

const MusicAura = ({ count = 80, radius = 1.2 }) => {
  const mesh = useRef();
  const data = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        angle: (i / count) * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.6,
        r: radius * (0.8 + Math.random() * 0.4),
        h: -0.2 + Math.random() * 1.2,
      });
    }
    return arr;
  }, [count, radius]);

  const dummy = React.useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    const beat = 0.2 + Math.sin(t * 1.5) * 0.1;
    data.forEach((p, i) => {
      const a = p.angle + t * p.speed;
      const x = Math.cos(a) * (p.r + beat);
      const z = Math.sin(a) * (p.r + beat);
      const y = p.h + Math.sin(a * 2) * 0.05;
      dummy.position.set(x, y, z);
      const s = 0.06 + Math.sin(t * 2 + i) * 0.01;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#9fb7ff" transparent opacity={0.85} />
    </instancedMesh>
  );
};

const WireTree = ({ scale = 1 }) => {
  const ornamentsRef = useRef();
  const palette = React.useMemo(() => [
    new THREE.Color('#66ccff'),
    new THREE.Color('#ff6b6b'),
    new THREE.Color('#ffd166'),
    new THREE.Color('#7cffee'),
    new THREE.Color('#c3f584'),
  ], []);

  const curves = React.useMemo(() => {
    const levels = 3;
    const arr = [];
    for (let i = 0; i < levels; i++) {
      const height = 2.2 * scale * (1 - i * 0.18);
      const baseR = 1.2 * scale * (1 - i * 0.25);
      const segs = 200;
      const points = [];
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const r = baseR * (1 - t);
        const a = t * Math.PI * 4 + i * 0.3;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        const y = t * height;
        points.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      arr.push({ curve, points, radius: 0.06 * scale, color: palette[i % palette.length] });
    }
    return arr;
  }, [scale, palette]);

  React.useEffect(() => {
    if (!ornamentsRef.current) return;
    let idx = 0;
    curves.forEach((c, ci) => {
      const sample = 28;
      for (let i = 0; i < sample; i++) {
        const t = i / sample;
        const p = c.curve.getPoint(t);
        const m = new THREE.Matrix4();
        m.setPosition(p.x, p.y + 0.02, p.z);
        ornamentsRef.current.setMatrixAt(idx, m);
        ornamentsRef.current.setColorAt(idx, c.color);
        idx++;
      }
    });
    ornamentsRef.current.instanceMatrix.needsUpdate = true;
    ornamentsRef.current.instanceColor.needsUpdate = true;
  }, [curves]);

  return (
    <group>
      {curves.map((c, i) => (
        <mesh key={`tube-${i}`} castShadow receiveShadow>
          <tubeGeometry args={[c.curve, 200, c.radius, 12, false]} />
          <meshStandardMaterial color={c.color} emissive={c.color} emissiveIntensity={0.25} roughness={0.6} metalness={0.1} />
        </mesh>
      ))}
      {curves.map((c, i) => (
        <mesh key={`frost-${i}`} castShadow receiveShadow>
          <tubeGeometry args={[c.curve, 200, c.radius * 0.55, 12, false]} />
          <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
        </mesh>
      ))}
      <instancedMesh ref={ornamentsRef} args={[null, null, 3 * 28]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial vertexColors transparent opacity={0.85} />
      </instancedMesh>
    </group>
  );
};

const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

const PointsTree = ({ position = [0, 0, 0], scale = 1, count = 3000, isTreeShape = true }) => {
  const geo = useRef();
  const mat = useRef();
  const [stateFlag, setStateFlag] = useState(isTreeShape);

  const H = 12 * scale;
  const R = 3.8 * scale;
  const rimCount = Math.floor(count * 0.08);

  const seeds = React.useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = Math.random() * 10;
    return arr;
  }, [count]);

  const treePositions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    let idx = 0;
    for (let i = 0; i < rimCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const x = Math.cos(ang) * R;
      const z = Math.sin(ang) * R;
      const y = Math.random() * 0.3 * scale;
      arr[idx++] = x; arr[idx++] = y; arr[idx++] = z;
    }
    for (let i = rimCount; i < count; i++) {
      const u = Math.random();
      const h = H * (1 - Math.cbrt(u));
      const r = R * (1 - h / H);
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      arr[idx++] = x; arr[idx++] = h; arr[idx++] = z;
    }
    return arr;
  }, [count, H, R, rimCount, scale]);

  const scatterPositions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    const S = Math.max(R, H * 0.2) + 3 * scale;
    let idx = 0;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * S;
      const x = Math.cos(ang) * rad;
      const z = Math.sin(ang) * rad;
      const y = Math.random() * H * 0.6;
      arr[idx++] = x; arr[idx++] = y; arr[idx++] = z;
    }
    return arr;
  }, [count, H, R, scale]);

  const current = React.useMemo(() => new Float32Array(treePositions), [treePositions]);
  const targetRef = useRef(treePositions);

  useEffect(() => {
    if (!geo.current) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(current, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    g.computeBoundingSphere();
    geo.current.geometry = g;
  }, [current, seeds]);

  useFrame((s, dt) => {
    const lambda = stateFlag ? 6 : 10;
    const target = stateFlag ? targetRef.current : scatterPositions;
    for (let i = 0; i < count * 3; i++) {
      current[i] = damp(current[i], target[i], lambda, dt);
    }
    geo.current.geometry.attributes.position.needsUpdate = true;
    if (mat.current) mat.current.uniforms.uTime.value = s.clock.elapsedTime;
  });

  const uniforms = React.useMemo(() => ({
    uTime: { value: 0 },
    uMaxHeight: { value: H },
    uColorA: { value: new THREE.Color(0.3, 0.1, 0.3) },
    uColorB: { value: new THREE.Color(0.7, 0.5, 0.7) },
  }), [H]);

  const vertex = `
    attribute float aSeed;
    uniform float uTime;
    uniform float uMaxHeight;
    varying float vH;
    varying float vSeed;
    void main(){
      vec3 p = position;
      p.y += sin(uTime * 1.5) * 0.05;
      vH = clamp(p.y / uMaxHeight, 0.0, 1.0);
      vSeed = aSeed;
      gl_PointSize = 3.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;

  const fragment = `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying float vH;
    varying float vSeed;
    void main(){
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float mask = smoothstep(0.5, 0.45, d);
      vec3 col = mix(uColorA, uColorB, vH);
      float flick = step(0.95, sin(vSeed * 50.0 + uTime));
      col = mix(col, vec3(1.0), flick);
      gl_FragColor = vec4(col, mask);
    }
  `;

  return (
    <group position={position} onPointerDown={() => setStateFlag((v) => !v)}>
      <points ref={geo}>
        <shaderMaterial ref={mat} transparent depthWrite={false} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} />
      </points>
    </group>
  );
};

const FloatingAlbum = () => (
  <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
    <group position={[0, 1.5, 0]}>
      <Html transform>
        <div style={{ 
          width: '320px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#1e293b',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{ fontSize: '14px', letterSpacing: '2px', marginBottom: '8px', opacity: 0.7 }}>CURRENT ALBUM</div>
          <div style={{ fontSize: '24px', fontWeight: '300', letterSpacing: '1px' }}>Snow Echoes</div>
        </div>
      </Html>
    </group>
  </Float>
);

const FloatingAlbumWall = () => (
  <group position={[0, 1.8, -2]}>
    <Html transform>
      <div style={{
        width: '760px',
        height: '420px',
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '12px',
        alignItems: 'center',
        justifyItems: 'center',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} style={{
            width: '110px', height: '110px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '8px'
          }} />
        ))}
      </div>
    </Html>
  </group>
);

const Sun = () => (
  <group>
    <directionalLight 
      position={[10, 10, 10]} 
      intensity={1.5} 
      color="#fffaf0" 
      castShadow 
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0001}
    />
    <ambientLight intensity={0.6} color="#dbeafe" />
  </group>
);

const SnowMountain = () => {
  const { camera } = useThree();
  const snowPath = (process.env.PUBLIC_URL || '') + '/images/snow texture.jpg';
  const snowTex = useTexture(snowPath);

  if (snowTex) {
    snowTex.wrapS = THREE.RepeatWrapping;
    snowTex.wrapT = THREE.RepeatWrapping;
    snowTex.repeat.set(10, 10);
    snowTex.anisotropy = 8;
    snowTex.rotation = Math.PI / 16;
    snowTex.center.set(0.5, 0.5);
    snowTex.magFilter = THREE.LinearFilter;
    snowTex.minFilter = THREE.LinearMipmapLinearFilter;
  }

  useEffect(() => {
    camera.position.set(0, 2.2, 9.5);
    camera.lookAt(0, 1.2, -1);
  }, [camera]);

  return (
    <group>
      <color attach="background" args={['#dbeafe']} />
      <fog attach="fog" args={['#dbeafe', 5, 60]} />
      <Snowfall count={800} />
    </group>
  );
};

export default SnowMountain;
