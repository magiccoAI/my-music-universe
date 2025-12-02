# Music Universe - 音乐宇宙可视化

## 🎵 项目简介

**Music Universe** 是一个极具创意和交互性的音乐收藏可视化 Web 应用程序。作为「D小调片段记录」音乐分享的歌单可视化尝试，本项目将抽象的音乐数据转化为一个沉浸式的“音乐宇宙”。

在这个宇宙中，每一首音乐都是一颗独特的星辰，用户可以在星际间漫游，探索音乐与艺术家之间的联系，通过可视化的方式重新发现收藏中的珍宝。

🔗 **在线访问**: [https://magiccoai.github.io/my-music-universe/](https://magiccoai.github.io/my-music-universe/)

---

## 🗺️ 页面导览 & 亮点

### 1. 🏠 首页 (Home)
**探索起点**
- **沉浸式氛围**: 星空背景与流星划过的动态视觉效果，为音乐探索之旅定下唯美基调。
- **便捷导航**: 快速通往“音乐宇宙”、“时光机”等核心功能模块。

### 2. 🌌 音乐封面宇宙 (Music Universe)
**核心 3D 体验**
- **3D 专辑星系**: 利用 Three.js 构建的 3D 空间，每一张歌单中的专辑封面都悬浮于浩瀚星空中。
- **自由漫游**: 支持键盘（方向键）和鼠标交互，像驾驶飞船一样在音乐星系中穿梭、拉近观察每一张专辑的细节及相关信息。

### 3. ⏳ 音乐时光机 (Archive)
**数据归档与随机发现**
- **数据概览**: 展示收藏总量、跨越天数、艺术家与风格数量等统计信息。
- **音乐词云星系**: 通过动态词云（基于 ECharts），直观呈现你最喜爱的艺术家和音乐风格。
- **音乐老虎机 (Slot Machine)**: 独特的随机推荐组件，拉动拉杆，随机抽取你的下一首“本命曲目”以及当成惊喜的塔罗牌卡面信息。
- **内置播放器**: 时光机页面集成音乐播放器，支持试听一首精选曲目。

### 4. � 风格图谱 (Connections)
**风格探索与听觉交互**
- **风格可视化**: 将音乐风格以气泡云的形式展现，气泡大小代表收藏权重。
- **钢琴交互音效**: 当鼠标滑过或点击音乐风格标签时，会触发悦耳的钢琴音效（基于 p5.sound），让数据浏览变成一场即兴演奏。
- **关联筛选**: 点击任意风格标签，即可快速筛选出属于该流派的所有音乐作品。

### 5. 🔍 音乐搜索 (Search)
**精准定位**
- **智能检索**: 支持按艺术家或歌曲名称快速搜索。

---

## 🛠️ 技术栈

本项目采用了现代前端技术栈，融合了 3D 图形、数据可视化和流畅的动画效果。

- **核心框架**: [React 18](https://reactjs.org/)
- **路由管理**: [React Router 6](https://reactrouter.com/)
- **3D & 图形**:
  - [Three.js](https://threejs.org/)
  - [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) & [Drei](https://github.com/pmndrs/drei)
  - [p5.js](https://p5js.org/) (用于音频处理)
- **数据可视化**:
  - [D3.js](https://d3js.org/)
  - [ECharts](https://echarts.apache.org/) & [ECharts Wordcloud](https://github.com/ecomfe/echarts-wordcloud)
- **UI & 样式**:
  - [Tailwind CSS](https://tailwindcss.com/) (原子化 CSS)
  - [Styled JSX](https://github.com/vercel/styled-jsx)
- **动画**:
  - [Framer Motion](https://www.framer.com/motion/)
  - [React Spring](https://react-spring.dev/)
- **构建工具**: [Craco](https://github.com/gsoft-inc/craco) (Create React App Configuration Override)

---

## 📂 项目结构

```plaintext
src/
├── assets/           # 静态资源（图标、图片等）
├── components/       # 可复用 UI 组件
│   ├── MusicCard     # 音乐卡片组件
│   ├── MusicPlayer   # 播放器组件
│   ├── StarBackground# 星空背景组件
│   └── ...
├── hooks/            # 自定义 React Hooks (useMusicData, useIsMobile 等)
├── pages/            # 页面级组件
│   ├── HomePage      # 主页（入口与概览）
│   ├── MusicUniverse # 3D 封面宇宙漫游页（歌单中的专辑封面可视化呈现）
│   ├── ArchivePage   # 「我的音乐时光机」档案页（统计、词云、老虎机）
│   ├── ConnectionsPage # 「音乐风格」连接页（风格图谱、钢琴交互）
│   └── SearchPage    # 搜索页
├── utils/            # 工具函数 (数据转换、图像处理)
├── workers/          # Web Workers (用于处理耗时任务，如词云布局)
└── ...
```

---

## 🚀 快速开始

### 1. 克隆仓库
```bash
git clone <repository_url>
cd music-universe
```

### 2. 安装依赖
```bash
npm install
# 或者使用清理安装命令（如果遇到依赖问题）
npm run clean-install
```

### 3. 启动开发服务器
```bash
npm start
```
打开浏览器访问 [http://localhost:3012](http://localhost:3012) (端口可能根据配置有所不同)。

### 4. 构建生产版本
```bash
npm run build
```

### 5. 部署
```bash
npm run deploy
```
此命令将构建项目并推送到 `gh-pages` 分支。

---

## 📄 许可证

本项目基于 MIT 许可证开源。
