import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publicApi, userApi, getFileUrl } from '../utils/api';
import './ContentDetail.css';

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconHeart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const IconHeartOutline = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const IconPlay = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);
const IconPause = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);
const IconVolume = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);
const IconVolumeMute = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
);
const IconFullscreen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
const IconExitFullscreen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
    <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
const IconRewind = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/>
  </svg>
);
const IconForward = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/>
  </svg>
);

export default function ContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const coverRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchContent();
    if (localStorage.getItem('liujing_token')) {
      loadFavoriteStatus();
    }
  }, [id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      setIsFullscreen(!!fullscreenElement);
      if (fullscreenElement) {
        setShowControls(true);
        resetControlsTimeout();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // GSAP: cover image animates out when video starts playing
  useEffect(() => {
    if (!coverRef.current) return;
    if (isPlaying) {
      gsap.to(coverRef.current, {
        scale: 0.85,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      });
    } else {
      gsap.to(coverRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [isPlaying]);

  // GSAP: controls overlay slide animation
  useEffect(() => {
    const overlay = document.querySelector('.cd-controls-overlay');
    if (!overlay) return;
    if (showControls) {
      gsap.to(overlay, { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' });
    } else {
      gsap.to(overlay, { y: 8, opacity: 0, duration: 0.18, ease: 'power2.in' });
    }
  }, [showControls]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') navigate(-1);
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowLeft') seek(-10);
      if (e.key === 'ArrowRight') seek(10);
      if (e.key === 'ArrowUp') { e.preventDefault(); changeVolume(0.1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); changeVolume(-0.1); }
      if (e.key === 'm') toggleMute();
      if (e.key === 'f') toggleFullscreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    resetControlsTimeout();
  };

  const handleVideoClick = () => {
    if (isMobile) {
      setShowControls(prev => !prev);
      if (showControls) resetControlsTimeout();
    } else {
      togglePlay();
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await publicApi.getContentById(id);
      setContent(data);
    } catch (e) {
      console.error('Failed to fetch content:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteStatus = async () => {
    try {
      const res = await userApi.getFavorites();
      const ids = new Set((res.list || []).map(item => item.content_id));
      setFavorited(ids.has(Number(id)));
    } catch (e) {}
  };

  const toggleFavorite = async () => {
    try {
      if (favorited) {
        await userApi.deleteFavorite(id);
        setFavorited(false);
        setContent(prev => prev ? { ...prev, likes: Math.max(0, (prev.likes || 0) - 1) } : prev);
      } else {
        await userApi.addFavorite(id);
        setFavorited(true);
        setContent(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : prev);
      }
    } catch (e) {
      alert('请先登录');
    }
  };

  const togglePlay = () => {
    if (!videoRef.current || !content?.video_url) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
  };

  const handleVideoPlay = () => setIsPlaying(true);
  const handleVideoPause = () => setIsPlaying(false);
  const handleTimeUpdate = () => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); };
  const handleLoadedMetadata = () => { if (videoRef.current) setDuration(videoRef.current.duration); };
  const handleVideoEnded = () => { setIsPlaying(false); setShowControls(true); };

  const seek = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
  };

  const changeVolume = (delta) => {
    if (!videoRef.current) return;
    const v = Math.max(0, Math.min(1, volume + delta));
    videoRef.current.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().then(() => {
        if (isMobile && screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      }).catch(() => {});
    }
  };

  const handleSeekChange = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) { videoRef.current.currentTime = time; setCurrentTime(time); }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const videoUrl = content?.video_url ? getFileUrl(content.video_url) : '';

  if (loading) {
    return (
      <div className="cd-loading">
        <div className="cd-loading-spinner" />
        <p>加载中...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="cd-not-found">
        <p>内容不存在</p>
        <button onClick={() => navigate(-1)}>返回</button>
      </div>
    );
  }

  return (
    <div className="cd-page">
      <div className="cd-nav">
        <div className="container">
          <div className="cd-nav-inner">
            <button className="cd-back-btn" onClick={() => navigate(-1)}>
              <IconArrowLeft />
              <span>返回</span>
            </button>
            <div className="cd-breadcrumb">
              <Link to="/content">内容库</Link>
              <span className="cd-breadcrumb-sep">/</span>
              <span>{content.title}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="cd-main">
          <div className="cd-left">
            {content.video_url ? (
              <div 
                className={`cd-video-container ${isFullscreen ? 'fullscreen' : ''}`}
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
              >
                <video
                  ref={videoRef}
                  src={videoUrl}
                  onClick={handleVideoClick}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnded}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  playsInline
                />
                
                {!isPlaying && (
                  <div className="cd-play-overlay" onClick={togglePlay}>
                    <button className="cd-big-play"><IconPlay /></button>
                  </div>
                )}
                
                <div className={`cd-controls-overlay ${showControls ? 'visible' : ''}`}>
                  <div className="cd-progress-bar-container">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeekChange}
                      className="cd-progress-slider"
                    />
                  </div>
                  
                  <div className="cd-controls-row">
                    <div className="cd-controls-left">
                      <button className="cd-ctrl-btn" onClick={togglePlay}>
                        {isPlaying ? <IconPause /> : <IconPlay />}
                      </button>
                      <button className="cd-ctrl-btn" onClick={() => seek(-10)}>
                        <IconRewind />
                      </button>
                      <button className="cd-ctrl-btn" onClick={() => seek(10)}>
                        <IconForward />
                      </button>
                      <div className="cd-volume-control">
                        <button className="cd-ctrl-btn" onClick={toggleMute}>
                          {isMuted || volume === 0 ? <IconVolumeMute /> : <IconVolume />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="cd-volume-slider"
                        />
                      </div>
                      <span className="cd-time">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <div className="cd-controls-right">
                      <button className="cd-ctrl-btn" onClick={toggleFullscreen}>
                        {isFullscreen ? <IconExitFullscreen /> : <IconFullscreen />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="cd-text-media-area">
                {content.cover && (
                  <img ref={coverRef} src={getFileUrl(content.cover)} alt="封面" className="cd-cover-image" />
                )}
              </div>
            )}



            {content.body && (
              <div className="cd-body-section">
                <div className="cd-body-text">
                  <ReactMarkdown
                    components={{
                      img: ({ node, ...props }) => (
                        <img {...props} style={{ maxWidth: '100%', borderRadius: 8, margin: '12px 0', display: 'block' }} />
                      )
                    }}
                  >{content.body}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          <div className="cd-right">
            <div className="cd-info-card">
              <div className="cd-info-header">
                <span className="cd-category-badge">{content.category}</span>
                <h1 className="cd-title">{content.title}</h1>
                <div className="cd-author-row">
                  <div className="cd-author-avatar">
                    {content.author?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="cd-author-name">{content.author || '未知作者'}</div>
                    <div className="cd-author-sub">{content.created_at?.split('T')[0]}</div>
                  </div>
                </div>
              </div>

              <div className="cd-stats">
                <div className="cd-stat-item">
                  <IconEye />
                  <span>{content.views > 10000 ? (content.views / 10000).toFixed(1) + 'w' : content.views}</span>
                </div>
                <div className="cd-stat-item">
                  <IconHeart />
                  <span>{content.likes > 10000 ? (content.likes / 10000).toFixed(1) + 'w' : content.likes}</span>
                </div>
                {content.duration && content.duration !== '--:--' && (
                  <div className="cd-stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{content.duration}</span>
                  </div>
                )}
              </div>

              <div className="cd-actions">
                <button
                  className={`cd-action-btn ${favorited ? 'active' : ''}`}
                  onClick={toggleFavorite}
                >
                  {favorited ? <IconHeart /> : <IconHeartOutline />}
                  <span>{favorited ? '已收藏' : '收藏'}</span>
                </button>
                <button className="cd-action-btn" onClick={() => navigate('/content')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                  </svg>
                  <span>返回列表</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
