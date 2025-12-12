import React from 'react';

export const aboutContent = {
  zh: {
    title: "INCOMING SIGNAL: ORIGIN STORY",
    intro: (
      <>
        这个网站，是我为自己打造的<span className="text-sky-200 font-semibold">“音乐记忆合集宇宙”</span>。它暂时没有集成全面的播放资源，只是从一份基础的音乐数据表格（ <code className="bg-black/40 px-1 py-0.5 rounded text-sky-400 font-mono">data.json</code> ）延伸出来的星图，但对我而言，它是一个外部记忆体——帮助我在看到封面的瞬间，重新提取当时的旋律、心境与感受。
      </>
    ),
    quote: "在公众号 2022–2023 的推文尾声，我分享了一些歌。把那些零散片段收拢到同一个入口，记录的意义就被再次点亮：当你按下播放键（或只是停留在封面上），一系列声波与触感的体验就有机会被启动。",
    techP1: (
      <>
        我一直对可视化感兴趣：像《黑客帝国》的数据流、维基百科的关系图、各种创意交互。于是我用 <span className="text-sky-300 font-mono">React</span> 和 <span className="text-purple-300 font-mono">TraeAI</span> 及多种大语言模型，一点点摸索，把这份歌单做成一个可视化空间。
      </>
    ),
    techP2: (
      <>
        未来它或许会迁移发展成更多与我生命相关的东西，但在此刻，它只想温柔地提醒我：这些歌，曾经陪伴我，也仍在陪伴我。这是我作为一位非专业开发者的持续实践，也是一段与工具共创的旅程；每一次迭代，都是在把<span className="text-white font-bold">“听过什么歌”</span>变成<span className="text-sky-300 font-bold">“看见我的故事”</span>。
      </>
    ),
    techP3: (
      <>
        也愿这里成为一个温暖的连接点——在<span className="text-sky-200 font-semibold">音乐的无界时空</span>中，愿你的每一次浏览，都能听到遥远的共鸣。
      </>
    ),
    imageCaption1: "STEP 1: RAW DATA COLLECTION",
    imageCaption2: "STEP 2: STRUCTURED JSON DATA"
  },
  en: {
    title: "INCOMING SIGNAL: ORIGIN STORY",
    intro: (
      <>
        This digital expanse is my personal <span className="text-sky-200 font-semibold">"Cosmos of Musical Memories."</span> It is not merely a player, but a star map born from a humble spreadsheet (<code className="bg-black/40 px-1 py-0.5 rounded text-sky-400 font-mono">data.json</code>). To me, it serves as an external memory bank—one where a single glance at an album cover instantly retrieves the melodies, moods, and emotions of days past.
      </>
    ),
    quote: "From 2022 to 2023, I shared musical fragments at the end of my blog posts. Gathering these scattered pieces here reignites the purpose of documentation: whether you press play or simply gaze upon a cover, a symphony of sonic and emotional experiences is reawakened.",
    techP1: (
      <>
        I have always been captivated by the art of visualization—from the digital rain of <em>The Matrix</em> to the knowledge webs of Wikipedia. Guided by this fascination, I utilized <span className="text-sky-300 font-mono">React</span>, <span className="text-purple-300 font-mono">TraeAI</span>, and various LLMs to meticulously sculpt this playlist into an immersive visual dimension.
      </>
    ),
    techP2: (
      <>
        While this universe may evolve to hold more of my life's data, for now, it stands as a gentle testament: these songs have been, and remain, my constant companions. This is the ongoing journey of an amateur developer co-creating with AI—where every iteration transforms <span className="text-white font-bold">"what I heard"</span> into <span className="text-sky-300 font-bold">"seeing my story."</span>
      </>
    ),
    techP3: (
      <>
        May this space also become a <span className="text-sky-200 font-semibold">sanctuary of shared resonance</span>—in this boundless musical spacetime, may your every visit find a distant echo.
      </>
    ),
    imageCaption1: "STEP 1: RAW DATA COLLECTION",
    imageCaption2: "STEP 2: STRUCTURED JSON DATA"
  }
};
