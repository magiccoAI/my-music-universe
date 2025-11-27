const splitNote = (note) => {
  if (!note) return [];
  return note
    .split(/[,，/\s.?!;:\-_]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => (t === 'graphic background music' ? 'motion' : (t === '循环过' ? '循环' : t)));
};

export { splitNote };
