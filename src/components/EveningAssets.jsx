import React, { useMemo, useRef } from 'react';
import { Sparkles, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useFrame, useLoader, useThree } from '@react-three/fiber';

const SimpleWater = () => {
  // 移动端水面：增加纹理细节，但保持低几何复杂度
  const meshRef = useRef();
  
  // 加载法线贴图以增加水波纹理质感
  const waterNormals = useLoader(
    THREE.TextureLoader,
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/water/Water_1_M_Normal.jpg'
  );

  // 配置纹理重复
  useMemo(() => {
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    waterNormals.repeat.set(6, 6); // 适度重复，避免移动端锯齿
  }, [waterNormals]);
  
  // 使用 useMemo 显式创建几何体，确保引用稳定
  const geometry = useMemo(() => new THREE.PlaneGeometry(1000, 1000, 24, 24), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const time = clock.getElapsedTime();
    const position = meshRef.current.geometry.attributes.position;
    const count = position.count;

    // 移动端简易波动算法
    // 仅使用24x24=576个顶点，计算量极小，性能安全
    for (let i = 0; i < count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        
        // 简化的正弦波叠加 - 增强波动幅度和频率
        // 幅度从 0.8 提升到 1.5，频率从 0.1 提升到 0.15，让起伏更明显
        let z = Math.sin(x * 0.15 + time * 0.8) * 1.5;
        z += Math.cos(y * 0.15 + time * 0.6) * 1.5;
        
        position.setZ(i, z);
    }
    
    position.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    
    // 纹理动画：让法线贴图缓慢流动，增加动态感
    waterNormals.offset.x += 0.0005;
    waterNormals.offset.y += 0.0005;
  });

  return (
    <mesh 
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -5, 0]}
      receiveShadow={false}
    >
      <meshStandardMaterial 
        color="#818cf8" // 提亮基础色：使用明亮的靛蓝色，防止在无环境贴图时变黑
        normalMap={waterNormals}
        normalScale={new THREE.Vector2(0.8, 0.8)} 
        roughness={0.1} 
        metalness={0.1} // 降低金属度：移动端无环境反射，高金属度会导致变黑。降低后可显示基础色
        emissive="#4f46e5" // 增强自发光：模拟夕阳余晖在水面的散射
        emissiveIntensity={0.4} // 提高发光强度，确保水面明亮
        transparent={true}
        opacity={0.8}
        side={THREE.DoubleSide}
        depthWrite={false}
        flatShading={false}
      />
    </mesh>
  );
};

