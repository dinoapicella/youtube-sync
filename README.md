# YouTube Sync
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


<p align="center">
  <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExczFqYTlyN2x0ZnNwY2lrMzE4aWJsenVhb3NuOHFyNjg5b2Z1d3g2OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PYVVOGU6w8AU8pnVfA/giphy.gif" width="800" alt="Example Demo">
</p>

## ✨ Features

- ▶️ Play YouTube videos by simply pasting a URL
- ▶️ Listen directly to your personal playlists created by you on YouTube.
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
3. Search for "YouTube Sync" or paste this URL:
   ```
   https://raw.githubusercontent.com/dinoapicella/youtube-sync/refs/tags/1.0.2/module.json
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

## 🎵 Playlist Usage Guide

Using playlists can make it easier to organize and play music or ambient soundtracks for your sessions — but there are some important details to keep in mind.

### ✅ Supported Playlists
You can use:
- **Public playlists** that already exist on YouTube  
  *(e.g., “Epic Battle Music”, “Tavern Ambience”, etc.)*
- **Your own playlists** that **you’ve created and set as Public**

Just copy the **URL of a video that is part of that playlist**, and paste it into the input popup — the module will recognize and use the playlist automatically.

### ⚠️ Unsupported Playlists (YouTube Mixes)
Do **not** use **YouTube Mixes**.  
These are automatically generated playlists (you’ll see the word *Mix* in the title) that YouTube creates dynamically for each user.  
Because they are generated on the fly:
- Each player might receive a **different list of videos**
- Syncing will **break** between the GM and players

**Example:** The GM might hear “Song A” while a player hears “Song B” because YouTube personalized their Mix differently.

### 💡 Tips
- Always **create your own public playlist** for consistent playback  
- Test your playlist before the session to make sure all videos are playable and embeddable  
- Avoid private or unlisted playlists (YouTube may block playback in embeds)

---

## ⚠️ Known Issues

- Players can currently pause the video from their end
- Players can change the video when is in a Playlist.  Tell them:  "Don't  touch it ^_^"
- For playlist pay attention: If you use a video in a mix (Mixes are playlists that YouTube creates for you) then your players will include other videos when you try to change videos. This happens because YouTube generates them automatically. Remember, you need to create your own public playlist.
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
- Focus on your game without worrying about any video controls ( incluse the playlist button )
- If you experience Error 150, let your GM know so they can try another video

### For GMs:
- Use the custom control bar below the video instead of YouTube's native controls
- Test videos before important sessions to ensure they work for all players
- Keep alternative videos ready in case of playback issues
- For Playlist REMEMBER, save your playlist PUBLIC on Youtube and then pick up a video from there and paste into Youtube Sync

---

## 🛠️ Compatibility

| Foundry Version | Module Version | Compatible |
|-----------------|----------------|------------|
| V13             | v1.0.1/v1.0.2         | ✅          |
| V12             | v1.0.0/v1.0.1/v1.0.2         | ✅          |
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
