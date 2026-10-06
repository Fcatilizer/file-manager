import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

const PLAYBACK_TIMEOUT_MS = 10_000

/** Native playback is shared by the private vault and public share modals. */
export default function VideoPreview({ src, onDownload }: { src: string; onDownload: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  function clearTimeoutCheck() {
    clearTimeout(timeout.current)
    timeout.current = undefined
  }

  function waitForPlayback() {
    // Progress/stalled events must not keep extending the same deadline.
    if (timeout.current !== undefined) return
    timeout.current = setTimeout(() => {
      timeout.current = undefined
      setError('No playable video arrived within 10 seconds. The connection may be slow, or your browser may not support this video’s container or codecs.')
    }, PLAYBACK_TIMEOUT_MS)
  }

  useEffect(() => {
    waitForPlayback()
    return clearTimeoutCheck
  }, [src, attempt])

  function failed() {
    clearTimeoutCheck()
    setError(video.current?.error?.code === 2
      ? 'The video could not be loaded because of a network error. Try again or download it to watch on your device.'
      : 'Your browser could not decode or load this video. Try again, or download it and open it in a compatible media player.')
  }

  return (
    <div className="preview__stage">
      {error ? (
        <div className="preview__video-error" role="status">
          <div className="preview__empty-icon"><Icon name="fileVideo" size={40} /></div>
          <div className="preview__empty-title">Unable to render video</div>
          <div className="preview__empty-text">{error}</div>
          <div className="preview__video-actions">
            <button className="btn btn--ghost" onClick={() => { setError(null); setAttempt((value) => value + 1) }}>Try again</button>
            <button className="btn btn--primary" onClick={onDownload}><Icon name="download" size={14} /> Download video</button>
          </div>
        </div>
      ) : (
        <video
          ref={video}
          key={attempt}
          className="preview__video"
          src={src}
          controls
          autoPlay
          playsInline
          preload="auto"
          onError={failed}
          onLoadedData={clearTimeoutCheck}
          onCanPlay={clearTimeoutCheck}
          onPlaying={clearTimeoutCheck}
          onEnded={clearTimeoutCheck}
          onPause={() => {
            // A deliberate pause (or blocked autoplay) is not a playback failure.
            if ((video.current?.readyState ?? 0) >= 2) clearTimeoutCheck()
          }}
          onWaiting={() => { if (!video.current?.paused) waitForPlayback() }}
          onSeeking={waitForPlayback}
          onSeeked={() => { if ((video.current?.readyState ?? 0) >= 2) clearTimeoutCheck() }}
        />
      )}
    </div>
  )
}
