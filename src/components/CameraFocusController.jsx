import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';

/**
 * CameraFocusController
 * 
 * 自动运镜控制器 (The Cinematic Director)
 * 当用户点击专辑时，相机自动平滑飞行到最佳浏览位置。
 * 
 * 策略：
 * 1. 保持当前视角方向 (Direction)，避免剧烈旋转导致眩晕。
 * 2. 调整相机距离 (Distance) 到理想值 (IDEAL_DISTANCE)，确保专辑大小合适。
 * 3. 调整相机中心 (Target)，将专辑置于屏幕左侧 (-Offset)，留出右侧空间给 InfoCard。
 */
const CameraFocusController = ({ target, isMobile, enabled = true }) => {
  const { camera, controls } = useThree();
  
  // 动画状态
  const isAnimating = useRef(false);
  const startTime = useRef(0);
  
  // 配置参数
  const DURATION = 1.5; // 动画持续时间 (秒)
  const IDEAL_DISTANCE = 9; // 理想浏览距离 (单位) - 稍微远一点以容纳卡片
  const SIDE_OFFSET = 2.5; // 横向偏移量 (单位) - 让专辑靠左
  
  // 记录起始和目标状态
  const startPos = useRef(new Vector3());
  const startTarget = useRef(new Vector3());
  const endPos = useRef(new Vector3());
  const endTarget = useRef(new Vector3());
  
  // 监听目标变化
  useEffect(() => {
    // 仅在桌面端、启用状态且有目标时触发
    if (isMobile || !enabled || !target || !target.position) return;
    
    // 1. 记录当前状态
    startPos.current.copy(camera.position);
    startTarget.current.copy(controls.target);
    
    // 2. 获取目标位置 (专辑位置)
    const albumPos = new Vector3(...target.position);
    
    // 3. 计算从相机到专辑的方向向量
    const vecToAlbum = new Vector3().subVectors(albumPos, camera.position);
    const currentDist = vecToAlbum.length();
    
    // 防止重合 (虽然不太可能)
    if (currentDist < 0.1) {
      vecToAlbum.set(0, 0, -1);
    }
    
    // 归一化方向 (这是"看过去"的方向)
    const viewDir = vecToAlbum.clone().normalize();
    
    // 4. 计算右侧向量 (Right Vector)
    // 假设 Y 轴向上，通过叉乘计算右侧方向
    // Cross(ViewDir, Up) -> Right (如果 ViewDir 是看向 -Z, Up 是 +Y, Cross 是 -X... 等等)
    // 实际上 Cross(Forward, Up) -> Right (左手/右手定则)
    // Three.js 是右手坐标系: X(右), Y(上), Z(屏幕外)
    // 如果 ViewDir 是 (0,0,-1) (看向屏幕内), Up 是 (0,1,0)
    // Cross((0,0,-1), (0,1,0)) = (1,0,0) -> Right. 正确。
    const up = new Vector3(0, 1, 0);
    // 注意: 如果从正上方或正下方看，Cross 会失效。这里加个保护。
    if (Math.abs(viewDir.y) > 0.99) {
      up.set(0, 0, -1); // 临时换个 Up
    }
    
    const right = new Vector3().crossVectors(viewDir, up).normalize();
    
    // 5. 计算目标偏移 (Shift)
    // 我们希望专辑出现在屏幕左侧，也就是相机要往右移，或者 Target 往右移。
    // 如果相机和 Target 都往右移 (沿着 Right 向量)，专辑相对就往左了。
    const shiftVector = right.clone().multiplyScalar(SIDE_OFFSET);
    
    // 6. 设定新的 Controls Target
    // Target = AlbumPos + Shift (看向专辑右边的一个点)
    endTarget.current.copy(albumPos).add(shiftVector);
    
    // 7. 设定新的 Camera Position
    // CameraPos = Target - (ViewDir * IDEAL_DISTANCE)
    // 也就是保持原来的观看角度，但是距离调整为 IDEAL_DISTANCE，中心调整为 Target
    endPos.current.copy(endTarget.current).sub(viewDir.clone().multiplyScalar(IDEAL_DISTANCE));
    
    // 启动动画
    isAnimating.current = true;
    startTime.current = null; // 标记需要在下一帧初始化时间
    
  }, [target, isMobile, enabled, camera, controls]); // 依赖项: 当 target 变化时触发

  // 帧循环：执行动画
  useFrame((state) => {
    if (!isAnimating.current) return;
    
    const now = state.clock.elapsedTime;
    
    // 初始化开始时间
    if (startTime.current === null) {
      startTime.current = now;
    }
    
    // 计算进度 (0 -> 1)
    const elapsed = now - startTime.current;
    let progress = Math.min(elapsed / DURATION, 1);
    
    // 使用缓动函数 (Ease Out Cubic: 这是一个非常平滑的减速曲线)
    // f(x) = 1 - (1 - x)^3
    const ease = 1 - Math.pow(1 - progress, 3);
    
    // 插值更新相机和控制器
    camera.position.lerpVectors(startPos.current, endPos.current, ease);
    controls.target.lerpVectors(startTarget.current, endTarget.current, ease);
    
    // 必须调用 update() 才能生效 (特别是如果启用阻尼)
    controls.update();
    
    // 结束判断
    if (progress >= 1) {
      isAnimating.current = false;
    }
  });

  return null; // 这是一个逻辑组件，不渲染任何东西
};

export default CameraFocusController;
