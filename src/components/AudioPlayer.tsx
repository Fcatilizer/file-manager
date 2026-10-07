import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { Icon } from './Icon'
import {
  DEFAULT_WAVEFORM_BARS,
  formatAudioTime,
  generateSyntheticWaveform,
  loadWaveformData,
} from '../lib/waveform'
import '../styles/audio-player.css'

export interface AudioPlayerProps {
  src: string
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

const SPEED_PRESETS = [0.75, 1, 1.25, 1.5, 2]

export default function AudioPlayer({
  src,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const waveformRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.85)
  const [muted, setMuted] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off')
  const [shuffle, setShuffle] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [error, setError] = useState('')

  const [peaks, setPeaks] = useState<number[]>(() => generateSyntheticWaveform(src))
  const [hoverFraction, setHoverFraction] = useState<number | null>(null)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [showRemainingTime, setShowRemainingTime] = useState(true)

  // Load / decode waveform data
  useEffect(() => {
    const controller = new AbortController()
    setPeaks(generateSyntheticWaveform(src))

    void loadWaveformData(src, DEFAULT_WAVEFORM_BARS, controller.signal).then((loadedPeaks) => {
      if (!controller.signal.aborted) {
        setPeaks(loadedPeaks)
      }
    })

    return () => controller.abort()
  }, [src])

  // High-frequency smooth animation loop during playback
  useEffect(() => {
    let frameId: number
    const tick = () => {
      if (audioRef.current && !audioRef.current.paused && !isScrubbing) {
        setCurrentTime(audioRef.current.currentTime)
        frameId = requestAnimationFrame(tick)
      }
    }
    if (playing && !isScrubbing) {
      frameId = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(frameId)
  }, [playing, isScrubbing])

  // Media Controls Handlers
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play().catch(() => {
        setError('Playback was prevented by the browser. Click play to listen.')
      })
    }
  }

