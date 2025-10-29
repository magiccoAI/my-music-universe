import { useState, useEffect } from 'react';

export default function useMeteorTrail() {
  const [trails, setTrails] = useState([]);

  const handleMouseMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;

    const id = Math.random().toString(36).slice(2, 8);

    setTrails((prev) => [
      ...prev,
      { id, x, y }
    ]);
  };

  // 自动清理
  useEffect(() => {
    if (trails.length > 40) {
      setTrails((prev) => prev.slice(-40));
    }
  }, [trails]);

  const MeteorRenderer = () => (
    <div className="pointer-events-none fixed inset-0 z-50">
      {trails.map((m) => (
        <span
          key={m.id}
          style={{
            left: m.x,
            top: m.y,
          }}
          className="absolute inline-block w-1 h-1 
            bg-white/90 rounded-full 
            animate-meteor"
        />
      ))}
    </div>
  );

  return { handleMouseMove, MeteorRenderer };
}