# 🎵 Music Universe | 音乐宇宙

> An immersive 3D music collection visualization project. Explore melodies in a galaxy of memories.
> 
> 一个沉浸式的 3D 音乐收藏可视化项目。在星河中漫游，发现旋律与记忆的共鸣。

![Project Banner](public/images/readme.md-websitepreview.png)

## 🌟 Introduction | 项目简介

**Music Universe** is a personal project that transforms a spreadsheet of music collection data into an interactive 3D web experience. It allows users to explore music tracks as stars in a galaxy, visualize listening habits through word clouds, and rediscover albums through a "music randomizer" interface.

**Music Universe** 是一个将个人音乐收藏数据转化为交互式 3D 网页体验的项目。它让用户像探索星系一样浏览音乐曲目，通过词云可视化听歌习惯，并通过“音乐随机选”重新发现那些珍藏的专辑。

### 🎨 Origin & Credits | 原创声明

This project is a 3-month personal exploration journey, designed and developed by **MagicCoAI** (Author of WeChat Official Account "D小调片段记录") in collaboration with AI technology.

*   **Primary AI Assistant:** TraeAI
*   **Code & Logic Support:** DeepSeek, ChatGPT, Gemini

**✨ Inspiration | 灵感致谢**

The visual concept of exploring archives in a 3D space is inspired by [Studio Olafur Eliasson: Your uncertain archive](https://olafureliasson.net/uncertain). This project interprets that concept through a personalized music universe, built with a distinct technical stack and design language.

本项目的“3D 档案漫游”交互形式受到 Olafur Eliasson 工作室网站 *Your uncertain archive* 的启发。在此基础上，我结合个人音乐数据，使用完全独立的技术栈与视觉设计语言进行了重新演绎。

While the code is open source, the design philosophy and the curated music data structure represent a significant personal investment.

本项目历时3个月，由 **MagicCoAI**（公众号「D小调片段记录」作者）与 AI 协同完成。
核心编程工具为 **TraeAI**，并在 **DeepSeek**, **ChatGPT**, **Gemini** 的协助下完成了各个复杂场景的建设。虽然代码开源，但项目的设计理念与数据结构凝聚了作者大量心血，请尊重原创。

🔗 **Live Demo:** [https://magiccoai.github.io/my-music-universe/](https://magiccoai.github.io/my-music-universe/)

## ✨ Key Features | 核心功能

*   **🌌 3D Star Map (3D 星图):** Visualizing music tracks as interactive elements in a 3D space using React Three Fiber.
*   **🎨 Atmospheric Themes (氛围主题):** Three immersive time-based themes (**Day**, **Evening**, **Night**) with multiple habitat scenes like **Cloud and Flying Dreams**, **Sunset Horizons**, **Aurora Skies**, and **Snow Mountains** to create a unique music listening environment.
    *   在音乐封面宇宙页面中设置了**白昼**、**傍晚**、**深夜**三个主题，以及**云端飞翔之梦**、**落日余晖**、**极光星空**，以及**雪山**等多个致力于营造栖息地氛围的场景。
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
*   **Analytics:** Google Analytics 4 (GA4)

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

## 📄 License & Disclaimer | 许可与免责

### License
This project is licensed under the **CC BY-NC-SA 4.0** (Attribution-NonCommercial-ShareAlike 4.0 International) License.

*   ✅ **Share:** You are free to copy and redistribute the material in any medium or format.
*   ✅ **Adapt:** You are free to remix, transform, and build upon the material.
*   ❌ **NonCommercial:** You may **NOT** use the material for commercial purposes.
*   ⚠️ **Attribution:** You must give appropriate credit, provide a link to the license, and indicate if changes were made.

本项目采用 **CC BY-NC-SA 4.0** 知识共享许可协议。您可以自由分享和演绎，但**禁止用于任何商业用途**，且必须注明原作者（MagicCoAI / D小调片段记录）。

### Disclaimer | 免责声明

*   **Music Data:** The `data.json` and playlist content serve as a personal music collection archive.
*   **Audio Assets:**
    *   **Local Previews:** Audio files hosted within this repository are short, low-quality snippets used solely for visual demonstration and UI interaction.
    *   **External Links:** Full tracks accessible via external platforms (e.g., NetEase Cloud Music) are subject to the terms and copyright policies of their respective service providers. This project does not host or distribute full copyrighted tracks.
*   **Images:** Album art belongs to the respective copyright holders.

*   **数据属性：** 本项目的歌单数据（`data.json`）为个人听歌记录，仅供分享与交流。
*   **音频资源：**
    *   **本地预览：** 仓库内托管的音频文件均为低音质短片段，仅用于 UI 交互演示。
    *   **外部链接：** 通过外部平台（如网易云音乐）播放的完整曲目，其版权遵循各平台协议。本项目不存储也不分发完整的版权音乐文件。
    *   如有侵权请联系删除。

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/magiccoai">MagiccoAI</a> & D小调片段记录</p>
  <p>2025 Music Universe</p>
</div>