  const handlePrev = () => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
    } else if (hasPrev && onPrev) {
      onPrev()
    } else if (audio) {
      audio.currentTime = 0
      setCurrentTime(0)
    }
  }

  const handleNext = () => {
    if (hasNext && onNext) {
      onNext()
    } else if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10)
    }
  }

  const cycleRepeat = () => {
    setRepeat((current) => {
      if (current === 'off') return 'all'
      if (current === 'all') return 'one'
      return 'off'
    })
  }

  const cycleSpeed = () => {
    const nextIdx = (SPEED_PRESETS.indexOf(speed) + 1) % SPEED_PRESETS.length
    const nextSpeed = SPEED_PRESETS[nextIdx]
    setSpeed(nextSpeed)
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed
  }

  const toggleMute = () => {
    setMuted((current) => {
      const next = !current
      if (audioRef.current) audioRef.current.muted = next
      return next
    })
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    setMuted(val === 0)
    if (audioRef.current) {
      audioRef.current.volume = val
      audioRef.current.muted = val === 0
    }
  }

  const handleEnded = () => {
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        void audioRef.current.play()
      }
    } else if (repeat === 'all') {
      if (hasNext && onNext) {
        onNext()
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0
        void audioRef.current.play()
      }
    } else if (shuffle && hasNext && onNext) {
      onNext()
    } else if (hasNext && onNext) {
      onNext()
    } else {
      setPlaying(false)
      if (audioRef.current) audioRef.current.currentTime = 0
    }
  }

  // Waveform pointer & scrub handlers
  const getFractionFromEvent = (e: PointerEvent<HTMLDivElement>): number => {
    if (!waveformRef.current) return 0
    const rect = waveformRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    return Math.max(0, Math.min(1, x / rect.width))
  }

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!duration) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsScrubbing(true)
    const fraction = getFractionFromEvent(e)
    const newTime = fraction * duration
    setCurrentTime(newTime)
    if (audioRef.current) audioRef.current.currentTime = newTime
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const fraction = getFractionFromEvent(e)
    if (isScrubbing) {
      const newTime = fraction * duration
      setCurrentTime(newTime)
      if (audioRef.current) audioRef.current.currentTime = newTime
    } else {
      setHoverFraction(fraction)
    }
  }

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // Ignore pointer capture errors
      }
      setIsScrubbing(false)
    }
  }

  const handlePointerLeave = () => {
    if (!isScrubbing) setHoverFraction(null)
  }

  const handleWaveformKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!duration || !audioRef.current) return
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
    setCurrentTime(newTime)
    audioRef.current.currentTime = newTime
  }

  const progress = duration > 0 ? currentTime / duration : 0
  const numBars = peaks.length

  return (
    <div className="audio-player">
      {/* Waveform & Progress */}
      <div className="audio-waveform-wrapper">
        <div
          ref={waveformRef}
          className={`audio-waveform ${isScrubbing ? 'audio-waveform--scrubbing' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onKeyDown={handleWaveformKeyDown}
          tabIndex={0}
          role="slider"
          aria-label="Audio progress scrubber"
          aria-valuemin={0}
          aria-valuemax={duration || 100}
          aria-valuenow={currentTime}
        >
          <svg
            className="audio-waveform__svg"
            viewBox="0 0 640 52"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {peaks.map((peak, index) => {
              const barHeight = Math.max(6, peak * 46)
              const y = (52 - barHeight) / 2
              const x = index * 10 + 2.5
              const barProgress = (index + 0.5) / numBars
              const isPlayed = barProgress <= progress
              const isHovered = hoverFraction !== null && barProgress <= hoverFraction

              let barClass = 'audio-waveform__bar'
              if (isPlayed) barClass += ' audio-waveform__bar--played'
              else barClass += ' audio-waveform__bar--unplayed'
              if (isHovered && !isPlayed) barClass += ' audio-waveform__bar--hovered'

              return (
                <rect
                  key={index}
                  x={x}
                  y={y}
                  width={5}
                  height={barHeight}
                  rx={2.5}
                  ry={2.5}
                  className={barClass}
                />
              )
            })}
          </svg>

          {hoverFraction !== null && duration > 0 && (
            <div
              className="audio-waveform__hover-badge"
              style={{ left: `${hoverFraction * 100}%` }}
              aria-hidden="true"
            >
              {formatAudioTime(hoverFraction * duration)}
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="audio-waveform__timestamps">
          <span className="audio-waveform__time audio-waveform__time--elapsed">
            {formatAudioTime(currentTime)}
          </span>
          <button
            type="button"
            className="audio-waveform__time audio-waveform__time--duration"
            onClick={() => setShowRemainingTime(!showRemainingTime)}
            title="Click to toggle remaining / total duration"
            aria-label="Toggle duration display"
          >
            {showRemainingTime
              ? formatAudioTime(Math.max(0, duration - currentTime), true)
              : formatAudioTime(duration)}
          </button>
        </div>
      </div>

      {/* Primary Playback Controls */}
      <div className="audio-controls-primary">
        <button
          type="button"
          className="audio-btn audio-btn--circle"
          onClick={handlePrev}
          disabled={!hasPrev && currentTime === 0}
          title={hasPrev ? 'Previous track' : 'Restart track'}
          aria-label={hasPrev ? 'Previous track' : 'Restart track'}
        >
          <Icon name="skipBack" size={20} />
        </button>

        <button
          type="button"
          className="audio-btn audio-btn--play-pause"
          onClick={togglePlay}
          title={playing ? 'Pause' : 'Play'}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <Icon name={playing ? 'pause' : 'play'} size={24} fill="currentColor" />
        </button>

        <button
          type="button"
          className="audio-btn audio-btn--circle"
          onClick={handleNext}
          disabled={!hasNext && currentTime >= duration}
          title={hasNext ? 'Next track' : 'Skip ahead'}
          aria-label={hasNext ? 'Next track' : 'Skip ahead'}
        >
          <Icon name="skipForward" size={20} />
        </button>
      </div>

      {/* Volume Slider */}
      <div className="audio-volume-row">
        <button
          type="button"
          className="audio-btn audio-btn--icon-only"
          onClick={toggleMute}
          title={muted || volume === 0 ? 'Unmute' : 'Mute'}
          aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'}
        >
          <Icon
            name={muted || volume === 0 ? 'volumeMute' : volume < 0.5 ? 'volumeLow' : 'volumeHigh'}
            size={18}
          />
        </button>
        <div className="audio-volume-track-wrap">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="audio-volume-slider"
            style={{ '--volume-percent': `${(muted ? 0 : volume) * 100}%` } as CSSProperties}
            aria-label="Volume"
          />
        </div>
        <span className="audio-volume-end-icon" aria-hidden="true">
          <Icon name="volumeHigh" size={17} />
        </span>
      </div>

      {/* Secondary Controls (Shuffle, Repeat, Speed) */}
      <div className="audio-controls-secondary">
        <button
          type="button"
          className={`audio-btn audio-btn--chip ${shuffle ? 'audio-btn--active' : ''}`}
          onClick={() => setShuffle(!shuffle)}
          title={shuffle ? 'Shuffle: On' : 'Shuffle: Off'}
          aria-label="Toggle shuffle"
          aria-pressed={shuffle}
        >
          <Icon name="shuffle" size={16} />
        </button>

        <button
          type="button"
          className={`audio-btn audio-btn--chip ${repeat !== 'off' ? 'audio-btn--active' : ''}`}
          onClick={cycleRepeat}
          title={
            repeat === 'one'
              ? 'Repeat: Current track'
              : repeat === 'all'
                ? 'Repeat: All'
                : 'Repeat: Off'
          }
          aria-label="Toggle repeat mode"
        >
          <Icon name={repeat === 'one' ? 'repeatOne' : 'repeat'} size={16} />
          {repeat === 'one' && <span className="audio-repeat-badge">1</span>}
        </button>

        <button
          type="button"
          className="audio-btn audio-btn--chip audio-btn--speed"
          onClick={cycleSpeed}
          title="Playback speed"
          aria-label={`Playback speed: ${speed}x`}
        >
          <span>{speed}×</span>
        </button>
      </div>

      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        loop={repeat === 'one'}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onTimeUpdate={() => {
          if (audioRef.current && !isScrubbing) {
            setCurrentTime(audioRef.current.currentTime)
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0)
            audioRef.current.playbackRate = speed
            audioRef.current.volume = muted ? 0 : volume
          }
        }}
        onError={() => {
          setPlaying(false)
          setError('Unable to play this audio file. The format may be unsupported.')
        }}
        style={{ display: 'none' }}
      />

      {error && (
        <p className="audio-error-msg" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
