/**
 * 数据转换工具函数
 * 用于处理音乐数据的转换和合并逻辑
 */

/**
 * 合并音乐风格标签
 * 将特定标签合并到其他类别中
 * @param {Object} styleCounts - 风格计数对象
 * @returns {Object} - 处理后的风格计数对象
 */
export const mergeStyleTags = (styleCounts) => {
  if (!styleCounts || typeof styleCounts !== 'object') {
    return {};
  }
  const mergedStyle = { ...styleCounts };
  
  // 合并 'graphic background music' 到 'motion' 类别
  if (mergedStyle['graphic background music']) {
    mergedStyle['motion'] = (mergedStyle['motion'] || 0) + mergedStyle['graphic background music'];
    delete mergedStyle['graphic background music'];
  }
  
  return mergedStyle;
};

/**
 * 处理聚合数据
 * 对聚合数据进行必要的转换
 * @param {Object} aggregatedData - 原始聚合数据
 * @returns {Object} - 处理后的聚合数据
 */
export const processAggregatedData = (aggregatedData) => {
  const processed = { ...aggregatedData };
  
  // 处理风格计数
  if (processed.style_counts) {
    processed.style_counts = mergeStyleTags(processed.style_counts);
  }
  
  return processed;
};