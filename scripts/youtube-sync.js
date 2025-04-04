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
    game.settings.register(this.ID, 'apiKey', {
      name: 'YouTube API Key',
      hint: 'Optional',
      scope: 'world',
      config: true,
      type: String,
      default: ''
    });
    
    game.settings.register(this.ID, 'minimizedState', {
      name: 'Stato minimizzato',
      scope: 'client',
      config: false,
      type: Boolean,
      default: false
    });
  }
  
  static hookIntoFoundry() {
    // Add GM Bar Youtube button
    Hooks.on('getSceneControlButtons', (controls) => {
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
    });
    
    Hooks.on('ready', () => {
      this._loadYouTubeAPI();
      if (!game.user.isGM) {
      }
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
      }
    });
  }
  
  static openYouTubeDialog() {
    new Dialog({
      title: 'YouTube Sync',
      content: `
        <form class="youtube-url-form">
          <div class="form-group">
            <label>YouTube URL:</label>
            <div class="youtube-url-input-wrapper">
              <i class="fab fa-youtube youtube-icon"></i>
              <input type="text" name="youtubeUrl" placeholder="Insert here Youtube URL...">
            </div>
          </div>
        </form>
        <style>
          .youtube-url-form {
            padding: 10px;
            border-radius: 8px;
            background: #f8f8f8;
          }
          .youtube-url-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }
          .youtube-icon {
            position: absolute;
            left: 10px;
            color: #FF0000;
            font-size: 1.2em;
          }
          .youtube-url-form input[name="youtubeUrl"] {
            padding: 10px 10px 10px 35px;
            border-radius: 4px;
            border: 1px solid #ccc;
            width: 100%;
            font-size: 1.1em;
            transition: all 0.3s ease;
          }
          .youtube-url-form input[name="youtubeUrl"]:focus {
            border-color: #FF0000;
            box-shadow: 0 0 5px rgba(255, 0, 0, 0.3);
            outline: none;
          }
        </style>
      `,
      buttons: {
        play: {
          icon: '<i class="fas fa-play"></i>',
          label: 'Play',
          callback: (html) => {
            const url = html.find('input[name="youtubeUrl"]').val();
            const videoId = this.extractVideoId(url);
            if (videoId) {
              this.createPlayerWindow(videoId);
              this.broadcastVideo(videoId);
            } else {
              ui.notifications.error('URL not valid');
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel'
        }
      },
      default: 'play',
      render: (html) => {
        setTimeout(() => {
          html.find('input[name="youtubeUrl"]').focus();
        }, 100);
      }
    }).render(true);
  }
  
  static extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
  
  static broadcastVideo(videoId) {
    console.log(`${this.ID} | Broadcasting video: ${videoId}`);
    game.socket.emit(this.SOCKET_NAME, {
      type: 'playVideo',
      videoId: videoId
    });
  }
  
  static createPlayerWindow(videoId = null) {
    if (!videoId) return;
    
    const existingApp = Object.values(ui.windows).find(w => w.options.id === 'youtube-player-window');
    
    if (existingApp) {
      existingApp.updateVideo(videoId);
      existingApp.render(true);
    } else {
      const app = new YouTubePlayerApp(videoId);
      app.render(true);
    }
  }
  
  static handlePlayVideo(data) {
    console.log(`${this.ID} | Handling play video:`, data);
    this.createPlayerWindow(data.videoId);
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
      existingApp.player.playVideo()
    }
  }
  
  static handleCloseVideo() {
    const existingApp = Object.values(ui.windows).find(w => w.options.id === 'youtube-player-window');
    if (existingApp && existingApp.player) {
      existingApp.player.destroy()
      existingApp.close();
    }
  }
  
  static handleVolumeChange(volume) {
    const existingApp = Object.values(ui.windows).find(w => w.options.id === 'youtube-player-window');
    if (existingApp && existingApp.player) {
      existingApp.player.setVolume(volume);
    }
  }
}

class YouTubePlayerApp extends Application {
  constructor(videoId = null) {
    super();
    this.videoId = videoId;
    this.player = null;
    this.apiReady = false;
    this.currentVolume = 100;
    this.isMinimized = true; // Always start minimized
    this.videoTitle = "";
    this.videoThumbnail = "";
  }

