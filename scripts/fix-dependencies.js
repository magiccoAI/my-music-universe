const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 开始修复依赖问题...');

try {
  // 移除冲突的包
  execSync('npm uninstall react-p5-wrapper', { stdio: 'inherit' });
  
  // 更新有问题的依赖
  execSync('npm install three@^0.180.0 --save', { stdio: 'inherit' });
  execSync('npm install @testing-library/react@^13.4.0 --save', { stdio: 'inherit' });
  
  console.log('✅ 依赖修复完成');
} catch (error) {
  console.log('❌ 修复过程中出现错误:', error.message);
}