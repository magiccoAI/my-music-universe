import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import PropTypes from 'prop-types';

const MusicalNotes = ({ count = 15, speed = 1 }) => {
  const groupRef = useRef();
  const notesRef = useRef([]);
  const { viewport } = useThree();

  // 音符形状定义
  const noteShapes = useMemo(() => {
    const shapes = [];
    
    // 八分音符形状
    const eighthNoteShape = new THREE.Shape();
    eighthNoteShape.moveTo(0, 0);
    eighthNoteShape.lineTo(0.2, 0.5);
    eighthNoteShape.lineTo(0.4, 0.3);
    eighthNoteShape.lineTo(0.2, 0.1);
    eighthNoteShape.lineTo(0, 0);
    shapes.push(eighthNoteShape);

    // 四分音符形状
    const quarterNoteShape = new THREE.Shape();
    quarterNoteShape.ellipse(0, 0, 0.15, 0.25, 0, Math.PI * 2);
    quarterNoteShape.moveTo(0.15, 0.25);
    quarterNoteShape.lineTo(0.15, 0.8);
    shapes.push(quarterNoteShape);

    // 全音符形状
    const wholeNoteShape = new THREE.Shape();
    wholeNoteShape.ellipse(0, 0, 0.2, 0.3, 0, Math.PI * 2);
    shapes.push(wholeNoteShape);

    // 高音谱号形状（简化）
    const trebleClefShape = new THREE.Shape();
    trebleClefShape.moveTo(0, 0);
    trebleClefShape.bezierCurveTo(0.2, 0.3, 0.1, 0.6, 0, 0.8);
    trebleClefShape.bezierCurveTo(-0.1, 0.6, -0.2, 0.3, 0, 0);
    shapes.push(trebleClefShape);

    return shapes;
  }, []);

  // 初始化音符
  useEffect(() => {
    const currentGroup = groupRef.current; // Capture the current value of groupRef.current
      notesRef.current = [];
      
      for (let i = 0; i < count; i++) {
        const shapeIndex = Math.floor(Math.random() * noteShapes.length);
        const shape = noteShapes[shapeIndex];
        
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.6 + Math.random() * 0.3),
          transparent: true,
          opacity: 0.7 + Math.random() * 0.3,
          side: THREE.DoubleSide
        });
  
        const mesh = new THREE.Mesh(geometry, material);
        
        // 随机位置
        mesh.position.set(
          (Math.random() - 0.5) * viewport.width * 0.8,
          (Math.random() - 0.5) * viewport.height * 0.8,
          (Math.random() - 0.5) * 10
        );
  
        // 随机旋转
        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
  
        // 随机缩放
        const scale = 0.3 + Math.random() * 0.4;
        mesh.scale.set(scale, scale, scale);
  
        // 动画属性
        mesh.userData = {
          speed: 0.5 + Math.random() * speed,
          rotationSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
          ),
          floatSpeed: 0.2 + Math.random() * 0.3,
          floatDirection: new THREE.Vector3(
            (Math.random() - 0.5) * 0.005,
            (Math.random() - 0.5) * 0.005,
            0
          ),
          pulseSpeed: 1 + Math.random() * 2,
          originalScale: scale,
          timeOffset: Math.random() * Math.PI * 2
        };
  
        currentGroup.add(mesh);
        notesRef.current.push(mesh);
      }
  
      return () => {
        notesRef.current.forEach(note => {
          note.geometry.dispose();
          note.material.dispose();
          if (currentGroup) {
            currentGroup.remove(note);
          }
        });
        notesRef.current = [];
      };
    }, [count, speed, viewport, noteShapes]);

  // 动画帧更新
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    notesRef.current.forEach((note, index) => {
      const data = note.userData;
      
      // 旋转动画
      note.rotation.x += data.rotationSpeed.x * data.speed;
      note.rotation.y += data.rotationSpeed.y * data.speed;
      note.rotation.z += data.rotationSpeed.z * data.speed;

      // 浮动动画
      note.position.x += Math.sin(time * data.floatSpeed + index) * 0.001 * data.speed;
      note.position.y += Math.cos(time * data.floatSpeed + index) * 0.001 * data.speed;
      note.position.z += Math.sin(time * data.floatSpeed * 0.5 + index) * 0.001 * data.speed;

      // 脉动缩放动画
      const pulse = Math.sin(time * data.pulseSpeed + data.timeOffset) * 0.1 + 1;
      note.scale.setScalar(data.originalScale * pulse);

      // 边界检测和反弹
      const bounds = viewport.width * 0.4;
      if (Math.abs(note.position.x) > bounds) {
        data.floatDirection.x *= -1;
      }
      if (Math.abs(note.position.y) > bounds * 0.6) {
        data.floatDirection.y *= -1;
      }

      note.position.x += data.floatDirection.x * data.speed;
      note.position.y += data.floatDirection.y * data.speed;

      // 透明度变化
      note.material.opacity = 0.6 + Math.sin(time + index) * 0.2;
    });

    // 整体缓慢旋转
    groupRef.current.rotation.y = time * 0.05;
    groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* 环境光 */}
      <ambientLight intensity={0.4} />
      
      {/* 点光源 */}
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#4ecdc4" />
      <pointLight position={[-5, -5, 5]} intensity={0.6} color="#ff6b6b" />
      <pointLight position={[0, 0, -5]} intensity={0.5} color="#45b7d1" />
    </group>
  );
};

// 性能优化的简单音符版本
export const SimpleMusicalNotes = ({ count = 8 }) => {
  const groupRef = useRef();
  const notesRef = useRef([]);

  useEffect(() => {
    notesRef.current = [];
    
    for (let i = 0; i < count; i++) {
      // 使用简单的平面几何体
      const geometry = new THREE.PlaneGeometry(0.3, 0.5);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.7),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4
      );

      mesh.rotation.z = Math.random() * Math.PI;

      mesh.userData = {
        speed: 0.3 + Math.random() * 0.4,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };

      groupRef.current.add(mesh);
      notesRef.current.push(mesh);
    }

    return () => {
      notesRef.current.forEach(note => {
        note.geometry.dispose();
        note.material.dispose();
      });
    };
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    notesRef.current.forEach((note, index) => {
      note.rotation.z += note.userData.rotationSpeed;
      note.position.y += Math.sin(time * note.userData.speed + index) * 0.01;
      note.position.x += Math.cos(time * note.userData.speed * 0.7 + index) * 0.005;
      
      // 简单的脉动效果
      note.material.opacity = 0.4 + Math.sin(time + index) * 0.3;
    });
  });

  return <group ref={groupRef} />;
};

MusicalNotes.propTypes = {
  count: PropTypes.number,
  speed: PropTypes.number
};

export default MusicalNotes;