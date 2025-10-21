const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F8C471", "#82E0AA", "#F1948A", "#AED6F1", "#D7BDE2",
  "#A9DFBF", "#F9E79F", "#D5DBDB", "#FAD7A0", "#ABEBC6"
];

function _processWordCloudData(data, field) {
  const wordCounts = {};

  data.forEach(item => {
    const value = item[field];
    if (value) {
      // Handle cases where 'note' might be a comma-separated string
      if (field === 'note' && value.includes(',')) {
        value.split(',').forEach(word => {
          const trimmedWord = word.trim();
          if (trimmedWord) {
            wordCounts[trimmedWord] = (wordCounts[trimmedWord] || 0) + 1;
          }
        });
      } else {
        const trimmedValue = value.trim();
        if (trimmedValue) {
          wordCounts[trimmedValue] = (wordCounts[trimmedValue] || 0) + 1;
        }
      }
    }
  });

  const sortedWords = Object.entries(wordCounts).sort(([, countA], [, countB]) => countB - countA);

  return sortedWords.map(([text, value], index) => ({
    text,
    value,
    color: colors[index % colors.length]
  }));
}

export const processWordCloudData = (musicData) => {
  return {
    noteWordCloud: _processWordCloudData(musicData, 'note'),
    artistWordCloud: _processWordCloudData(musicData, 'artist'),
  };
};