const DynamicWaveWater = () => {
  const meshRef = useRef();
  // 增加分段数以支持顶点动画
  // 1000x1000 大小，128x128 分段
  const geometry = useMemo(() => new THREE.PlaneGeometry(1000, 1000, 128, 128), []);
  
  // 备份原始顶点位置，用于计算波动
  // 我们只需要备份 position 属性，因为我们是在原始平面上进行波动
  // PlaneGeometry 默认在 XY 平面，朝向 Z。旋转后变成 XZ 平面。
  // 顶点原始 Z 都是 0。
  
  const waterNormals = useLoader(
    THREE.TextureLoader,
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/water/Water_1_M_Normal.jpg'
  );
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
  waterNormals.repeat.set(10, 10); // 增加纹理重复，避免拉伸

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const time = clock.getElapsedTime();
    const position = meshRef.current.geometry.attributes.position;
    const count = position.count;

    // 动态更新顶点 Z 坐标 (在旋转前的坐标系中是 Z，即平面的法向起伏)
    for (let i = 0; i < count; i++) {
      const x = position.getX(i);
      const y = position.getY(i); // PlaneGeometry 默认是 XY 平面
      
      // 叠加多个正弦波模拟自然水面
      // 波 1: 大涌浪
      let z = Math.sin(x * 0.05 + time * 0.5) * 1.5;
      // 波 2: 交叉浪
      z += Math.cos(y * 0.05 + time * 0.5) * 1.5;
      // 波 3: 细节纹理波
      z += Math.sin(x * 0.2 + time) * 0.5;
      
      position.setZ(i, z);
    }
    
    position.needsUpdate = true;
    // 重新计算法线以获得正确的光照反射
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -5, 0]}
      receiveShadow // 接收阴影
    >
      <meshStandardMaterial 
        color="#2a3055" // 稍微调亮一点的基础色，偏紫
        normalMap={waterNormals}
        normalScale={new THREE.Vector2(1.5, 1.5)} // 再次增强波浪细节，让反光更细碎
        roughness={0.02} // 极致光滑
        metalness={1.0} // 全金属感，最大化反射环境
        emissive="#7c3aed" // 自发光改为紫色，呼应晚霞
        emissiveIntensity={0.3}
        transparent={true}
        opacity={0.6} // 降低不透明度，让背景透出来
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const Seagull = ({ position, speed = 1, scale = 1, isMobile = false }) => {
  const groupRef = useRef();
  
  // 移动端使用简化的几何体，不再使用 ExtrudeGeometry 和复杂的 Shape
  const { bodyGeo, wingGeo } = useMemo(() => {
    if (isMobile) {
        // 移动端极简几何体
        const body = new THREE.BoxGeometry(0.5, 0.1, 0.1);
        const wing = new THREE.PlaneGeometry(0.8, 0.3);
        return { bodyGeo: body, wingGeo: wing };
    }

    // 桌面端保持原样
    const body = new THREE.CapsuleGeometry(0.06, 0.3, 4, 8);
    body.rotateZ(Math.PI / 2); 
    
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); 
    shape.bezierCurveTo(0.2, 0.05, 0.4, 0.1, 0.8, -0.1); 
    shape.bezierCurveTo(0.5, -0.2, 0.2, -0.15, 0, -0.1); 
    
    const wing = new THREE.ExtrudeGeometry(shape, { 
      depth: 0.02, 
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2
    });
    
    return { bodyGeo: body, wingGeo: wing };
  }, [isMobile]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    
    // 飞行逻辑保持，计算量很小
    groupRef.current.position.x += 0.03 * speed;
    groupRef.current.position.y += Math.sin(t * 1.5 + position[0]) * 0.01;
    
    if (groupRef.current.position.x > 40) {
      groupRef.current.position.x = -40;
      groupRef.current.position.y = position[1] + (Math.random() - 0.5) * 5;
    }
    
    // 移动端不进行复杂的骨骼/翅膀拍打动画，只做整体晃动
    if (!isMobile) {
        // ... 原有桌面端动画逻辑 ...
    }
  });

  if (isMobile) {
      // 移动端极简渲染
      return (
        <group ref={groupRef} position={position} scale={scale}>
            <mesh geometry={bodyGeo}>
                <meshBasicMaterial color="#e2e8f0" />
            </mesh>
             {/* 简单的V形翅膀 */}
            <mesh geometry={wingGeo} position={[0, 0, 0.2]} rotation={[0.5, 0, 0]}>
                <meshBasicMaterial color="#f8fafc" side={THREE.DoubleSide} />
            </mesh>
            <mesh geometry={wingGeo} position={[0, 0, -0.2]} rotation={[-0.5, 0, 0]}>
                <meshBasicMaterial color="#f8fafc" side={THREE.DoubleSide} />
            </mesh>
        </group>
      );
  }

  // 桌面端原有渲染逻辑
  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* 身体 */}
      <mesh geometry={bodyGeo}>
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>
      
      {/* 简化的翅膀渲染，移除复杂的引用 */}
      <mesh geometry={wingGeo} position={[0.05, 0.05, 0]}>
           <meshStandardMaterial color="#f8fafc" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={wingGeo} position={[-0.05, 0.05, 0]} rotation={[0, Math.PI, 0]}>
           <meshStandardMaterial color="#f8fafc" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const Tree = ({ position }) => {
  // 🌲 程序化生成分形树 (Fractal Tree)
  // 模拟参考图中多枝干、细碎叶片的形态
  const { branches, leaves } = useMemo(() => {
    const _branches = [];
    const _leaves = [];
    
    // 递归生成树枝
    // start: 起始点, angle: 生长角度(Euler), length: 长度, radius: 粗细, depth: 剩余深度
    const grow = (start, angle, length, radius, depth) => {
      // 计算终点
      // 使用球坐标系简化计算：y是向上，x/z是水平
      // 这里简化为：先沿Y轴生长，然后旋转
      const end = new THREE.Vector3(0, length, 0);
      end.applyEuler(angle);
      end.add(start);

      // 记录树枝数据
      _branches.push({ start, end, radius, length, angle });

      if (depth <= 0) {
        // 在末端添加叶子簇
        // 模拟参考图中稀疏但均匀的叶片分布
        for (let i = 0; i < 5; i++) {
            const leafPos = end.clone().add(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 1.5
                )
            );
            _leaves.push({ pos: leafPos, scale: Math.random() * 0.3 + 0.2 });
        }
        return;
      }

      // 分支逻辑
      const branchCount = Math.floor(Math.random() * 2) + 2; // 2-3个分支
      for (let i = 0; i < branchCount; i++) {
        // 计算新角度：在当前角度基础上随机偏移
        const offsetX = (Math.random() - 0.5) * 1.5; // 较大的展开角度
        const offsetZ = (Math.random() - 0.5) * 1.5;
        const newAngle = new THREE.Euler(
            angle.x + offsetX,
            angle.y + (Math.random() - 0.5), // 稍微旋转
            angle.z + offsetZ
        );
        
        grow(
            end, 
            newAngle, 
            length * 0.75, // 长度衰减
            radius * 0.7, // 粗细衰减
            depth - 1
        );
      }
    };

    // 启动生长：从原点向上
    grow(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0), 3.5, 0.6, 4);

    return { branches: _branches, leaves: _leaves };
  }, []);

  // 使用 InstancedMesh 渲染叶子以优化性能
  const leafMeshRef = useRef();
  React.useLayoutEffect(() => {
    if (leafMeshRef.current) {
        const tempObj = new THREE.Object3D();
        leaves.forEach((leaf, i) => {
            tempObj.position.copy(leaf.pos);
            tempObj.scale.setScalar(leaf.scale);
            tempObj.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            tempObj.updateMatrix();
            leafMeshRef.current.setMatrixAt(i, tempObj.matrix);
        });
        leafMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [leaves]);

  return (
    <group position={position} scale={[1.2, 1.2, 1.2]}>
      {/* 渲染树枝 */}
      {branches.map((b, i) => {
          // 计算位置和旋转以连接 start 和 end
          const midPoint = b.start.clone().add(b.end).multiplyScalar(0.5);
          const direction = b.end.clone().sub(b.start);
          const len = direction.length();
          
          // 计算旋转四元数
          const quaternion = new THREE.Quaternion();
          quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());

          return (
            <mesh key={i} position={midPoint} quaternion={quaternion}>
                <cylinderGeometry args={[b.radius * 0.7, b.radius, len, 6]} />
                <meshStandardMaterial color="#020617" roughness={1} />
            </mesh>
          );
      })}

      {/* 渲染叶子 (使用 InstancedMesh) */}
      <instancedMesh ref={leafMeshRef} args={[null, null, leaves.length]}>
          {/* 使用菱形/平面模拟树叶，类似参考图的细碎感 */}
          <planeGeometry args={[1, 1]} />
          {/* 半透明材质，模拟叶片透光和空气感 */}
          <meshStandardMaterial 
            color="#0f172a" 
            transparent 
            opacity={0.8} 
            side={THREE.DoubleSide} 
            roughness={1}
          />
      </instancedMesh>
    </group>
  );
};

