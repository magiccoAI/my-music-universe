export const getOptimizedImagePath = (cover) => {
  if (!cover) return '';
  const filename = cover.split('/').pop().replace(/\.[^/.]+$/, '');
  return `${process.env.PUBLIC_URL}/optimized-images/${filename}.webp`;
};