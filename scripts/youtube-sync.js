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
              <input type="text" name="youtubeUrl" placeholder="Youtube URL...">
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
              ui.notifications.error('URL non valido');
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
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
      
      // Forziamo l'applicazione delle dimensioni anche quando aggiorniamo una finestra esistente
      setTimeout(() => {
        existingApp.position.width = 960;
        existingApp.position.height = 720;
        existingApp.setPosition(existingApp.position);
      }, 100);
    } else {
      const app = new YouTubePlayerApp(videoId);
      app.render(true);
      
      // Forziamo l'applicazione delle dimensioni quando creiamo una nuova finestra
      setTimeout(() => {
        app.position.width = 960;
        app.position.height = 720;
        app.setPosition(app.position);
      }, 100);
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
    this.currentVolume = 100; // Default volume level
    this.isMinimized = game.settings.get(YouTubeSync.ID, 'minimizedState');
    this.videoTitle = "";
    this.videoThumbnail = "";
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'youtube-player-window', 
      title: 'YouTube Sync Player',
      template: YouTubeSync.TEMPLATES.youtubePlayer,
      width: 960,
      height: 720,
      resizable: true,
      popOut: true,
      minimizable: true,
      classes: ['youtube-sync-window']
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
    
    console.log("YouTubePlayerApp | Activating listeners");
    
    this._initPlayer();
    
    html.find('.minimize-button').on('click', this._toggleMinimize.bind(this));
    html.find('.maximize-button').on('click', this._toggleMinimize.bind(this));
    
    // Forziamo l'applicazione delle dimensioni quando la finestra viene inizializzata
    setTimeout(() => {
      this.position.width = 960;
      this.position.height = 720;
      this.setPosition(this.position);
    }, 100);
    
    if (game.user.isGM) {
      html.find('.youtube-control').on('click', this._onControlClick.bind(this));
      html.find('#youtube-volume').on('input', this._onVolumeChange.bind(this));
    }
    
    if (this.isMinimized) {
      this._applyMinimizedState(html);
    }
  }
  
  _toggleMinimize(event) {
    event.preventDefault();
    this.isMinimized = !this.isMinimized;
    
    game.settings.set(YouTubeSync.ID, 'minimizedState', this.isMinimized);
    
    if (this.isMinimized) {
      this._applyMinimizedState(this.element);
    } else {
      this._applyExpandedState(this.element);
    }
  }
  
  _applyMinimizedState(html) {
    const windowContent = html.find('.window-content');
    const header = html.find('.window-header');
    
    if (!game.user.isGM) {
      html.find('.youtube-controls').hide();
    } else {
      const controls = html.find('.youtube-controls');
      controls.addClass('minimized-controls');
    }
    
    if (!html.find('.minimized-view').length) {
      windowContent.append(`
        <div class="minimized-view">
          <img src="${this.videoThumbnail}" alt="Thumbnail" />
          <div class="minimized-title">${this.videoTitle || "YouTube Video"}</div>
        </div>
      `);
      
      if (game.user.isGM) {
        html.find('style').append(`
          .minimized-controls {
            position: absolute;
            bottom: 10px;
            left: 0;
            right: 0;
            background: rgba(34, 34, 34, 0.8);
            border-radius: 6px;
            padding: 8px;
            margin: 0 10px;
            z-index: 10;
          }
          .minimized-view {
            padding-bottom: 60px;
          }
        `);
      }
    } else {
      html.find('.minimized-view').show();
    }
    
    html.find('.minimize-button').hide();
    html.find('.maximize-button').show();
    
    this.position.width = 300;
    this.position.height = game.user.isGM ? 240 : 180; // GM have controls 
    this.setPosition(this.position);
  }
  
  _applyExpandedState(html) {
    html.find('#youtube-player').show();
    
    if (game.user.isGM) {
      html.find('.youtube-controls').removeClass('minimized-controls');
    }

    html.find('.minimized-view').hide();
    
    html.find('.minimize-button').show();
    html.find('.maximize-button').hide();
    
    // Forziamo l'applicazione delle dimensioni
    this.position.width = 960;
    this.position.height = 720;
    this.setPosition(this.position);
    
    // Aggiungiamo un timeout per assicurarci che le dimensioni vengano applicate
    setTimeout(() => {
      this.position.width = 960;
      this.position.height = 720;
      this.setPosition(this.position);
    }, 100);
    
    if (this.player) {
      this.player.playVideo();
    }
  }
  
  async _initPlayer() {
    console.log("YouTubePlayerApp | Initializing player");
    
    if (!window.youtubeAPIReady) {
      await YouTubeSync._loadYouTubeAPI();
    } else {
      await window.youtubeAPIReady;
    }
    
    this.apiReady = true;
    
    if (this.videoId && document.getElementById('youtube-player')) {
      console.log("YouTubePlayerApp | Creating YT.Player with videoId:", this.videoId);
      
      try {
        this.player = new YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: this.videoId,
          playerVars: {
            'autoplay': 1,
            'controls': game.user.isGM ? 1 : 0,
            'enablejsapi': 1,
            'rel': 0,
            'origin': window.location.origin
          },
          events: {
            'onReady': this._onPlayerReady.bind(this),
            'onStateChange': this._onPlayerStateChange.bind(this),
            'onError': this._onPlayerError.bind(this)
          }
        });
        console.log("YouTubePlayerApp | Player created:", this.player);
        
        this.fetchVideoInfo(this.videoId);
        
      } catch (error) {
        console.error("YouTubePlayerApp | Error creating player:", error);
      }
    } else {
      console.warn("YouTubePlayerApp | Cannot initialize player: missing videoId or container element");
    }
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