const WaveLine = ({ position, rotation, scale, speed }) => {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // 🌊 动线动画：缓慢的往复漂移和缩放
    meshRef.current.rotation.z = rotation + Math.sin(t * speed * 0.5) * 0.2;
    const s = scale + Math.sin(t * speed) * 0.1;
    meshRef.current.scale.set(s, s, 1);
    meshRef.current.material.opacity = 0.2 + Math.sin(t * speed * 0.8) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, rotation]}>
      {/* 🎭 涟漪：使用圆环的一段弧线 */}
      <ringGeometry args={[3, 3.1, 64, 1, 0, Math.PI / 1.5]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
};

// 🎨 艺术波浪线曲线定义
class ArtisticSineCurve extends THREE.Curve {
  constructor(scale = 1) {
    super();
    this.scale = scale;
  }
  getPoint(t) {
    // t from 0 to 1
    const x = (t - 0.5) * 10; // -5 to 5
    // 经典手绘风格波浪：y = sin(x)
    const y = Math.sin(x * 1.5) * 0.5;
    return new THREE.Vector3(x * this.scale, y * this.scale, 0);
  }
}

const SineWaveLine = ({ position, rotation, scale, speed }) => {
  const meshRef = useRef();
  // 缓存几何体，避免每帧重建
  const geometry = useMemo(() => {
    const path = new ArtisticSineCurve(1);
    // TubeGeometry: path, segments(20够了), radius(0.04很细), radialSegments(3三角形省面), closed(false)
    return new THREE.TubeGeometry(path, 32, 0.04, 3, false);
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // 🌊 漂浮动画
    // 缓慢沿X轴移动（模拟水流）
    const xOffset = Math.sin(t * speed * 0.3) * 0.5;
    meshRef.current.position.x = position[0] + xOffset;
    
    // 透明度呼吸
    meshRef.current.material.opacity = 0.4 + Math.sin(t * speed + position[0]) * 0.2;
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry}
      position={position} 
      rotation={[-Math.PI / 2, 0, rotation]} 
      scale={[scale, scale, scale]}
    >
      <meshBasicMaterial color="#e0f2fe" transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
};

const StylizedWaveLines = () => {
  // 生成几组写意的波纹线条，点缀在水面上
  // 混合使用“弧形涟漪”和“正弦波浪线”
  return (
    <group position={[0, -4.95, 0]}> {/* 略高于水面 -5 */}
       {/* 🌊 弧形涟漪 */}
       <WaveLine position={[10, 0, -20]} rotation={0} scale={1.2} speed={0.8} />
       <WaveLine position={[-15, 0, -25]} rotation={Math.PI} scale={1.5} speed={0.6} />
       <WaveLine position={[5, 0, -35]} rotation={Math.PI / 2} scale={2} speed={0.4} />
       
       {/* 〰️ 艺术正弦波浪线 (新增) */}
       {/* 近处 */}
       <SineWaveLine position={[0, 0, -15]} rotation={0.2} scale={0.8} speed={1.2} />
       <SineWaveLine position={[12, 0, -18]} rotation={-0.1} scale={1.0} speed={1.0} />
       <SineWaveLine position={[-12, 0, -22]} rotation={0.1} scale={1.2} speed={0.9} />
       
       {/* 远处 */}
       <SineWaveLine position={[-5, 0, -30]} rotation={0.05} scale={1.5} speed={0.8} />
       <SineWaveLine position={[15, 0, -35]} rotation={-0.05} scale={1.8} speed={0.7} />
       <SineWaveLine position={[-20, 0, -40]} rotation={0.1} scale={2.0} speed={0.6} />
    </group>
  );
};

const MobileBoat = ({ position }) => {
  const groupRef = useRef();
  
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    
    // 🌊 核心修复：让船只跟随水面高度波动，避免被淹没
    // 算法必须与 SimpleWater 中的波浪算法保持一致
    const x = position[0];
    const z = position[2]; // World Z
    // PlaneGeometry 旋转 -90度后，Local Y 对应 World -Z
    const geomY = -z; 
    
    // 计算当前位置的水面高度偏移
    // 对应 SimpleWater: sin(x * 0.15 + t * 0.8) * 1.5 + cos(y * 0.15 + t * 0.6) * 1.5
    let waterY = Math.sin(x * 0.15 + t * 0.8) * 1.5;
    waterY += Math.cos(geomY * 0.15 + t * 0.6) * 1.5;
    
    // 基础海平面 -5
    // ⚖️ 阻尼优化：乘以 0.3 的系数，大幅减弱沉浮幅度，让船看起来更稳
    // +0.2 浮力偏移保持不变
    groupRef.current.position.y = -5 + waterY * 0.3 + 0.2;

    // ⛵ 摇摆动画：模拟船身随波晃动 (叠加在跟随运动上)
    // 根据波浪斜率估算摇摆（简化版）
    groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.08; // 减小左右侧倾
    groupRef.current.rotation.x = Math.sin(t * 0.6) * 0.03; // 减小前后俯仰
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, -Math.PI / 6, 0]} scale={[1.8, 1.8, 1.8]}>
      {/* 🚤 船身 - 极简几何体 */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {/* 上宽下窄的船身，横向放置 */}
        <cylinderGeometry args={[0.5, 0.25, 2.5, 6]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>
      
      {/* 甲板装饰（防止看穿） */}
      <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
         <boxGeometry args={[0.8, 2.2, 0.1]} />
         <meshStandardMaterial color="#573e29" roughness={0.9} />
      </mesh>

      {/* 🚩 桅杆 */}
      <mesh position={[0, 1.8, 0.3]}>
        <cylinderGeometry args={[0.04, 0.06, 3.5, 4]} />
        <meshStandardMaterial color="#2a1810" roughness={0.9} />
      </mesh>

      {/* 🏳️ 主帆 - 白色三角帆 */}
      <mesh position={[0, 2.0, 0.8]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 0.1]}>
         {/* 压扁的圆锥体作为帆 */}
         <coneGeometry args={[1.2, 2.5, 4]} />
         <meshStandardMaterial color="#fefce8" roughness={0.4} />
      </mesh>
      
      {/* 🏳️ 副帆 - 小三角帆 */}
      <mesh position={[0, 1.2, -0.6]} rotation={[0, Math.PI / 2, 0]} scale={[0.8, 0.8, 0.1]}>
         <coneGeometry args={[0.8, 1.8, 4]} />
         <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
      </mesh>
    </group>
  );
};

