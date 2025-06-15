# Foundry YouTube Player
<div align="center">
  <img src="https://img.shields.io/github/downloads/dinoapicella/youtube-sync/total?color=2b82fc&label=Downloads&style=for-the-badge" alt="Total Downloads">
  <img src="https://img.shields.io/github/v/release/dinoapicella/youtube-sync?color=2b82fc&label=Latest%20Release&style=for-the-badge" alt="Latest Release">
  <a href="https://ko-fi.com/dinoapicella">
    <img src="https://img.shields.io/badge/Ko--fi-Support%20Development-%23FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Support on Ko-fi">
  </a>
</div>

## 📋 Overview

A simple Foundry VTT module that allows you to play YouTube videos directly in your game by simply pasting the URL into an input popup. The videos are synchronized for all players in the game.

> **Developer's Note:** This module is functional but aesthetically basic. Updates will be infrequent or non-existent due to time constraints between work and personal life. I created this primarily to share a practical solution with the Foundry community that has helped me in my own games.

<p align="center"> <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTBscGRlbTBqbDNjbjI4dDh2czdpMnh3bDFuaXVucG1yODFwdnUycCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cjLqH1e9JRQBxcQitL/giphy.gif" width="800" alt="Example Demo"> </p>

---

## ✨ Features

- ▶️ Play YouTube videos by simply pasting a URL
- 🔄 Full synchronization between all connected players
- 🎮 GM has complete control over:
  - Play/Pause/Stop
  - Volume adjustment
  - Video progression
- 🌐 All controls are applied to every player's video simultaneously
- ❌ Players can close the popup if desired and pause the video if they click on it(known bugs, to be fixed)

---

## 🚀 Installation

1. In the Foundry VTT setup screen, go to the "Add-on Modules" tab
2. Click "Install Module"
3. Search for "Foundry YouTube Player" or paste this URL:
   ```
   https://raw.githubusercontent.com/dinoapicella/youtube-sync/refs/tags/1.0.1/module.json
   ```
4. Click "Install"

---

## 📖 Usage Instructions

| Step | Description |
|------|-------------|
| 1️⃣ | Paste a YouTube URL in the input popup |
| 2️⃣ | Use the control bar below the video for play, pause, stop, and volume control |
| 3️⃣ | Only use YouTube's native controls when you need to select a specific video segment |

---

## ⚠️ Known Issues

- Players can currently pause the video from their end (this is a bug that will be addressed in a future update)
- The interface is functional but not aesthetically polished
- Some controls might be a bit cumbersome to use
- If a user login when the youtube widget is running they dont see it. The GM MUST restart it
- With multiple GMs, some methods are called multiple times, and the video audio tries to sync multiple times, resulting in a choppy and unclear experience.

---

## 🚫 YouTube Playback Restrictions

> **Important:** Not all YouTube videos can be played on all clients due to YouTube's embedding restrictions. Some videos may show "Error 150" or other playback issues for some players while working fine for others.

This is due to YouTube's content restrictions and embedding policies, which vary by:
- Geographic region
- Video creator's settings
- Content licensing

Unfortunately, there is **no workaround** for these YouTube restrictions. If a video doesn't play for some players, the only solution is to try a different video. This is not an issue with the module itself but with YouTube's platform policies.

Additionally, the player cannot be resized due to YouTube's policies, which require the video to always remain in the foreground, unless someone changes the window size in the inspect tool, but I take no responsibility for that.

---

## 💡 Recommendations

### For Players:
- Focus on your game without worrying about video controls
- If you experience Error 150, let your GM know so they can try another video

### For GMs:
- Use the custom control bar below the video instead of YouTube's native controls
- Test videos before important sessions to ensure they work for all players
- Keep alternative videos ready in case of playback issues

---

## 🛠️ Compatibility

| Foundry Version | Module Version | Compatible |
|-----------------|----------------|------------|
| V13             | v1.0.1         | ✅          |
| V12             | v1.0.0/v1.0.1         | ✅          |
| V11              | v1.0.0         | ❓ (untested) |
| V10              | v1.0.0         | ❓ (untested) |

---

## 🤝 Support and Contributions

If you like this module and would like to support my work, you can:

- [Buy me a coffee on Ko-fi](https://ko-fi.com/dinoapicella)☕
- Suggest new features or improvements
- Report any bugs you encounter

Feel free to reach out with ideas for new modules or functionality that might help the Foundry community. While I can't promise quick updates due to time constraints, I appreciate all feedback and suggestions.

---

## 📄 License

[MIT License](LICENSE)

---

<div align="center">
  <p><i>Foundry YouTube Player is created by dinoapicella</i></p>
  <p>⭐ Star this repo if you found it useful! ⭐</p>
</div>
