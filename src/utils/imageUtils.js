export const getOptimizedImagePath = (cover) => {
  if (!cover) return '';
  // If it's an external URL (e.g. from iTunes API), return it directly
  if (cover.startsWith('http://') || cover.startsWith('https://')) {
    return cover;
  }
  const filename = cover.split('/').pop().replace(/\.[^/.]+$/, '');
  return `${process.env.PUBLIC_URL}/optimized-images/${filename}.webp`;
};