  static get defaultOptions() {
    // Calculate minimum dimensions based on 16:9 aspect ratio
    const minHeight = 180; // Minimum height we want for the video
    const minWidth = Math.ceil(minHeight * (16/9)); // Calculate width to maintain aspect ratio
    const gmExtraHeight = 30; // Extra height for GM controls
    const gmExtraSize = 80; // Extra size for GM window (increased from 100)
    const clientExtraHeight = 0; // Extra height for client window
    
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'youtube-player-window', 
      title: 'YouTube Sync Player',
      template: YouTubeSync.TEMPLATES.youtubePlayer,
      width: game.user.isGM ? minWidth + gmExtraSize : minWidth,
      height: game.user.isGM ? minHeight + gmExtraHeight + gmExtraSize : minHeight + clientExtraHeight,
      resizable: false, // Disable resizing for everyone
      popOut: true,
      minimizable: false,
      classes: ['youtube-sync-window'],
      closeOnDblClick: false
    });
  }
  
  getData(options={}) {
    return {
      videoId: this.videoId,
      volume: this.currentVolume,
      isGM: game.user.isGM,
      isMinimized: this.isMinimized,
      videoTitle: this.videoTitle,
      videoThumbnail: this.videoThumbnail
    };
  }
  
  updateVideo(videoId) {
    this.videoId = videoId;
    
    if (this.player && this.apiReady) {
      this.player.loadVideoById(videoId);
      this.fetchVideoInfo(videoId);
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
          this.element.find('.window-title').text(this.videoTitle);
        } catch (e) {
          console.warn("fetchvideoinfo error :", e);
        }
      }
    }, 1000);
    
    // minified thumbnail
    this.videoThumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  
  activateListeners(html) {
    super.activateListeners(html);
    
    // Prevent double-click minimization
    html.find('.window-header').on('dblclick', (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });
    
    // Prevent window from being minimized by double-clicking the title
    html.find('.window-title').on('dblclick', (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });
    
    // Make header more compact
    html.find('.window-header').css({
      'padding': '2px 5px',
      'height': '20px',
      'cursor': 'move'
    });
    
    // Calculate minimum dimensions based on aspect ratio
    const minHeight = 180;
    const minWidth = Math.ceil(minHeight * (16/9));
    const controlsHeight = 30; // Height for GM controls
    const playerExtraHeight = 20; // Extra height for player
    const clientExtraHeight = 200; // Extra height for client window
    
    // Make window content more compact
    html.find('.window-content').css({
      'padding': '0',
      'height': (game.user.isGM ? minHeight + controlsHeight + 200 : minHeight + clientExtraHeight) + 'px',
      'overflow': 'hidden',
      'min-height': minHeight + 'px',
      'position': 'relative'
    });
    
    // Ensure player container is properly sized
    html.find('#youtube-player').css({
      'width': '100%',
      'height': 'calc(100% - ' + (game.user.isGM ? controlsHeight : 0) + 'px + ' + playerExtraHeight + 'px)',
      'overflow': 'hidden',
      'min-height': minHeight + playerExtraHeight + 'px',
      'position': 'relative'
    });

    // Style GM controls
    if (game.user.isGM) {
      html.find('.youtube-controls').css({
        'position': 'absolute',
        'bottom': '0',
        'left': '0',
        'right': '0',
        'background': 'rgba(0, 0, 0, 0.7)',
        'padding': '5px',
        'z-index': '1000',
        'display': 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        'gap': '5px',
        'width': '100%',
        'box-sizing': 'border-box',
        'height': controlsHeight + 'px'
      });

      // Make controls more compact
      html.find('.youtube-control').css({
        'padding': '2px 5px',
        'font-size': '0.8em'
      });

      html.find('.youtube-control').on('click', this._onControlClick.bind(this));
      html.find('#youtube-volume').on('input', this._onVolumeChange.bind(this));
    } else {
      html.find('.youtube-controls').hide();
    }
    
    // Remove resize handler since resizing is disabled
    this.element.off('resize');
    
    this._initPlayer();
  }
  
  _updateVideoSize() {
    const playerElement = this.element.find('#youtube-player');
    if (playerElement.length && this.player) {
      const containerWidth = playerElement.width();
      const containerHeight = playerElement.height();
      
      // Calculate dimensions based on 16:9 aspect ratio
      const videoRatio = 16/9;
      const containerRatio = containerWidth / containerHeight;
      
      let width, height;
      
      if (containerRatio > videoRatio) {
        // Container is wider than video
        height = containerHeight;
        width = height * videoRatio;
      } else {
        // Container is taller than video
        width = containerWidth;
        height = width / videoRatio;
      }
      
      // Update iframe size
      const iframe = playerElement.find('iframe');
      if (iframe.length) {
        iframe.css({
          width: width + 'px',
          height: height + 'px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: 'none',
          margin: '0',
          padding: '0'
        });
      }
    }
  }
  
  _initPlayer() {
    if (!this.videoId) return;
    
    if (this.player) {
      this.player.destroy();
    }
    
    this.player = new YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: this.videoId,
      playerVars: {
        'autoplay': 1,
        'controls': game.user.isGM ? 1 : 0,
        'enablejsapi': 1,
        'rel': 0,
        'origin': window.location.origin,
        'modestbranding': 1,
        'showinfo': 0,
        'fs': 0
      },
      events: {
        'onReady': this._onPlayerReady.bind(this),
        'onStateChange': this._onPlayerStateChange.bind(this),
        'onError': this._onPlayerError.bind(this)
      }
    });
  }
  
  _onPlayerReady(event) {
    console.log("YouTubePlayerApp | Player ready");
    // Set initial volume
    if (this.player) {
      this.player.setVolume(this.currentVolume);
    }
  }
  
  _onPlayerError(event) {
    console.error("YouTubePlayerApp | Player error:", event.data);
    ui.notifications.error(`Errore YouTube: ${event.data}`);
  }
  
  _onPlayerStateChange(event) {
    if (!game.user.isGM) return;
    
    console.log("YouTubePlayerApp | Player state changed:", event.data);
   
    if (event.data === YT.PlayerState.PAUSED) {
      game.socket.emit(YouTubeSync.SOCKET_NAME, {
        type: 'pauseVideo'
      });
    } else if (event.data === YT.PlayerState.PLAYING) {
      const time = this.player.getCurrentTime();
      game.socket.emit(YouTubeSync.SOCKET_NAME, {
        type: 'seekVideo',
        time: time
      });
    }
  }
  
  _onVolumeChange(event) {
    const volume = parseInt(event.currentTarget.value);
    this.currentVolume = volume;
    
    // Update volume display text
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
      
      // Broadcast volume change to other clients
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
        break;
      case 'pause':
        this.player.pauseVideo();
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