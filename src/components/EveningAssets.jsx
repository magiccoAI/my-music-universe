import React, { useMemo, useRef } from 'react';
import { Sparkles, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import Aurora from './Aurora';
import DesktopBoat from './DesktopBoat';

const SimpleWater = () => {
  // 移动端水面：增加纹理细节，但保持低几何复杂度
  const meshRef = useRef();
  const frameRef = useRef(0);
  
  // 加载本地纹理
  const waterNormals = useLoader(
    THREE.TextureLoader,
    process.env.PUBLIC_URL + '/images/textures/water_normal.jpg'
  );

  // 配置纹理重复
  useMemo(() => {
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    waterNormals.repeat.set(6, 6); // 适度重复，避免移动端锯齿
  }, [waterNormals]);
  
  // 使用 useMemo 显式创建几何体，确保引用稳定
  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(1000, 1000, 24, 24);
    geom.computeVertexNormals();
    return geom;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    frameRef.current += 1;

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
    if (frameRef.current % 8 === 0) {
      meshRef.current.geometry.computeVertexNormals();
    }
    
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
  const { gl } = useThree();
  // 增加分段数以支持顶点动画
  // 700x700 大小，96x96 分段 - 减小尺寸以降低性能压力
  const geometry = useMemo(() => new THREE.PlaneGeometry(700, 700, 96, 96), []);
  
  const waterNormals = useLoader(
    THREE.TextureLoader,
    process.env.PUBLIC_URL + '/images/textures/water_normal.jpg'
  );
  
  useMemo(() => {
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    waterNormals.repeat.set(10, 10); // 增加纹理重复，避免拉伸
    waterNormals.anisotropy = gl.capabilities.getMaxAnisotropy(); // 开启各向异性过滤，减少远处波浪的闪烁/噪点
  }, [waterNormals, gl]);

  const materialRef = useRef();

  useFrame(({ clock }) => {
    if (materialRef.current && materialRef.current.userData.shader) {
        materialRef.current.userData.shader.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  const onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    materialRef.current.userData.shader = shader;

    shader.vertexShader = `
      uniform float uTime;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
        #include <begin_vertex>
        
        // 动态更新顶点 Z 坐标 (在旋转前的坐标系中是 Z，即平面的法向起伏)
        float time = uTime;
        
        // 叠加多个正弦波模拟自然水面
        // 波 1: 大涌浪
        float z = sin(position.x * 0.05 + time * 0.5) * 1.5;
        // 波 2: 交叉浪
        z += cos(position.y * 0.05 + time * 0.5) * 1.5;
        // 波 3: 细节纹理波
        z += sin(position.x * 0.2 + time) * 0.5;
        
        transformed.z += z;

        // 重新计算法线以获得正确的光照反射
        // f(x,y) = 1.5*sin(0.05x + 0.5t) + 1.5*cos(0.05y + 0.5t) + 0.5*sin(0.2x + t)
        // df/dx = 1.5*0.05*cos(...) + 0.5*0.2*cos(...)
        // df/dy = -1.5*0.05*sin(...)
        
        float dfdx = 0.075 * cos(position.x * 0.05 + time * 0.5) + 0.1 * cos(position.x * 0.2 + time);
        float dfdy = -0.075 * sin(position.y * 0.05 + time * 0.5);
        
        vec3 newNormal = normalize(vec3(-dfdx, -dfdy, 1.0));
        vNormal = normalMatrix * newNormal;
      `
    );
  };

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -5, 0]}
      receiveShadow={false} // 🚫 关闭水面接收阴影：动态顶点的自阴影计算非常消耗性能且容易闪烁
    >
      <meshStandardMaterial 
        ref={materialRef}
        color="#2a3055" // 稍微调亮一点的基础色，偏紫
        normalMap={waterNormals}
        normalScale={new THREE.Vector2(0.8, 0.8)} // 降低法线强度，减少过于锐利的反光导致的频闪
        roughness={0.3} // 增加粗糙度，让反光更柔和，减少亮点跳动
        metalness={0.8} // 稍微降低金属度
        emissive="#7c3aed" // 自发光改为紫色，呼应晚霞
        emissiveIntensity={0.2} // 降低发光强度
        transparent={true}
        opacity={0.6} // 降低不透明度，让背景透出来
        side={THREE.DoubleSide}
        onBeforeCompile={onBeforeCompile}
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
  const { branches, leaves, fruits } = useMemo(() => {
    // 简单的伪随机数生成器 (Linear Congruential Generator)
    // 保证每次刷新页面时生成的树形状一致
    let seed = 67890; // 更换种子以获得更好看的初始形态
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const _branches = [];
    const _leaves = [];
    const _fruits = [];
    
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

      // 在末端添加叶子簇，不仅是最后深度的，倒数第二层也添加，增加繁茂感
      if (depth <= 1) {
        // 模拟参考图中稀疏但均匀的叶片分布
        // 增加叶子数量
        const leafCount = depth === 0 ? 8 : 4;
        for (let i = 0; i < leafCount; i++) {
            const leafPos = end.clone().add(
                new THREE.Vector3(
                    (random() - 0.5) * 2.0,
                    (random() - 0.5) * 2.0,
                    (random() - 0.5) * 2.0
                )
            );
            _leaves.push({ pos: leafPos, scale: random() * 0.4 + 0.3 });
            
            // 🍎 氛围感：在某些叶片处增加“发光果实”
            if (random() > 0.85) {
              _fruits.push({ pos: leafPos.clone().add(new THREE.Vector3(0, -0.2, 0)) });
            }
        }
      }

      if (depth <= 0) return;

      // 分支逻辑
      // 增加分支数量的随机性，偶尔出现3个分支
      const branchCount = random() > 0.3 ? 2 : 3; 
      
      for (let i = 0; i < branchCount; i++) {
        // 计算新角度：让树更倾向于向上生长，减少水平散开
        // 减小 X/Z 的偏移范围，增加 Y 轴的保持力
        const spreadFactor = 0.8 + depth * 0.1; // 越往上越散开
        const offsetX = (random() - 0.5) * spreadFactor; 
        const offsetZ = (random() - 0.5) * spreadFactor;
        
        // 基础角度 + 随机偏移
        const newAngle = new THREE.Euler(
            angle.x + offsetX,
            angle.y + (random() - 0.5) * 2.0, // Y轴旋转可以随意一点
            angle.z + offsetZ
        );
        
        grow(
            end, 
            newAngle, 
            length * 0.8, // 长度衰减减缓，让树更高挑
            radius * 0.65, // 粗细衰减
            depth - 1
        );
      }
    };

    // 启动生长：从原点向上
    // 增加初始高度，增加递归深度
    grow(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0), 4.0, 0.7, 5);

    return { branches: _branches, leaves: _leaves, fruits: _fruits, random };
  }, []);

  // 使用 InstancedMesh 渲染叶子以优化性能
  const leafMeshRef = useRef();
  React.useLayoutEffect(() => {
    if (leafMeshRef.current) {
        // 复用 useMemo 中创建的 random 函数，确保叶子旋转也一致
        // 但由于 random 是闭包内的，这里重新创建一个临时的或使用 leaves 数据中的随机性
        // 为了简单，这里我们可以重新使用一个确定的种子生成器，或者直接使用 leaves 索引作为伪随机源
        const tempObj = new THREE.Object3D();
        leaves.forEach((leaf, i) => {
            tempObj.position.copy(leaf.pos);
            tempObj.scale.setScalar(leaf.scale);
            
            // 使用索引 i 生成伪随机旋转，保证确定性
            const pseudoRandom = (seed) => {
                const x = Math.sin(seed) * 10000;
                return x - Math.floor(x);
            };
            
            tempObj.rotation.set(
                pseudoRandom(i) * Math.PI, 
                pseudoRandom(i + 1000) * Math.PI, 
                0
            );
            tempObj.updateMatrix();
            leafMeshRef.current.setMatrixAt(i, tempObj.matrix);
        });
        leafMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [leaves]);

  return (
    <group position={position} scale={[0.8, 0.8, 0.8]}>
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

      {/* 🏮 渲染发光果实/小灯笼 */}
      {fruits.map((f, i) => (
        <mesh key={i} position={f.pos}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial 
            color="#fb923c" 
            emissive="#f97316" 
            emissiveIntensity={2} 
          />
        </mesh>
      ))}
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

// 🏝️ 新增：微型孤岛/礁石组件
const MiniIsland = ({ position }) => {
  return (
    <group position={position}>
      {/* 礁石底座 */}
      <mesh position={[0, -0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[4, 5, 1.5, 6]} />
        <meshStandardMaterial color="#1e293b" roughness={1} />
      </mesh>
      {/* 旁边的小石块 */}
      <mesh position={[3, -0.8, 2]} scale={[0.8, 0.5, 0.8]}>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial color="#334155" roughness={1} />
      </mesh>
      <mesh position={[-2, -0.9, -3]} scale={[0.6, 0.4, 0.6]} rotation={[1, 0, 1]}>
        <dodecahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>
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
    showAurora: false,
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
      {/* 🌌 极光效果 - 放在山脉后方作为背景 */}
      {themeConfig.showAurora && <Aurora position={[0, 20, -80]} scale={[2, 2, 1]} />}

      {/* 🌍 环境贴图：仅桌面端开启，移动端禁用以节省显存 */}
      {!isMobile && <Environment preset="sunset" background={false} />}
      
      {/* 🎨 后处理：Bloom 泛光效果 (仅桌面端) */}
      {!isMobile && (
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.9} // 提高阈值，仅对极亮部分产生辉光，防止水面普通反光引起频闪
            mipmapBlur 
            intensity={0.4} // 降低强度，使辉光更自然
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
        shadow-bias={-0.0005} // 减少阴影伪影 (Shadow Acne)
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
          castShadow={false} // 🚫 关闭聚光灯阴影：性能开销大且在水面上效果不明显
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

      {/* 🏝️ 桌面端：树与帆船的意境组合 */}
      {isMobile ? (
        <MobileBoat position={[15, -5.2, -25]} />
      ) : (
        <group position={[25, -5, -40]}>
          
          {/* 树生长在岛上 */}
          <Tree position={[0, 0, 0]} />
          
          {/* 🕯️ 氛围光源：给树和船增加一个暖色局部光，模拟灯笼或奇幻氛围 */}
          <pointLight position={[0, 5, 0]} intensity={20} distance={25} color="#fb923c" decay={2} />
          
          {/* ✨ 专属萤火虫粒子：环绕树木 */}
          <Sparkles 
            count={40}
            scale={[8, 12, 8]} 
            position={[0, 5, 0]} 
            size={4}
            speed={0.5} 
            opacity={0.8}
            color="#fde047" // 明亮的萤火虫黄
          />
        </group>
      )}

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

      {/* 🌫️ 新增：海面薄雾 (Sea Mist) - 增强远景深度感 */}
      {!isMobile && (
        <Sparkles 
          count={100}
          scale={[100, 5, 100]} 
          position={[0, -4, -40]} 
          size={20} // 较大的粒子模拟雾团
          speed={0.1} 
          opacity={0.03} 
          color="#a5b4fc" // 淡紫色雾气
        />
      )}

      {/* 移动端水面波光增强 */}
      {isMobile && <WaterGlints config={themeConfig} />}
    </group>
  );
};

export default EveningAssets;