const Mountains = () => {
  return (
    // 提升山脉位置匹配海平面 (y: -5)
    <group position={[0, -5, -60]}>
      {/* 只保留一座主要的孤山，营造极简意境 */}
      <group position={[-25, 0, 10]}>
         {/* 主峰 */}
         <mesh position={[0, 6, 0]} scale={[1.2, 1, 1]}>
            <coneGeometry args={[22, 20, 5]} />
            <meshStandardMaterial color="#0f172a" roughness={1} />
        </mesh>
      </group>
    </group>
  );
};

// 水面波光效果组件 - 专为移动端优化
const WaterGlints = ({ config }) => {
  const count = 120; // 稍微减少数量，让每个光斑更具表现力
  const { positions, phases, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const sz = new Float32Array(count);
    
    for(let i = 0; i < count; i++) {
      // Z轴分布：从近处(-20)延伸到远处(-120)
      const z = -20 - Math.random() * 100; 
      
      // X轴分布：加宽扩散范围，模拟更广阔的水面反光
      const spread = 15 + (Math.abs(z) / 100) * 40;
      const r1 = Math.random();
      const r2 = Math.random();
      // 使用三次方分布让光点更集中在中间，但也有些散落在远处
      const x = (Math.pow(r1 * 2 - 1, 3)) * spread;
      
      const y = -4.9; // 紧贴水面
      
      pos[i*3] = x;
      pos[i*3+1] = y;
      pos[i*3+2] = z;
      
      ph[i] = Math.random() * Math.PI * 2;
      // 随机大小差异，制造远近层次
      sz[i] = 0.5 + Math.random() * 1.5;
    }
    return { positions: pos, phases: ph, sizes: sz };
  }, []);

  const shaderRef = useRef();

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(config.sparkleColor || '#ffccaa') },
      uSize: { value: 120.0 } // 增大基础大小，以适应横向拉伸
    },
    vertexShader: `
      attribute float aPhase;
      attribute float aSize;
      varying float vAlpha;
      uniform float uTime;
      uniform float uSize;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // 添加轻微的水流漂移效果
        // 随时间在X轴上缓慢移动
        mvPosition.x += sin(uTime * 0.2 + aPhase) * 1.5;

        gl_Position = projectionMatrix * mvPosition;
        
        // 大小随距离衰减
        gl_PointSize = uSize * aSize * (30.0 / -mvPosition.z);
        
        // 闪烁计算：更生动的呼吸感
        float sine = sin(uTime * 2.0 + aPhase);
        // 亮度范围 0.2 ~ 1.0
        vAlpha = 0.2 + 0.8 * (sine * 0.5 + 0.5);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        
        // 核心修改：横向拉伸，模拟水面波光的扁平形态
        // y轴乘以4.0，使得纵向距离计算权重增加，形状变扁
        float dist = length(vec2(coord.x, coord.y * 4.0));
        
        if (dist > 0.5) discard;
        
        // 径向渐变，增强中心亮度，模拟反光的高光点
        float glow = 1.0 - (dist * 2.0);
        glow = pow(glow, 2.5); // 增加指数让边缘更锐利
        
        // 混合颜色
        gl_FragColor = vec4(uColor, vAlpha * glow);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }), [config.sparkleColor]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={count}
          array={phases}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={material} ref={shaderRef} attach="material" />
    </points>
  );
};

const EveningAssets = ({ isMobile, config }) => {
  const { scene } = useThree();

  // 合并配置与默认值
  const themeConfig = useMemo(() => ({
    fogColor: '#2e1065',
    ambientIntensity: isMobile ? 0.8 : 0.6,
    dirLightColor: '#fb923c',
    dirLightIntensity: isMobile ? 1.5 : 2.0,
    spotLightColor: '#ff7e5f',
    spotLightIntensity: 8,
    sparkleColor: '#ffccaa',
    ...config
  }), [isMobile, config]);
  
  // 飞鸟群配置
  const birds = useMemo(() => {
    const allBirds = [
      { pos: [-15, 8, -20], speed: 1.2, scale: 0.5 },
      { pos: [-18, 9, -22], speed: 1.1, scale: 0.4 },
      { pos: [-12, 7.5, -18], speed: 1.3, scale: 0.45 },
      { pos: [10, 12, -25], speed: 0.9, scale: 0.3 },
      { pos: [14, 11, -28], speed: 0.85, scale: 0.25 },
    ];
    // 移动端减少飞鸟数量
    return isMobile ? allBirds.slice(0, 3) : allBirds;
  }, [isMobile]);

  // 设置场景雾效，使水面边缘与背景融合
  React.useEffect(() => {
    const oldFog = scene.fog;
    // ⚠️ 修复：改用线性雾 (Fog) 代替指数雾 (FogExp2)
    // 颜色调整为深紫色 #2e1065 (Indigo 950)，避免远处变黑，而是融入夜色
    // near=50: 雾气推远，保证近景清晰
    // far=300: 雾气延伸更远
    scene.fog = new THREE.Fog(themeConfig.fogColor, 50, 300); 
    return () => {
      scene.fog = oldFog;
    };
  }, [scene, themeConfig.fogColor]);

  return (
    <group>
      {/* 🌍 环境贴图：仅桌面端开启，移动端禁用以节省显存 */}
      {!isMobile && <Environment preset="sunset" background={false} />}
      
      {/* 🎨 后处理：Bloom 泛光效果 (仅桌面端) */}
      {!isMobile && (
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.95} // 提高阈值，只有极亮的光源（如水面反光）才发光，避免专辑封面发白
            mipmapBlur 
            intensity={0.8} // 降低发光强度，柔和一点
            radius={0.4}
          />
        </EffectComposer>
      )}

      {/* 💡 暖色夕阳照明系统 - 整体亮度下调，恢复相册清晰度 */}
      {/* 环境光：大幅降低强度，避免画面发白 */}
      <ambientLight intensity={themeConfig.ambientIntensity} color="#6d28d9" /> 
      
      {/* 主光源（夕阳）：保留方向感，但降低强度 */}
      <directionalLight 
        position={[0, 15, -120]} 
        intensity={themeConfig.dirLightIntensity} 
        color={themeConfig.dirLightColor} // 强烈的橙色夕阳
        castShadow={!isMobile} 
      />
      
      {/* 补光：放在相机后方，稍微照亮前景物体 */}
      {!isMobile && <pointLight position={[0, 10, 20]} intensity={0.5} color="#818cf8" />}

      {/* 增加一个聚光灯专门打在水面上形成高光通道 */}
      {/* 调整角度，使其更集中在水面，减少对上方相册墙的影响 */}
      {!isMobile && (
        <spotLight
          position={[0, 30, -60]} // 抬高位置
          angle={0.4} // 减小角度，更聚光
          penumbra={0.5} // 边缘柔和
          intensity={themeConfig.spotLightIntensity} // 降低强度
          color={themeConfig.spotLightColor} // 珊瑚色高光
          distance={300}
          castShadow={true}
        />
      )}

      {/* 🌊 真实水面渲染 - 移动端使用简化版 */}
      <React.Suspense fallback={null}>
        {isMobile ? (
          <>
            <SimpleWater />
            <StylizedWaveLines />
          </>
        ) : <DynamicWaveWater />}
      </React.Suspense>

      {/* 🌅 视觉太阳与晚霞 - 已移除 */}
      {/* <VisualSun /> */}
      {/* <SunsetClouds /> */}

      {/* 🏝️ 远景：一座孤山 */}
      <Mountains />

      {isMobile ? <MobileBoat position={[15, -5.2, -25]} /> : <Tree position={[20, -5, -30]} />}

      {/* 🕊️ 点缀：傍晚归巢的海鸥 */}
      {birds.map((bird, index) => (
        <Seagull key={index} position={bird.pos} speed={bird.speed} scale={bird.scale} isMobile={isMobile} />
      ))}

      {/* ✨ 氛围粒子 (Sparkles) - 模拟水面反光或萤火虫 */}
      <Sparkles 
        count={isMobile ? 50 : 300} // 移动端减少粒子数量
        scale={[40, 10, 40]} 
        position={[0, -2, -10]} 
        size={3} // 再次大幅减小尺寸，消除方块感
        speed={0.3} 
        opacity={0.1} // 极低透明度，若有若无
        color={themeConfig.sparkleColor} 
      />

      {/* 移动端水面波光增强 */}
      {isMobile && <WaterGlints config={themeConfig} />}
    </group>
  );
};

export default EveningAssets;
