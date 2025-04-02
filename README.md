# Foundry Simple YouTube Player

## 📋 Overview

A simple Foundry VTT module that allows you to play YouTube videos directly in your game by simply pasting the URL into an input popup. The videos are synchronized for all players in the game.

> **Developer's Note:** This module is functional but aesthetically basic. Updates will be infrequent or non-existent due to time constraints between work and personal life. I created this primarily to share a practical solution with the Foundry community that has helped me in my own games.

---

## ✨ Features

- ▶️ Play YouTube videos by simply pasting a URL
- 🔄 Full synchronization between all connected players
- 🎮 GM has complete control over:
  - Play/Pause/Stop
  - Volume adjustment
  - Video progression
- 🌐 All controls are applied to every player's video simultaneously
- 🔽 Players can minimize the video window by double-clicking on the top bar
- ❌ Players can close the popup if desired and pause the video if they click on it(known bugs, to be fixed)

---

## 🚀 Installation

1. In the Foundry VTT setup screen, go to the "Add-on Modules" tab
2. Click "Install Module"
3. Search for "Foundry YouTube Player" or paste this URL:
   ```
   https://raw.githubusercontent.com/dinoapicella/youtube-sync/refs/tags/1.0.0/module.json
   ```
4. Click "Install"

---

## 📖 Usage Instructions

| Step | Description |
|------|-------------|
| 1️⃣ | Paste a YouTube URL in the input popup |
| 2️⃣ | Use the control bar below the video for play, pause, stop, and volume control |
| 3️⃣ | Only use YouTube's native controls when you need to select a specific video segment |
| 4️⃣ | Players should minimize the window by double-clicking the top bar |

---

## ⚠️ Known Issues

- Players can currently pause the video from their end (this is a bug that will be addressed in a future update)
- The interface is functional but not aesthetically polished
- Some controls might be a bit cumbersome to use

---

## 🚫 YouTube Playback Restrictions

> **Important:** Not all YouTube videos can be played on all clients due to YouTube's embedding restrictions. Some videos may show "Error 150" or other playback issues for some players while working fine for others.

This is due to YouTube's content restrictions and embedding policies, which vary by:
- Geographic region
- Video creator's settings
- Content licensing

Unfortunately, there is **no workaround** for these YouTube restrictions. If a video doesn't play for some players, the only solution is to try a different video. This is not an issue with the module itself but with YouTube's platform policies.

---

## 💡 Recommendations

### For Players:
- **Double-click the top bar** to minimize the video window
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
| V12             | v1.0.0         | ✅          |
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
