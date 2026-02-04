import os
from moviepy import *

# ================= 配置区域 =================

# 1. 视频文件路径 (请确认文件名是否正确)
SOURCE_VIDEO_PATH = r"e:\TraeAI-projects\2025\music collection memory-olafur-0927\music-universe_backup\待剪辑  2026-01-31 175951.mp4"

# 2. 背景音乐路径 (请修改为你电脑上的一首mp3文件路径，如果不需要背景音乐，设为 None)
# 示例: BGM_PATH = r"C:\Users\Music\happy_bgm.mp3"
BGM_PATH = None 

# 3. 输出文件路径
OUTPUT_PATH = "MusicUniverse_Showcase.mp4"

# 4. 关键片段剪辑表 (CRITICAL: 请根据原视频填写这里的 start 和 end 时间)
# 格式: (开始时间秒/字符串, 结束时间秒/字符串, '左下角提示文字')
# 示例: ("00:10", "00:40", "3D 沉浸漫游")
CLIPS_CONFIG = [
    # 0:00 - 0:30 [初探]
    # 请查看原视频，找到全景视角旋转的准确时间段
    ("00:00", "00:30", "3D 沉浸漫游"), 

    # 0:30 - 1:00 [变幻]
    # 找到切换到“白天”和“黄昏”的时间段
    ("00:35", "00:55", "多重天气系统"),

    # 1:00 - 1:45 [交互]
    # 找到专辑墙旋转、黑胶唱片悬停旋转的时间段
    ("01:10", "01:30", "交互式黑胶体验"),
    
    # 找到点击播放预览的时间段
    ("01:35", "01:50", "沉浸式试听"),

    # 1:45 - 2:30 [回溯]
    # 找到风格星系和时光机页面
    ("02:00", "02:15", "音乐风格星系"),
    ("02:20", "02:35", "音乐时光机"),
    ("02:40", "02:50", "精选收藏集"),
]

# ================= 脚本逻辑 =================

def create_video():
    print("正在加载视频...")
    # 加载原视频
    try:
        original_clip = VideoFileClip(SOURCE_VIDEO_PATH)
    except OSError:
        print(f"错误: 找不到文件 {SOURCE_VIDEO_PATH}")
        return

    final_clips = []
    
    # --- 1. 片头 Intro ---
    # 黑底白字
    intro_duration = 4
    
    # 创建黑色背景
    intro_bg = ColorClip(size=(1920, 1080), color=(0, 0, 0), duration=intro_duration)
    
    # 创建文字
    # 注意：为了支持中文，可能需要指定中文字体路径，如果报错乱码，请修改 font 参数
    # 尝试使用系统默认字体，或者指定类似 "SimHei" (Windows黑体)
    font_style = "SimHei" if os.name == 'nt' else "Arial"

    txt_github = TextClip(text="Github 项目", font_size=40, color='white', font=font_style, method='caption', size=(1920, 1080), text_align='center')
    txt_github = txt_github.with_position(('center', 200)).with_duration(intro_duration)

    txt_title_main = TextClip(text="My Music Universe", font_size=100, color='white', font_style='Bold', font=font_style, method='caption', size=(1920, 1080), text_align='center')
    txt_title_main = txt_title_main.with_position('center').with_duration(intro_duration)
    
    txt_title_sub = TextClip(text="我的音乐封面宇宙", font_size=60, color='gray', font=font_style, method='caption', size=(1920, 1080), text_align='center')
    txt_title_sub = txt_title_sub.with_position(('center', 650)).with_duration(intro_duration)

    txt_author = TextClip(text="AI共创 React 网站 | @D小调片段记录", font_size=30, color='white', font=font_style, method='caption', size=(1920, 1080), text_align='center')
    txt_author = txt_author.with_position(('center', 850)).with_duration(intro_duration)

    # 组合片头
    intro_clip = CompositeVideoClip([intro_bg, txt_github, txt_title_main, txt_title_sub, txt_author])
    intro_clip = intro_clip.with_effects([vfx.FadeIn(1), vfx.FadeOut(1)])
    final_clips.append(intro_clip)

    # --- 2. 正片 Body ---
    print("正在处理正片片段...")
    for start, end, label in CLIPS_CONFIG:
        # 截取片段
        sub = original_clip.subclipped(start, end)
        
        # 添加转场效果 (淡入淡出)
        sub = sub.with_effects([vfx.FadeIn(0.5), vfx.FadeOut(0.5)])
        
        # 添加左下角水印文字
        if label:
            watermark = TextClip(text=label, font_size=40, color='white', bg_color=ColorClip(color=(0,0,0)).with_opacity(0.5), font=font_style)
            watermark = watermark.with_position((50, 'bottom')).with_margin(bottom=50, opacity=0).with_duration(sub.duration)
            # 组合视频和文字
            sub = CompositeVideoClip([sub, watermark])
        
        final_clips.append(sub)

    # --- 3. 片尾 Outro ---
    outro_duration = 5
    outro_bg = ColorClip(size=(1920, 1080), color=(0, 0, 0), duration=outro_duration)
    
    txt_welcome = TextClip(text="欢迎浏览", font_size=80, color='white', font=font_style, method='caption', size=(1920, 1080), text_align='center')
    txt_welcome = txt_welcome.with_position(('center', 300)).with_duration(outro_duration)
    
    txt_url = TextClip(text="https://magiccoai.github.io/my-music-universe/", font_size=40, color='#4a9eff', font=font_style, method='caption', size=(1920, 1080), text_align='center')
    txt_url = txt_url.with_position(('center', 500)).with_duration(outro_duration)

    outro_clip = CompositeVideoClip([outro_bg, txt_welcome, txt_url])
    outro_clip = outro_clip.with_effects([vfx.FadeIn(1)])
    final_clips.append(outro_clip)

    # --- 4. 合成 ---
    print("正在合成最终视频...")
    final_video = concatenate_videoclips(final_clips, method="compose")

    # --- 5. 处理音频 ---
    if BGM_PATH and os.path.exists(BGM_PATH):
        print("正在添加背景音乐...")
        bgm = AudioFileClip(BGM_PATH)
        # 循环播放 BGM 直到视频结束
        bgm = afx.audio_loop(bgm, duration=final_video.duration)
        # 降低音量
        bgm = bgm.with_volume_scaled(0.3)
        
        # 简单的闪避处理 (这里简单地混合，高级闪避需要分析原声波形)
        # 如果原视频有声音，我们保留它
        original_audio = final_video.audio
        if original_audio:
             final_audio = CompositeAudioClip([bgm, original_audio])
        else:
             final_audio = bgm
             
        final_video = final_video.with_audio(final_audio)

    # --- 6. 导出 ---
    print(f"正在导出到 {OUTPUT_PATH} ... (这可能需要几分钟)")
    # 使用 ultrafast 预设加快渲染速度，但在正式版可以使用 medium
    final_video.write_videofile(OUTPUT_PATH, fps=30, preset='ultrafast', codec='libx264', audio_codec='aac')
    print("完成！")

if __name__ == "__main__":
    create_video()
