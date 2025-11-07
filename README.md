# Music Universe

## 项目简介
Music Universe 是一个旨在可视化和探索音乐收藏的 Web 应用程序。它利用各种现代 Web 技术提供交互式和引人入胜的用户体验，包括3D专辑封面展示、以及用户友好的导航提示。
这是「D小调片段记录」公众号音乐分享歌单所作的可视化呈现的尝试。
访问地址：https://magiccoai.github.io/my-music-universe/

## 功能
- **3D 专辑封面展示**: 沉浸式的 3D 专辑封面浏览体验。
- **音乐报告图片轮播**: 展示音乐收藏的统计和报告。
- **音乐播放器**: 内置音乐播放功能。
- **搜索功能**: 快速查找音乐和艺术家。
- **响应式设计**: 适配移动设备的界面。
- **可视化效果**: 流星轨迹、粒子系统和音乐音符等动态视觉效果。
- **数据可视化**: 使用 D3.js 和 ECharts 进行数据分析和展示，例如艺术家和音乐风格词云。
- **多页面应用**: 包含主页、搜索页、档案页和连接页。

## 使用的技术
- **React**: 用于构建用户界面的 JavaScript 库。
- **Three.js**: 用于在浏览器中显示 3D 图形的 JavaScript 3D 库。
- **D3.js**: 用于根据数据操作文档的 JavaScript 库，用于数据驱动的文档。
- **ECharts**: 一个功能强大、交互式的图表和可视化库，用于丰富的数据可视化。
- **Tailwind CSS**: 一个实用程序优先的 CSS 框架，用于快速构建自定义设计和响应式布局。
- **Framer Motion**: 一个用于 React 的生产就绪的动画库，用于流畅的 UI 动画。
- **Craco**: 用于配置 Create React App。

## 项目结构
- `public/`: 静态资源，包括音频、数据、图片和优化后的图片。
- `src/`: 应用程序的源代码。
    - `assets/`: 静态资源，如图标。
    - `components/`: 可重用的 UI 组件，如 `Cover`, `InfoCard`, `MusicPlayer` 等。
    - `hooks/`: 自定义 React Hooks，用于封装可重用逻辑，如 `useIsMobile`, `useMusicData` 等。
    - `pages/`: 应用程序的各个页面，如 `HomePage`, `SearchPage`, `ArchivePage`, `ConnectionsPage`。
    - `utils/`: 实用工具函数，如 `dataTransformUtils.js`。
    

## 安装
要开始使用 Music Universe 项目，请按照以下步骤操作：

1. 克隆仓库：
   ```bash
   git clone <repository_url>
   cd music-universe
   ```

2. 安装依赖项：
   ```bash
   npm install
   ```

## 可用脚本
在项目目录中，您可以运行：

### `npm start`
在开发模式下运行应用程序。
在浏览器中打开 [http://localhost:3001](http://localhost:3001) 查看。

如果您进行编辑，页面将重新加载。
您还将在控制台中看到任何 lint 错误。

### `npm test`
以交互式监视模式启动测试运行器。
有关更多信息，请参阅 [运行测试](https://facebook.github.io/create-react-app/docs/running-tests) 部分。

### `npm run build`
将应用程序构建到 `build` 文件夹中以进行生产。
它在生产模式下正确打包 React，并优化构建以获得最佳性能。

构建已缩小，文件名包含哈希值。
您的应用程序已准备好部署！

有关更多信息，请参阅 [部署](https://facebook.github.io/create-react-app/docs/deployment) 部分。
