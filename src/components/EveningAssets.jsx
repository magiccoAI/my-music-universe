import React, { useMemo, useRef } from 'react';
import { Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useLoader, useThree } from '@react-three/fiber';

const SimpleWater = () => {
  // 使用纯色材质代替纹理加载，避免纹理加载导致的崩溃
  // 移动端 GPU 对大面积纹理采样非常敏感
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // 简单的上下浮动模拟水面
      meshRef.current.position.y = -5 + Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <mesh 
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -5, 0]}
      receiveShadow={false}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial 
        color="#1e1b4b" // 深邃的蓝紫色
        roughness={0.1} // 光滑
        metalness={0.8} // 金属感
        emissive="#4c1d95" // 微弱的紫色自发光
        emissiveIntensity={0.2}
        transparent={true}
        opacity={0.8}
        side={THREE.DoubleSide}
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

const EveningAssets = ({ isMobile }) => {
  const { scene } = useThree();
  
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
    return isMobile ? allBirds.slice(0, 2) : allBirds;
  }, [isMobile]);

  // 设置场景雾效，使水面边缘与背景融合
  React.useEffect(() => {
    const oldFog = scene.fog;
    // ⚠️ 修复：改用线性雾 (Fog) 代替指数雾 (FogExp2)
    // Fog(color, near, far)
    // near=40: 雾气从距离相机 40 的地方才开始产生，保证近处的专辑墙(z=0左右)完全清晰，不发黑
    // far=200: 远处完全消失在雾中
    scene.fog = new THREE.Fog('#0f172a', 40, 200); 
    return () => {
      scene.fog = oldFog;
    };
  }, [scene]);

  return (
    <group>
      {/* 🌍 环境贴图：提供真实的夕阳反射源 - 移动端禁用以节省内存 */}
      {!isMobile && <Environment preset="sunset" background={false} />}

      {/* 💡 暖色夕阳照明系统 */}
      {/* 环境光：提供基础亮度，偏紫粉色，模拟暮色 */}
      <ambientLight intensity={2.0} color="#6d28d9" /> 
      
      {/* 主光源（夕阳）：放在远处低角度逆光位置，照向相机 */}
      {/* 位置设为 Z 轴负方向远处，模拟太阳即将落山 */}
      <directionalLight 
        position={[0, 10, -100]} 
        intensity={5.0} 
        color="#fb923c" // 强烈的橙色夕阳
        castShadow={!isMobile} // 移动端关闭阴影
      />
      
      {/* 补光：放在相机后方，稍微照亮前景物体，避免完全剪影 */}
      <pointLight position={[0, 10, 20]} intensity={1.5} color="#818cf8" />

      {/* 增加一个聚光灯专门打在水面上形成高光通道 */}
      <spotLight
        position={[0, 20, -50]}
        // target-position 属性无效，SpotLight 默认指向 (0,0,0)，这正是我们需要的
        angle={0.5}
        penumbra={1}
        intensity={10}
        color="#ff7e5f"
        distance={200}
        castShadow={!isMobile} // 移动端关闭阴影
      />

      {/* 🌊 真实水面渲染 - 移动端使用简化版 */}
      <React.Suspense fallback={null}>
        {isMobile ? <SimpleWater /> : <DynamicWaveWater />}
      </React.Suspense>

      {/* 🏝️ 远景：一座孤山 */}
      <Mountains />

      {/* 🌳 前景：水面上的立体树 - 移动端移除 */}
      {!isMobile && <Tree position={[20, -5, -30]} />}

      {/* 🕊️ 点缀：傍晚归巢的海鸥 */}
      {birds.map((bird, index) => (
        <Seagull key={index} position={bird.pos} speed={bird.speed} scale={bird.scale} isMobile={isMobile} />
      ))}

      {/* ✨ 氛围粒子 (Sparkles) - 模拟水面反光或萤火虫 */}
      <Sparkles 
        count={isMobile ? 50 : 300} // 移动端减少粒子数量
        scale={[40, 10, 40]} 
        position={[0, -2, -10]} 
        size={8} 
        speed={0.3} 
        opacity={0.8}
        color="#ffecd2" 
      />
    </group>
  );
};

export default EveningAssets;
