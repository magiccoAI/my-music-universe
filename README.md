# 🎵 Music Universe | 音乐宇宙

> An immersive 3D music collection visualization project. Explore melodies in a galaxy of memories.
> 
> 一个沉浸式的 3D 音乐收藏可视化项目。在星河中漫游，发现旋律与记忆的共鸣。

![Project Banner](public/images/musicstyle-cloud2.webp)

## 🌟 Introduction | 项目简介

**Music Universe** is a personal project that transforms a spreadsheet of music collection data into an interactive 3D web experience. It allows users to explore music tracks as stars in a galaxy, visualize listening habits through word clouds, and rediscover albums through a "music randomizer" interface.

**Music Universe** 是一个将个人音乐收藏数据转化为交互式 3D 网页体验的项目。它让用户像探索星系一样浏览音乐曲目，通过词云可视化听歌习惯，并通过“音乐随机选”重新发现那些珍藏的专辑。

🔗 **Live Demo:** [https://magiccoai.github.io/my-music-universe/](https://magiccoai.github.io/my-music-universe/)

## ✨ Key Features | 核心功能

*   **🌌 3D Star Map (3D 星图):** Visualizing music tracks as interactive elements in a 3D space using React Three Fiber.
*   **🎨 Atmospheric Themes (氛围主题):** Three immersive time-based themes (**Day**, **Evening**, **Night**) with multiple habitat scenes like **Snow Mountains**, **Aurora Skies**, and **Sunset Horizons** to create a unique music listening environment.
    *   在音乐封面宇宙页面中设置了**白昼**、**傍晚**、**深夜**三个主题，以及**日照金山**、**极光星空**、**落日余晖**等多个致力于营造栖息地氛围的场景。
*   **☁️ Word Cloud Galaxy (词云星系):** Dynamic word clouds showing the distribution of artists and music styles.
*   **💫 Special Collection (特别收藏):** A curated, carousel-style showcase of memorable albums with detailed stories.
*   **🎰 Music Randomizer (音乐随机选):** A fun, randomized way to pick an album to listen to.
*   **📱 Responsive Design (响应式设计):** Optimized for both desktop and mobile experiences, with specific mobile orientation hints.
*   **🎧 Immersive Audio (沉浸式音频):** Integrated music player with audio previews.

## 🛠️ Tech Stack | 技术栈

*   **Core:** React 18, React Router 6
*   **3D & Graphics:** Three.js, React Three Fiber (@react-three/fiber), @react-three/drei
*   **Animation:** Framer Motion, React Spring
*   **Visualization:** D3.js, ECharts (echarts-wordcloud)
*   **Styling:** Tailwind CSS, Styled-jsx
*   **Build Tool:** Create React App (via Craco)
*   **Deployment:** GitHub Pages (Automated via GitHub Actions)
*   **Analytics:** Google Analytics 4 (GA4), Microsoft Clarity

## 🚀 Getting Started | 快速开始

### Prerequisites | 前置要求
*   Node.js (v16+)
*   npm or yarn

### Installation | 安装

1.  **Clone the repository | 克隆仓库**
    ```bash
    git clone https://github.com/magiccoai/my-music-universe.git
    cd my-music-universe
    ```

2.  **Install dependencies | 安装依赖**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start development server | 启动开发服务器**
    ```bash
    npm start
    ```
    The app will open at `http://localhost:3012`.

## 📦 Building & Deployment | 构建与部署

This project uses **GitHub Actions** for automated deployment to GitHub Pages.

### Build Command | 构建命令
```bash
npm run build
```

### Deployment | 部署
The deployment is handled automatically when pushing to the `main` branch via the `.github/workflows/deploy.yml` workflow.

To manually deploy (if configured):
```bash
npm run deploy
```

## 📝 Configuration | 配置

*   **Music Data:** The core data is stored in `public/data/`.
*   **Assets:** Audio and images are located in `public/audio/` and `public/images/`.
*   **Environment:** Configuration for ports and build options can be found in `package.json` and `craco.config.js`.

## 🤝 Contributing | 贡献

Contributions, issues, and feature requests are welcome!
欢迎提交 Issue 和 Pull Request！

## 📄 License | 许可

This project is for personal learning and showcase purposes. All music cover arts and audio snippets belong to their respective copyright holders.

本项目仅作为个人展示与技术探索。所有专辑封面及音频片段版权归原作者所有。

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/magiccoai">MagicCoAI</a> & D小调片段记录</p>
  <p>2025 Music Universe</p>
</div>
