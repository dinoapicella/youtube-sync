// scripts/youtube-sync.js
class YouTubeSync {
  static ID = 'youtube-sync';
  static SOCKET_NAME = 'module.youtube-sync';
  static TEMPLATES = {
    youtubePlayer: `modules/${this.ID}/templates/youtube-player.html`
  };
  
  static initialize() {
    console.log(`${this.ID} | Initialize`);
    
    this.registerSettings();
    this.hookIntoFoundry();
    this.registerHandlebarsTemplates();
    this.setupSocket();
  }
  
  static registerSettings() {
    game.settings.register(this.ID, 'minimizedState', {
      name: 'Stato minimizzato',
      scope: 'client',
      config: false,
      type: Boolean,
      default: false
    });

    game.settings.register(this.ID, 'bgColorPrimary', {
      name: game.i18n.localize('youtube-sync.bgColorPrimary.name'),
      hint: game.i18n.localize('youtube-sync.bgColorPrimary.hint'),
      scope: 'client',
      config: true,
      type: String,
      default: '#667eea'
    });

    game.settings.register(this.ID, 'bgColorSecondary', {
      name: game.i18n.localize('youtube-sync.bgColorSecondary.name'),
      hint: game.i18n.localize('youtube-sync.bgColorSecondary.hint'),
      scope: 'client',
      config: true,
      type: String,
      default: '#764ba2'
    });

    game.settings.register(this.ID, 'textColor', {
      name: game.i18n.localize('youtube-sync.textColor.name'),
      hint: game.i18n.localize('youtube-sync.textColor.hint'),
      scope: 'client',
      config: true,
      type: String,
      default: '#ffffff'
    });

    game.settings.register(this.ID, 'accentColor', {
      name: game.i18n.localize('youtube-sync.accentColor.name'),
      hint: game.i18n.localize('youtube-sync.accentColor.hint'),
      scope: 'client',
      config: true,
      type: String,
      default: '#FF6B6B'
    });

    game.settings.register(this.ID, 'lastVolume', {
      name: 'Last Volume',
      scope: 'client',
      config: false,
      type: Number,
      default: 100
    });

    game.settings.register(this.ID, 'rememberVolume', {
      name: game.i18n.localize('youtube-sync.rememberVolume.name'),
      hint: game.i18n.localize('youtube-sync.rememberVolume.hint'),
      scope: 'client',
      config: true,
      type: Boolean,
      default: true
    });
  }
  
  static hookIntoFoundry() {
    Hooks.on('getSceneControlButtons', (controls) => {
      if (game?.version?.startsWith('13')) {
        if (game.user.isGM && controls?.tokens?.tools) {
          controls.tokens.tools.youtube = { 
            name:'youtube',
            title:'YouTube Sync',
            icon:'fa-solid fa-play',
            visible: true,
            onClick: () => this.openYouTubeDialog(), 
            button: true
          };
        }
      } else {
        if (game.user.isGM) {
          const tokenTools = controls.find(c => c.name === 'token');
          if (tokenTools) {
            tokenTools.tools.push({
              name: 'youtube',
              title: 'YouTube Sync',
              icon: 'fab fa-youtube',
              visible: true,
              onClick: () => this.openYouTubeDialog(),
              button: true
            });
          }
        } 
      }
    });
    
    Hooks.on('ready', () => {
      this._loadYouTubeAPI();
    });
  }
  
  static _loadYouTubeAPI() {
    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.youtubeAPIReady = new Promise((resolve) => {
        window.onYouTubeIframeAPIReady = () => {
          console.log(`${this.ID} | YouTube API Ready`);
          resolve();
        };
      });
    } else if (!window.youtubeAPIReady) {
      window.youtubeAPIReady = Promise.resolve();
    }
    
