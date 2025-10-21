import React, { useRef, useEffect } from 'react';

const StarRiverBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Star properties
    const stars = [];
    const numStars = 200;
    const starSpeed = 0.5;

    // Create stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5, // 0.5 to 2.5
        speed: Math.random() * starSpeed + 0.1,
        opacity: Math.random(),
        direction: Math.random() > 0.5 ? 1 : -1, // -1 for left, 1 for right
      });
    }

    // Draw a single star
    const drawStar = (star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];

        // Move star
        star.x += star.speed * star.direction;

        // Reset star if it goes off screen
        if (star.direction === 1 && star.x > canvas.width) {
          star.x = 0;
          star.y = Math.random() * canvas.height;
        } else if (star.direction === -1 && star.x < 0) {
          star.x = canvas.width;
          star.y = Math.random() * canvas.height;
        }

        // Update opacity for twinkling effect
        star.opacity += (Math.random() - 0.5) * 0.05; // Random change
        if (star.opacity > 1) star.opacity = 1;
        if (star.opacity < 0) star.opacity = 0;

        drawStar(star);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-initialize stars for new dimensions if needed, or just let them wrap
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-river-background" style={{ position: 'fixed', top: 0, left: 0, zIndex: -2 }} />;
};

export default StarRiverBackground;