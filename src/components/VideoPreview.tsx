import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { Icon } from './Icon'
import { formatVideoTime } from '../lib/waveform'
import '../styles/video-player.css'

const PLAYBACK_TIMEOUT_MS = 10_000
const SPEED_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export interface VideoPreviewProps {
  src: string
  onDownload: () => void
}

/** Native playback is shared by the private vault and public share modals. */
export default function VideoPreview({ src, onDownload }: VideoPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  // Playback state
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedEnd, setBufferedEnd] = useState(0)
  const [volume, setVolume] = useState(0.9)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [loop, setLoop] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)

  // Controls UI state
  const [isIdle, setIsIdle] = useState(false)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [hoverFraction, setHoverFraction] = useState<number | null>(null)
  const [showRemainingTime, setShowRemainingTime] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPip, setIsPip] = useState(false)
  const [flashIcon, setFlashIcon] = useState<string | null>(null)
  const [flashKey, setFlashKey] = useState(0)

  // 10-second timeout detection
  function clearTimeoutCheck() {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = undefined
  }

  function waitForPlayback() {
    if (timeoutRef.current !== undefined) return
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = undefined
      setError('No playable video arrived within 10 seconds. The connection may be slow, or your browser may not support this video’s container or codecs.')
    }, PLAYBACK_TIMEOUT_MS)
  }

  useEffect(() => {
    waitForPlayback()
    return clearTimeoutCheck
  }, [src, attempt])

  function handleFailed() {
    clearTimeoutCheck()
    setError(videoRef.current?.error?.code === 2
      ? 'The video could not be loaded because of a network error. Try again or download it to watch on your device.'
      : 'Your browser could not decode or load this video. Try again, or download it and open it in a compatible media player.')
  }

  // Trigger brief visual feedback in center of screen
  const triggerFlash = (iconName: string) => {
    setFlashIcon(iconName)
    setFlashKey((k) => k + 1)
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    flashTimerRef.current = setTimeout(() => {
      setFlashIcon(null)
    }, 600)
  }

  // Inactivity auto-hide
  const resetIdleTimer = () => {
    setIsIdle(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (playing && !isScrubbing) {
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true)
      }, 2500)
    }
  }

  useEffect(() => {
    resetIdleTimer()
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [playing, isScrubbing])

  // Fullscreen event listener
  useEffect(() => {
    const handleFsChange = () => {
      const activeEl = document.fullscreenElement || (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      setIsFullscreen(Boolean(activeEl && activeEl === containerRef.current))
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('webkitfullscreenchange', handleFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('webkitfullscreenchange', handleFsChange)
    }
  }, [])

  // Picture-in-picture listener
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onEnterPip = () => setIsPip(true)
    const onLeavePip = () => setIsPip(false)
    v.addEventListener('enterpictureinpicture', onEnterPip)
    v.addEventListener('leavepictureinpicture', onLeavePip)
    return () => {
      v.removeEventListener('enterpictureinpicture', onEnterPip)
      v.removeEventListener('leavepictureinpicture', onLeavePip)
    }
  }, [attempt])

  // Smooth animation frame loop during playback
  useEffect(() => {
    let frameId: number
    const tick = () => {
      if (videoRef.current && !videoRef.current.paused && !isScrubbing) {
        setCurrentTime(videoRef.current.currentTime)
        frameId = requestAnimationFrame(tick)
      }
    }
    if (playing && !isScrubbing) {
      frameId = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(frameId)
  }, [playing, isScrubbing])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeoutCheck()
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    }
  }, [])

  // Media event handlers
  const handleLoadedMetadata = () => {
    clearTimeoutCheck()
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0)
      videoRef.current.volume = volume
      videoRef.current.muted = muted
      videoRef.current.playbackRate = speed
      videoRef.current.loop = loop
    }
  }

  const handleTimeUpdate = () => {
    if (!isScrubbing && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
    updateBuffered()
  }

  const updateBuffered = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    try {
      for (let i = 0; i < v.buffered.length; i++) {
        if (v.buffered.start(i) <= v.currentTime && v.currentTime <= v.buffered.end(i)) {
          setBufferedEnd(v.buffered.end(i))
          return
        }
      }
      if (v.buffered.length > 0) {
        setBufferedEnd(v.buffered.end(v.buffered.length - 1))
      }
    } catch {
      // Ignore DOM exception
    }
  }

  // Playback control functions
  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (playing) {
      v.pause()
      triggerFlash('pause')
    } else {
      v.play().then(() => {
        triggerFlash('play')
      }).catch(() => {
        // Autoplay/playback blocked by browser policy until interaction
      })
    }
    resetIdleTimer()
  }

  const skip = (seconds: number) => {
    const v = videoRef.current
    if (!v || !duration) return
    const nextTime = Math.max(0, Math.min(duration, v.currentTime + seconds))
    v.currentTime = nextTime
    setCurrentTime(nextTime)
    triggerFlash(seconds > 0 ? 'skipForward' : 'skipBack')
    resetIdleTimer()
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    const nextMuted = !muted
    setMuted(nextMuted)
    v.muted = nextMuted
    triggerFlash(nextMuted ? 'volumeMute' : (volume < 0.5 ? 'volumeLow' : 'volumeHigh'))
    resetIdleTimer()
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    setMuted(val === 0)
    if (videoRef.current) {
      videoRef.current.volume = val
      videoRef.current.muted = val === 0
    }
    resetIdleTimer()
  }

  const cycleSpeed = () => {
    const nextIdx = (SPEED_PRESETS.indexOf(speed) + 1) % SPEED_PRESETS.length
    const nextSpeed = SPEED_PRESETS[nextIdx]
    setSpeed(nextSpeed)
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed
    }
    resetIdleTimer()
  }

  const toggleLoop = () => {
    const next = !loop
    setLoop(next)
    if (videoRef.current) {
      videoRef.current.loop = next
    }
    resetIdleTimer()
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    try {
      if (!document.fullscreenElement && !(document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        } else if ((containerRef.current as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (containerRef.current as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen()
        }
      }
    } catch {
      // Fullscreen might be disallowed or aborted
    }
    resetIdleTimer()
  }

  const isPipAvailable = typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && Boolean(document.pictureInPictureEnabled)

  const togglePip = async () => {
    const v = videoRef.current
    if (!v) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (v.requestPictureInPicture) {
        await v.requestPictureInPicture()
      }
    } catch {
      // Ignore PiP errors
    }
    resetIdleTimer()
  }

  // Video element click (single click: play/pause, double click: fullscreen)
  const handleVideoClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = undefined
      void toggleFullscreen()
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = undefined
        togglePlay()
      }, 220)
    }
  }

  // Timeline scrubber pointer events
  const getFractionFromEvent = (e: PointerEvent<HTMLDivElement>): number => {
    if (!timelineRef.current) return 0
    const rect = timelineRef.current.getBoundingClientRect()
    if (rect.width <= 0) return 0
    const x = e.clientX - rect.left
    return Math.max(0, Math.min(1, x / rect.width))
  }

  const handleTimelinePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!duration) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Ignore
    }
    setIsScrubbing(true)
    const fraction = getFractionFromEvent(e)
    const newTime = fraction * duration
    setCurrentTime(newTime)
    if (videoRef.current) videoRef.current.currentTime = newTime
    resetIdleTimer()
  }

  const handleTimelinePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const fraction = getFractionFromEvent(e)
    if (isScrubbing) {
      const newTime = fraction * duration
      setCurrentTime(newTime)
      if (videoRef.current) videoRef.current.currentTime = newTime
      resetIdleTimer()
    } else {
      setHoverFraction(fraction)
    }
  }

  const handleTimelinePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // Ignore
      }
      setIsScrubbing(false)
      resetIdleTimer()
    }
  }

  const handleTimelinePointerLeave = () => {
    if (!isScrubbing) setHoverFraction(null)
  }

  const handleTimelineKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!duration || !videoRef.current) return
    let newTime = currentTime
    if (e.key === 'ArrowLeft') {
      newTime = Math.max(0, currentTime - 5)
    } else if (e.key === 'ArrowRight') {
      newTime = Math.min(duration, currentTime + 5)
    } else if (e.key === 'Home') {
      newTime = 0
    } else if (e.key === 'End') {
      newTime = duration
    } else {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    setCurrentTime(newTime)
    videoRef.current.currentTime = newTime
    resetIdleTimer()
  }

  // Keyboard navigation on container
  const handleContainerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase()
    if (targetTag === 'input' && e.key !== ' ' && e.key !== 'k' && e.key !== 'K') {
      return
    }

    const v = videoRef.current
    if (!v) return

    switch (e.key) {
      case ' ':
      case 'k':
      case 'K':
        e.preventDefault()
        togglePlay()
        break
      case 'f':
      case 'F':
        e.preventDefault()
        void toggleFullscreen()
        break
      case 'm':
      case 'M':
        e.preventDefault()
        toggleMute()
        break
      case 'l':
      case 'L':
        e.preventDefault()
        toggleLoop()
        break
      case 'p':
      case 'P':
        if (isPipAvailable) {
          e.preventDefault()
          void togglePip()
        }
        break
      case 'ArrowLeft':
        e.preventDefault()
        skip(-10)
        break
      case 'ArrowRight':
        e.preventDefault()
        skip(10)
        break
      case 'ArrowUp': {
        e.preventDefault()
        const newVol = Math.min(1, Math.round((volume + 0.1) * 100) / 100)
        setVolume(newVol)
        setMuted(false)
        v.volume = newVol
        v.muted = false
        triggerFlash('volumeHigh')
        resetIdleTimer()
        break
      }
      case 'ArrowDown': {
        e.preventDefault()
        const newVol = Math.max(0, Math.round((volume - 0.1) * 100) / 100)
        setVolume(newVol)
        setMuted(newVol === 0)
        v.volume = newVol
        v.muted = newVol === 0
        triggerFlash(newVol === 0 ? 'volumeMute' : 'volumeLow')
        resetIdleTimer()
        break
      }
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9': {
        if (duration > 0) {
          e.preventDefault()
          const pct = parseInt(e.key, 10) / 10
          const seekTime = pct * duration
          v.currentTime = seekTime
          setCurrentTime(seekTime)
          resetIdleTimer()
        }
        break
      }
    }
  }

  if (error) {
    return (
      <div className="preview__stage">
        <div className="preview__video-error" role="status">
          <div className="preview__empty-icon"><Icon name="fileVideo" size={40} /></div>
          <div className="preview__empty-title">Unable to render video</div>
          <div className="preview__empty-text">{error}</div>
          <div className="preview__video-actions">
            <button
              className="btn btn--ghost"
              onClick={() => {
                setError(null)
                setAttempt((value) => value + 1)
              }}
            >
              Try again
            </button>
            <button className="btn btn--primary" onClick={onDownload}>
              <Icon name="download" size={14} /> Download video
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0

  return (
    <div className="preview__stage">
      <div
        ref={containerRef}
        className={`video-player ${isIdle ? 'video-player--idle' : ''}`}
        tabIndex={0}
        onMouseMove={resetIdleTimer}
        onPointerMove={resetIdleTimer}
        onKeyDown={handleContainerKeyDown}
        aria-label="Video player"
      >
        <video
          ref={videoRef}
          key={attempt}
          className="video-player__media"
          src={src}
          autoPlay
          playsInline
          preload="auto"
          loop={loop}
          onClick={handleVideoClick}
          onError={handleFailed}
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={clearTimeoutCheck}
          onCanPlay={clearTimeoutCheck}
          onPlaying={() => {
            clearTimeoutCheck()
            setPlaying(true)
            setIsBuffering(false)
          }}
          onPause={() => {
            setPlaying(false)
            setIsIdle(false)
            if ((videoRef.current?.readyState ?? 0) >= 2) clearTimeoutCheck()
          }}
          onEnded={() => {
            clearTimeoutCheck()
            setPlaying(false)
            setIsIdle(false)
          }}
          onWaiting={() => {
            if (!videoRef.current?.paused) {
              setIsBuffering(true)
              waitForPlayback()
            }
          }}
          onSeeking={waitForPlayback}
          onSeeked={() => {
            setIsBuffering(false)
            if ((videoRef.current?.readyState ?? 0) >= 2) clearTimeoutCheck()
          }}
          onProgress={updateBuffered}
          onTimeUpdate={handleTimeUpdate}
        />

        {/* Buffering Spinner */}
        {isBuffering && (
          <div className="video-player__spinner-wrap" aria-label="Buffering">
            <div className="video-player__spinner" />
          </div>
        )}

        {/* Center Flash Action Icon */}
        {flashIcon && (
          <div key={flashKey} className="video-player__flash-icon" aria-hidden="true">
            <Icon name={flashIcon} size={32} />
          </div>
        )}

        {/* Bottom Overlay Controls */}
        <div className="video-player__overlay" onClick={(e) => e.stopPropagation()}>
          {/* Timeline Scrubber */}
          <div
            ref={timelineRef}
            className={`video-player__timeline-wrapper ${isScrubbing ? 'video-player__timeline-wrapper--scrubbing' : ''}`}
            onPointerDown={handleTimelinePointerDown}
            onPointerMove={handleTimelinePointerMove}
            onPointerUp={handleTimelinePointerUp}
            onPointerLeave={handleTimelinePointerLeave}
            onKeyDown={handleTimelineKeyDown}
            role="slider"
            aria-label="Video timeline scrubber"
            aria-valuemin={0}
            aria-valuemax={duration || 100}
            aria-valuenow={currentTime}
            tabIndex={0}
          >
            <div className="video-player__timeline-track">
              <div
                className="video-player__timeline-buffered"
                style={{ width: `${Math.min(100, Math.max(0, bufferedPercent))}%` }}
              />
              <div
                className="video-player__timeline-progress"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
              <div
                className="video-player__timeline-thumb"
                style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>

            {hoverFraction !== null && (
              <div
                className="video-player__hover-badge"
                style={{ left: `${hoverFraction * 100}%` }}
              >
                {formatVideoTime(hoverFraction * duration)}
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="video-player__controls">
            {/* Left Group */}
            <div className="video-player__group">
              <button
                type="button"
                className="video-btn video-btn--play"
                onClick={togglePlay}
                title={playing ? 'Pause (Space / K)' : 'Play (Space / K)'}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                <Icon name={playing ? 'pause' : 'play'} size={20} fill="currentColor" />
              </button>

              <button
                type="button"
                className="video-btn video-btn--icon"
                onClick={() => skip(-10)}
                title="Rewind 10s (Left Arrow)"
                aria-label="Rewind 10 seconds"
              >
                <Icon name="skipBack" size={18} />
              </button>

              <button
                type="button"
                className="video-btn video-btn--icon"
                onClick={() => skip(10)}
                title="Forward 10s (Right Arrow)"
                aria-label="Forward 10 seconds"
              >
                <Icon name="skipForward" size={18} />
              </button>

              <div className="video-player__volume-wrap">
                <button
                  type="button"
                  className="video-btn video-btn--icon"
                  onClick={toggleMute}
                  title={muted ? 'Unmute (M)' : 'Mute (M)'}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  <Icon
                    name={muted || volume === 0 ? 'volumeMute' : volume < 0.5 ? 'volumeLow' : 'volumeHigh'}
                    size={18}
                  />
                </button>
                <input
                  type="range"
                  className="video-player__volume-slider"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Video volume"
                  style={{
                    '--volume-percent': `${muted ? 0 : volume * 100}%`,
                  } as CSSProperties}
                />
              </div>

              <div className="video-player__time">
                <span>{formatVideoTime(currentTime)}</span>
                <span className="video-player__time-sep">/</span>
                <button
                  type="button"
                  className="video-player__time-btn"
                  onClick={() => setShowRemainingTime((v) => !v)}
                  title="Click to toggle remaining / total time"
                >
                  {showRemainingTime
                    ? formatVideoTime(Math.max(0, duration - currentTime), true)
                    : formatVideoTime(duration)}
                </button>
              </div>
            </div>

            {/* Right Group */}
            <div className="video-player__group">
              <button
                type="button"
                className="video-btn video-btn--speed"
                onClick={cycleSpeed}
                title="Playback speed"
                aria-label={`Playback speed ${speed}x`}
              >
                {speed}×
              </button>

              <button
                type="button"
                className={`video-btn video-btn--icon ${loop ? 'video-btn--active' : ''}`}
                onClick={toggleLoop}
                title={loop ? 'Disable loop (L)' : 'Enable loop (L)'}
                aria-label={loop ? 'Disable loop' : 'Enable loop'}
              >
                <Icon name={loop ? 'repeatOne' : 'repeat'} size={18} />
              </button>

              {isPipAvailable && (
                <button
                  type="button"
                  className={`video-btn video-btn--icon ${isPip ? 'video-btn--active' : ''}`}
                  onClick={togglePip}
                  title="Picture in Picture (P)"
                  aria-label="Picture in Picture"
                >
                  <Icon name="pip" size={18} />
                </button>
              )}

              <button
                type="button"
                className="video-btn video-btn--icon"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                <Icon name={isFullscreen ? 'minimize' : 'fullscreen'} size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