    return window.youtubeAPIReady;
  }
  
  static registerHandlebarsTemplates() {
    loadTemplates([this.TEMPLATES.youtubePlayer]);
  }
  
  static setupSocket() {
    game.socket.on(this.SOCKET_NAME, (data) => {
      console.log(`${this.ID} | Socket received:`, data);
      if (data.type === 'playVideo') {
        this.handlePlayVideo(data);
      } else if (data.type === 'pauseVideo') {
        this.handlePauseVideo();
      } else if (data.type === 'seekVideo') {
        this.handleSeekVideo(data.time);
      } else if (data.type === 'closeVideo') {
        this.handleCloseVideo();
      } else if (data.type === 'volumeChange') {
        this.handleVolumeChange(data.volume);
      } else if (data.type === 'playlistVideoChange') {
        this.handlePlaylistVideoChange(data);
      }
    });
  }
  
  static openYouTubeDialog() {
    const bgPrimary = game.settings.get(this.ID, 'bgColorPrimary');
    const bgSecondary = game.settings.get(this.ID, 'bgColorSecondary');
    const textColor = game.settings.get(this.ID, 'textColor');
    const accentColor = game.settings.get(this.ID, 'accentColor');

    new Dialog({
      title: '🎬 YouTube Sync Player',
      content: `
        <form class="youtube-url-form">
          <div class="form-group">
            <label class="elegant-label">
              <i class="fab fa-youtube youtube-pulse"></i>
              YouTube URL
            </label>
            <div class="youtube-url-input-wrapper">
              <input type="text" name="youtubeUrl" placeholder="${game.i18n.localize('youtube-sync.dialog.placeholder')}"
              class="elegant-input">
              <div class="input-glow"></div>
            </div>
          </div>
          
          <div class="support-section">
            <div class="heart-beat">❤️</div>
            <span>${game.i18n.localize('youtube-sync.dialog.love.question')}</span>
            <a href="https://ko-fi.com/dinoapicella" target="_blank" class="kofi-link">
              <i class="fas fa-coffee coffee-bounce"></i>
              ${game.i18n.localize('youtube-sync.dialog.love.linkKOFI')}
            </a>
          </div>
        </form>
        
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px ${accentColor}80; }
            50% { box-shadow: 0 0 20px ${accentColor}CC, 0 0 30px ${accentColor}99; }
          }
          
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.2); }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-5px); }
            60% { transform: translateY(-3px); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          
          .youtube-url-form {
            padding: 25px;
            border-radius: 15px;
            background: linear-gradient(135deg, ${bgPrimary} 0%, ${bgSecondary} 100%);
            position: relative;
            overflow: hidden;
            animation: slideIn 0.5s ease-out;
          }
          
          .youtube-url-form::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 2s infinite;
          }
          
          .elegant-label {
            display: flex;
            align-items: center;
            gap: 10px;
            color: ${textColor};
            font-weight: 600;
            font-size: 1.1em;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          
          .youtube-pulse {
            color: #FF0000;
            animation: pulse 2s infinite;
            filter: drop-shadow(0 0 5px rgba(255,0,0,0.5));
          }
          
          .youtube-url-input-wrapper {
            position: relative;
            margin-bottom: 20px;
          }
          
          .elegant-input {
            width: 100%;
            padding: 15px 20px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 25px;
            background: rgba(255,255,255,0.9);
            backdrop-filter: blur(10px);
            font-size: 1em;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            box-sizing: border-box;
          }
          
          .elegant-input:focus {
            outline: none;
            border-color: ${accentColor};
            background: rgba(255,255,255,0.95);
            transform: translateY(-2px);
            animation: glow 2s infinite;
          }
          
          .elegant-input::placeholder {
            color: #666;
            font-style: italic;
          }
          
          .input-glow {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 25px;
            background: linear-gradient(45deg, ${accentColor}, ${accentColor}AA);
            opacity: 0;
            z-index: -1;
            transition: opacity 0.3s ease;
          }
          
          .elegant-input:focus + .input-glow {
            opacity: 0.2;
          }
          
          .support-section {
            text-align: center;
            color: ${textColor};
            font-size: 0.9em;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            flex-wrap: wrap;
            background: rgba(255,255,255,0.1);
            padding: 12px;
            border-radius: 10px;
            backdrop-filter: blur(5px);
          }
          
          .heart-beat {
            animation: heartbeat 1.5s infinite;
            font-size: 1.2em;
          }
          
          .kofi-link {
            color: #FFD700;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .kofi-link:hover {
            color: #FFA500;
            transform: translateY(-2px);
            text-shadow: 0 4px 8px rgba(255,215,0,0.4);
          }
          
          .coffee-bounce {
            animation: bounce 2s infinite;
          }

          /* Stile bottoni migliorato */
          .dialog-button {
            padding: 12px 30px !important;
            border-radius: 30px !important;
            font-weight: 600 !important;
            font-size: 1em !important;
            border: none !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
          }

          .dialog-button.yes {
            background: linear-gradient(135deg, #4CAF50, #45a049) !important;
            color: white !important;
          }

          .dialog-button.yes:hover {
            background: linear-gradient(135deg, #45a049, #3d8b40) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4) !important;
          }

          .dialog-button.no {
            background: linear-gradient(135deg, #f44336, #da190b) !important;
            color: white !important;
          }

          .dialog-button.no:hover {
            background: linear-gradient(135deg, #da190b, #c41700) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4) !important;
          }

          .dialog-button:active {
            transform: translateY(0) scale(0.98) !important;
          }

          .dialog-buttons {
            display: flex !important;
            gap: 15px !important;
            justify-content: center !important;
            padding-top: 10px !important;
          }
        </style>
      `,
      buttons: {
        play: {
          icon: '<i class="fas fa-play"></i>',
          label: game.i18n.localize('youtube-sync.dialog.playButton'),
          callback: async (html) => {
            const url = html.find('input[name="youtubeUrl"]').val();
            const result = this.extractVideoId(url);
            if (result) {
              if (result.type === 'playlist') {
                if (!result.videoId) {
                  ui.notifications.info("Caricamento playlist...");
                  this.createPlayerWindow(null, result.id);
                  this.broadcastVideo(null, result.id);
                } else {
                  this.createPlayerWindow(result.videoId, result.id);
                  this.broadcastVideo(result.videoId, result.id);
                }
              } else {
                this.createPlayerWindow(result.id);
                this.broadcastVideo(result.id);
              }
            } else {
              ui.notifications.error(game.i18n.localize('youtube-sync.errors.invalidUrl'));
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('youtube-sync.dialog.cancelButton')
        }
      },
      default: 'play',
      render: (html) => {
        // Applica le classi ai bottoni
        html.find('button[data-button="play"]').addClass('dialog-button yes');
        html.find('button[data-button="cancel"]').addClass('dialog-button no');
        
        setTimeout(() => {
          html.find('input[name="youtubeUrl"]').focus();
        }, 100);
      }
    }).render(true);
  }
  
  static extractVideoId(url) {
    const playlistMatch = url.match(/[?&]list=([^#\&\?]+)/);
    if (playlistMatch) {
      const videoMatch = url.match(/[?&]v=([^#\&\?]{11})/);
      return { 
        type: 'playlist', 
        id: playlistMatch[1],
        videoId: videoMatch ? videoMatch[1] : null
      };
    }
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return { type: 'video', id: match[2] };
    }
    
    return null;
  }
  
  static broadcastVideo(videoId, playlistId = null) {
    console.log(`${this.ID} | Broadcasting video: ${videoId}, playlist: ${playlistId}`);
    game.socket.emit(this.SOCKET_NAME, {
      type: 'playVideo',
      videoId: videoId,
      playlistId: playlistId
    });
  }
  
  static createPlayerWindow(videoId = null, playlistId = null) {
    if (!videoId && !playlistId) return;
    
    const existingApp = Object.values(ui.windows).find(w => w.options.id === 'youtube-player-window');
    
    if (existingApp) {
      existingApp.updateVideo(videoId, playlistId);
      existingApp.render(true);
    } else {
      const app = new YouTubePlayerApp(videoId, playlistId);
      app.render(true);
    }
  }
  
  static handlePlayVideo(data) {
    console.log(`${this.ID} | Handling play video:`, data);
    this.createPlayerWindow(data.videoId, data.playlistId);
  }
  
  static handlePauseVideo() {
    const existingApp = Object.values(ui.windows).find(w => w.options.id === 'youtube-player-window');
    if (existingApp && existingApp.player) {
      existingApp.player.pauseVideo();
    }
  }
  
  static handleSeekVideo(time) {
    const existingApp = Object.values(ui.windows).find(w => w.options.id === 'youtube-player-window');
    if (existingApp && existingApp.player) {
      existingApp.player.seekTo(time, true);
      existingApp.player.playVideo();
    }
  }
  
  static handleCloseVideo() {
    const existingApp = Object.values(ui.windows).find(w => w.options.id === 'youtube-player-window');
    if (existingApp && existingApp.player) {
      existingApp.player.destroy();
      existingApp.close();
    }
  }
  
  static handleVolumeChange(volume) {
    const existingApp = Object.values(ui.windows).find(w => w.options.id === 'youtube-player-window');
    if (existingApp && existingApp.player) {
      existingApp.player.setVolume(volume);
    }
  }

  static handlePlaylistVideoChange(data) {
    const existingApp = Object.values(ui.windows).find(w => w.options.id === 'youtube-player-window');
    if (existingApp && existingApp.player) {
      existingApp.playVideoFromPlaylist(data.index);
    }
  }
}

class YouTubePlayerApp extends Application {
  constructor(videoId = null, playlistId = null) {
    super();
    this.videoId = videoId;
    this.playlistId = playlistId;
    this.player = null;
    this.apiReady = false;
    this.currentVolume = game.settings.get(YouTubeSync.ID, 'rememberVolume') 
      ? game.settings.get(YouTubeSync.ID, 'lastVolume') 
      : 100;
    this.isMinimized = true;
    this.videoTitle = "";
    this.videoThumbnail = "";
    this.playlistVideos = [];
    this.currentPlaylistIndex = 0;
    this.playlistPanelOpen = false;
    this.needsVideoIdFromPlaylist = !videoId && playlistId;
  }

  static get defaultOptions() {
    const minHeight = 180;
    const minWidth = Math.ceil(minHeight * (16/9));
    const gmExtraHeight = 60;
    const gmExtraSize = 80;
    
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'youtube-player-window', 
      title: '🎬 YouTube Sync',
      template: YouTubeSync.TEMPLATES.youtubePlayer,
      width: minWidth + gmExtraSize,
      height: minHeight + gmExtraHeight + gmExtraSize,
      resizable: false,
      popOut: true,
      minimizable: false,
      classes: ['youtube-sync-window', 'elegant-window'],
      closeOnDblClick: false
    });
  }
  
  getData(options={}) {
    return {
      videoId: this.videoId,
      playlistId: this.playlistId,
      volume: this.currentVolume,
      isGM: game.user.isGM,
      isMinimized: this.isMinimized,
      videoTitle: this.videoTitle,
      videoThumbnail: this.videoThumbnail,
      hasPlaylist: this.playlistId || this.playlistVideos.length > 0,
      playlistVideos: this.playlistVideos,
      currentPlaylistIndex: this.currentPlaylistIndex,
      playlistPanelOpen: this.playlistPanelOpen
    };
  }
  
  updateVideo(videoId, playlistId = null) {
    this.videoId = videoId;
    this.playlistId = playlistId;
    this.needsVideoIdFromPlaylist = !videoId && playlistId;
    
    if (this.player && this.apiReady) {
      if (playlistId) {
        this.player.loadPlaylist({
          list: playlistId,
          listType: 'playlist'
        });
        this.loadPlaylistInfo(playlistId);
      } else if (videoId) {
        this.player.loadVideoById(videoId);
        this.fetchVideoInfo(videoId);
      }
    } else {
      this.render();
    }
  }
  
  fetchVideoInfo(videoId) {
    setTimeout(() => {
      if (this.player && this.player.getVideoData) {
        try {
          const data = this.player.getVideoData();
          this.videoTitle = data.title || "YouTube video";
          this.element.find('.window-title').text('🎬 ' + this.videoTitle);
        } catch (e) {
          console.warn("fetchvideoinfo error :", e);
        }
      }
    }, 1000);
    
    this.videoThumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  async loadPlaylistInfo(playlistId) {
    try {
      if (this.player && this.player.getPlaylist) {
        setTimeout(() => {
          const playlist = this.player.getPlaylist();
          if (playlist && playlist.length > 0) {
            this.playlistVideos = playlist.map((vid, index) => ({
              id: vid,
              index: index,
              title: `Video ${index + 1}`
            }));
            this.fetchPlaylistTitles();
          }
        }, 1500);
      }
    } catch (e) {
      console.warn("loadPlaylistInfo error:", e);
    }
  }

  fetchPlaylistTitles() {
    this.playlistVideos.forEach((video, index) => {
      setTimeout(() => {
        if (this.player && this.player.getPlaylistIndex && this.player.getPlaylistIndex() === index) {
          const data = this.player.getVideoData();
          if (data && data.title) {
            this.playlistVideos[index].title = data.title;
            this.updatePlaylistUI();
          }
        }
      }, index * 500);
    });
  }

  updatePlaylistUI() {
    if (!this.element) return;
    
    const playlistContainer = this.element.find('.playlist-videos');
    if (playlistContainer.length === 0) return;
    
    playlistContainer.empty();
    
    this.playlistVideos.forEach((video, index) => {
      const isActive = index === this.currentPlaylistIndex;
      const videoItem = $(`
        <div class="playlist-video-item ${isActive ? 'active' : ''}" data-index="${index}" draggable="true">
          <span class="playlist-number">${index + 1}</span>
          <span class="playlist-title">${video.title}</span>
          ${game.user.isGM ? '<i class="fas fa-grip-vertical drag-handle"></i>' : ''}
        </div>
      `);
      playlistContainer.append(videoItem);
    });
    
    if (game.user.isGM) {
      this.setupPlaylistDragDrop();
    }
  }

  playVideoFromPlaylist(index) {
    if (!this.player || !this.playlistVideos[index]) return;
    
    this.currentPlaylistIndex = index;
    this.player.playVideoAt(index);
    this.updatePlaylistUI();
  }

  setupPlaylistDragDrop() {
    const items = this.element.find('.playlist-video-item');
    let draggedIndex = null;
    
    items.on('dragstart', (e) => {
      draggedIndex = parseInt(e.currentTarget.dataset.index);
      e.currentTarget.style.opacity = '0.5';
    });
    
    items.on('dragend', (e) => {
      e.currentTarget.style.opacity = '1';
    });
    
    items.on('dragover', (e) => {
      e.preventDefault();
    });
    
    items.on('drop', (e) => {
      e.preventDefault();
      const dropIndex = parseInt(e.currentTarget.dataset.index);
      
      if (draggedIndex !== null && draggedIndex !== dropIndex) {
        const draggedVideo = this.playlistVideos.splice(draggedIndex, 1)[0];
        this.playlistVideos.splice(dropIndex, 0, draggedVideo);
        
        if (this.currentPlaylistIndex === draggedIndex) {
          this.currentPlaylistIndex = dropIndex;
        } else if (draggedIndex < this.currentPlaylistIndex && dropIndex >= this.currentPlaylistIndex) {
          this.currentPlaylistIndex--;
        } else if (draggedIndex > this.currentPlaylistIndex && dropIndex <= this.currentPlaylistIndex) {
          this.currentPlaylistIndex++;
        }
        
        this.updatePlaylistUI();
      }
    });
  }
  
  activateListeners(html) {
    super.activateListeners(html);
    
    const bgPrimary = game.settings.get(YouTubeSync.ID, 'bgColorPrimary');
    const bgSecondary = game.settings.get(YouTubeSync.ID, 'bgColorSecondary');
    const textColor = game.settings.get(YouTubeSync.ID, 'textColor');
    const accentColor = game.settings.get(YouTubeSync.ID, 'accentColor');
    
    this._addElegantStyling(html, bgPrimary, bgSecondary, textColor, accentColor);
    
    html.find('.window-header').on('dblclick', (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });
    
    html.find('.window-title').on('dblclick', (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });
    
    const minHeight = 180;
    const controlsHeight = 60;
    const playerExtraHeight = 20;
    const actualControlsHeight = game.user.isGM ? 40 : controlsHeight;
    
    html.find('.window-content').css({
      'padding': '0',
      'height': (minHeight + controlsHeight + 200) + 'px',
      'overflow': 'hidden',
      'min-height': minHeight + 'px',
      'position': 'relative',
      'background': `linear-gradient(135deg, ${bgPrimary} 0%, ${bgSecondary} 100%)`
    });
    
    html.find('#youtube-player').css({
      'width': '100%',
      'height': 'calc(100% - ' + controlsHeight + 'px + ' + playerExtraHeight + 'px)',
      'overflow': 'hidden',
      'min-height': minHeight + playerExtraHeight + 'px',
      'position': 'relative',
      'border-radius': '10px 10px 0 0',
      'box-shadow': '0 4px 15px rgba(0,0,0,0.3)'
    });

    html.find('.youtube-controls').css({
      'position': 'absolute',
      'bottom': '-3px',
      'left': '0',
      'right': '0',
      'background': 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(30,30,30,0.9))',
      'backdrop-filter': 'blur(10px)',
      'padding': '15px',
      'z-index': '1000',
      'display': 'flex',
      'justify-content': 'center',
      'align-items': 'center',
      'gap': '15px',
      'width': '100%',
      'box-sizing': 'border-box',
      'height': actualControlsHeight + 'px',
      'border-radius': '0 0 10px 10px'
    });

    html.find('.youtube-control').css({
      'padding': '10px 15px',
      'font-size': '1em',
      'border': '2px solid transparent',
      'border-radius': '25px',
      'background': `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
      'color': textColor,
      'cursor': 'pointer',
      'transition': 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      'box-shadow': `0 4px 15px ${accentColor}66`,
      'position': 'relative',
      'overflow': 'hidden'
    });

    html.find('.youtube-control').hover(
      function() {
        $(this).css({
          'transform': 'translateY(-3px) scale(1.05)',
          'box-shadow': `0 8px 25px ${accentColor}99`,
          'background': `linear-gradient(135deg, ${accentColor}CC, ${accentColor})`
        });
      },
      function() {
        $(this).css({
          'transform': 'translateY(0) scale(1)',
          'box-shadow': `0 4px 15px ${accentColor}66`,
          'background': `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`
        });
      }
    );

    html.find('.youtube-control').on('click', function() {
      $(this).css('transform', 'scale(0.95)');
      setTimeout(() => {
        $(this).css('transform', 'translateY(-3px) scale(1.05)');
      }, 150);
    });

    if (game.user.isGM) {
      html.find('#youtube-volume').css({
        'appearance': 'none',
        'width': '100px',
        'height': '5px',
        'border-radius': '5px',
        'background': 'linear-gradient(90deg, #333, #666)',
        'outline': 'none',
        'cursor': 'pointer'
      });

      html.find('#youtube-volume::-webkit-slider-thumb').css({
        'appearance': 'none',
        'width': '20px',
        'height': '20px',
        'border-radius': '50%',
        'background': `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
        'cursor': 'pointer',
        'box-shadow': `0 2px 10px ${accentColor}80`
      });

      html.find('.volume-value').css({
        'color': textColor,
        'font-weight': '600',
        'text-shadow': '0 2px 4px rgba(0,0,0,0.5)'
      });
    }

    html.find('.youtube-control').on('click', this._onControlClick.bind(this));
    html.find('#youtube-volume').on('input', this._onVolumeChange.bind(this));

    // Playlist toggle button (solo per GM)
    if (game.user.isGM && (this.playlistId || this.playlistVideos.length > 0)) {
      html.find('.toggle-playlist').on('click', () => {
        this.playlistPanelOpen = !this.playlistPanelOpen;
        const panel = html.find('.playlist-panel');
        const button = html.find('.toggle-playlist i');
        
        if (this.playlistPanelOpen) {
          panel.addClass('open');
          button.removeClass('fa-chevron-left').addClass('fa-chevron-right');
        } else {
          panel.removeClass('open');
          button.removeClass('fa-chevron-right').addClass('fa-chevron-left');
        }
      });
      
      // Playlist video click
      html.on('click', '.playlist-video-item', (e) => {
        if (!game.user.isGM) return;
        const index = parseInt(e.currentTarget.dataset.index);
        this.playVideoFromPlaylist(index);
        
        // Broadcast to other clients
        game.socket.emit(YouTubeSync.SOCKET_NAME, {
          type: 'playlistVideoChange',
          index: index
        });
      });
    }
    
    this._initPlayer();
  }
  
  _addElegantStyling(html) {
    const styleSheet = `
      <style>
        @keyframes windowSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(-30px) scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes controlGlow {
          0%, 100% { box-shadow: 0 4px 15px rgba(255,107,107,0.4); }
          50% { box-shadow: 0 4px 25px rgba(255,107,107,0.8); }
        }
        
        .elegant-window {
          animation: windowSlideIn 0.5s ease-out;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .elegant-window .window-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          border-radius: 15px 15px 0 0;
        }
        
        .youtube-control.playing {
          animation: controlGlow 2s infinite;
        }
      </style>
    `;
    
    html.prepend(styleSheet);
  }
  
  _initPlayer() {
    if (!this.videoId && !this.playlistId) return;
    
    if (this.player) {
      this.player.destroy();
    }
    
    const playerVars = {
      'autoplay': 1,
      'controls': game.user.isGM ? 1 : 0,  // GM vede controlli, users NO
      'disablekb': game.user.isGM ? 0 : 1,  // Users non possono usare tastiera
      'enablejsapi': 1,
      'rel': 0,
      'origin': window.location.origin,
      'modestbranding': 1,
      'showinfo': 0,
      'fs': game.user.isGM ? 1 : 0,  // Solo GM può fare fullscreen
      'iv_load_policy': 3  // Nascondi annotazioni
    };
    
    if (this.playlistId) {
      playerVars.list = this.playlistId;
      playerVars.listType = 'playlist';
    }
    
    const config = {
      height: '100%',
      width: '100%',
      playerVars: playerVars,
      events: {
        'onReady': this._onPlayerReady.bind(this),
        'onStateChange': this._onPlayerStateChange.bind(this),
        'onError': this._onPlayerError.bind(this)
      }
    };
    
    if (this.videoId) {
      config.videoId = this.videoId;
    } else if (this.playlistId) {
      config.playerVars.index = 0;
    }
    
    this.player = new YT.Player('youtube-player', config);
  }
  
  _onPlayerReady(event) {
    console.log("YouTubePlayerApp | Player ready");
    if (this.player) {
      this.player.setVolume(this.currentVolume);
    }
    
    if (this.needsVideoIdFromPlaylist && this.player.getPlaylist) {
      const playlist = this.player.getPlaylist();
      if (playlist && playlist.length > 0) {
        this.videoId = playlist[0];
        this.needsVideoIdFromPlaylist = false;
      }
    }
    
    if (this.playlistId) {
      this.loadPlaylistInfo(this.playlistId);
    } else if (this.videoId) {
      this.fetchVideoInfo(this.videoId);
    }
  }

  _onPlayerError(event) {
    console.error("YouTubePlayerApp | Player error:", event.data);
    ui.notifications.error(`Errore YouTube: ${event.data}`);
  }
  
  _onPlayerStateChange(event) {
    const playBtn = this.element.find('[data-action="play"]');
    const pauseBtn = this.element.find('[data-action="pause"]');
    
    if (event.data === YT.PlayerState.PLAYING) {
      playBtn.removeClass('playing');
      pauseBtn.addClass('playing');
      
      if (this.playlistId && this.player.getPlaylistIndex) {
        const newIndex = this.player.getPlaylistIndex();
        if (newIndex !== this.currentPlaylistIndex) {
          this.currentPlaylistIndex = newIndex;
          this.updatePlaylistUI();
          
          if (game.user.isGM) {
            game.socket.emit(YouTubeSync.SOCKET_NAME, {
              type: 'playlistVideoChange',
              index: newIndex
            });
          }
        }
      }
      
      if (game.user.isGM) {
        const time = this.player.getCurrentTime();
        game.socket.emit(YouTubeSync.SOCKET_NAME, {
          type: 'seekVideo',
          time: time
        });
      }
    } else if (event.data === YT.PlayerState.PAUSED) {
      pauseBtn.removeClass('playing');
      playBtn.addClass('playing');
      
      if (game.user.isGM) {
        game.socket.emit(YouTubeSync.SOCKET_NAME, {
          type: 'pauseVideo'
        });
      }
    } else if (event.data === YT.PlayerState.ENDED) {
      if (this.playlistId && this.currentPlaylistIndex < this.playlistVideos.length - 1) {
        setTimeout(() => {
          this.currentPlaylistIndex++;
          this.updatePlaylistUI();
        }, 500);
      }
    }
  }
  
  _onVolumeChange(event) {
    const volume = parseInt(event.currentTarget.value);
    this.currentVolume = volume;
    
    if (game.settings.get(YouTubeSync.ID, 'rememberVolume')) {
      game.settings.set(YouTubeSync.ID, 'lastVolume', volume);
    }
    
    const volumeText = $(event.currentTarget).siblings('.volume-value');
    volumeText.text(volume + '%');
    
    const volumeIcon = $(event.currentTarget).siblings('i');
    if (volume === 0) {
      volumeIcon.removeClass().addClass('fas fa-volume-mute');
    } else if (volume < 50) {
      volumeIcon.removeClass().addClass('fas fa-volume-down');
    } else {
      volumeIcon.removeClass().addClass('fas fa-volume-up');
    }
    
    if (this.player) {
      this.player.setVolume(volume);
      
      if (game.user.isGM) {
        game.socket.emit(YouTubeSync.SOCKET_NAME, {
          type: 'volumeChange',
          volume: volume
        });
      }
    }
  }
  
  _onControlClick(event) {
    const action = event.currentTarget.dataset.action;
    
    if (!this.player) {
      console.warn("YouTubePlayerApp | Cannot perform action, player not initialized");
      return;
    }
    
    switch (action) {
      case 'play':
        this.player.playVideo();
        if (game.user.isGM) {
          game.socket.emit(YouTubeSync.SOCKET_NAME, {
            type: 'seekVideo',
            time: this.player.getCurrentTime()
          });
        }
        break;
      case 'pause':
        this.player.pauseVideo();
        if (game.user.isGM) {
          game.socket.emit(YouTubeSync.SOCKET_NAME, {
            type: 'pauseVideo'
          });
        }
        break;
      case 'stop':
        this.player.stopVideo();
        this.close();
        break;
    }
  }
  
  close(options={}) {
    if(game.user.isGM){
      game.socket.emit(YouTubeSync.SOCKET_NAME, {
        type: 'closeVideo'
      });
    }
    if (this.player) {
      try {
        this.player.destroy();
      } catch (e) {
        console.warn("YouTubePlayerApp | Error destroying player:", e);
      }
      this.player = null;
    }
    return super.close(options);
  }
}

Hooks.once('init', () => {
  YouTubeSync.initialize();
});