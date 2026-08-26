import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import LoadingBar from './LoadingBar'

const MuxPlayer = lazy(() => import('@mux/mux-player-react'))
const MOBILE_VIDEO_QUERY = '(orientation: portrait) and (max-width: 767px)'
const LANDSCAPE_PLAYBACK_ID = 'Ughwzeg8zSGmAbIg1mYx2nHoe5GFOYUA2UHORDY94QY'
const PORTRAIT_PLAYBACK_ID = 'jdQVuIz4N7qHY8Y02jZnbzz2500Ouff8PlTSCD9uX4zqM'

function matchesMobileVideo() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_VIDEO_QUERY).matches
}

export default function ResponsiveMuxVideo({ onComplete, copy }) {
  const playerRef = useRef(null)
  const playerReadyRef = useRef(false)
  const completeRef = useRef(false)
  const playbackSnapshotRef = useRef({ currentTime: 0, shouldPlay: true, restore: false })
  const [isMobile, setIsMobile] = useState(matchesMobileVideo)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)

  const orientation = isMobile ? 'portrait' : 'landscape'
  const playbackId = isMobile ? PORTRAIT_PLAYBACK_ID : LANDSCAPE_PLAYBACK_ID

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_VIDEO_QUERY)

    function handleBreakpointChange(event) {
      const player = playerRef.current
      if (player && playerReadyRef.current) {
        playbackSnapshotRef.current = {
          currentTime: Number.isFinite(player.currentTime) ? player.currentTime : 0,
          shouldPlay: !player.paused && !player.ended,
          restore: true,
        }
      }

      playerReadyRef.current = false
      setReady(false)
      setIsMobile(event.matches)
    }

    if (mediaQuery.matches !== isMobile) handleBreakpointChange(mediaQuery)
    if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', handleBreakpointChange)
    else mediaQuery.addListener(handleBreakpointChange)

    return () => {
      if (mediaQuery.removeEventListener) mediaQuery.removeEventListener('change', handleBreakpointChange)
      else mediaQuery.removeListener(handleBreakpointChange)
    }
  }, [isMobile])

  function restorePlayback() {
    const player = playerRef.current
    if (!player) return

    const snapshot = playbackSnapshotRef.current
    if (snapshot.restore && Number.isFinite(snapshot.currentTime)) {
      const latestTime = Number.isFinite(player.duration)
        ? Math.min(snapshot.currentTime, Math.max(0, player.duration - 0.1))
        : snapshot.currentTime
      player.currentTime = latestTime
    }

    playerReadyRef.current = true
    setReady(true)
    playbackSnapshotRef.current = { ...snapshot, restore: false }

    if (snapshot.shouldPlay) {
      player.play().catch(() => setPlaying(false))
    } else {
      player.pause()
      setPlaying(false)
    }
  }

  function updateProgress() {
    const player = playerRef.current
    if (!player || !Number.isFinite(player.duration) || player.duration <= 0) return
    setProgress(Math.min(100, (player.currentTime / player.duration) * 100))
  }

  function finishVideo() {
    setPlaying(false)
    setProgress(100)
    if (completeRef.current) return
    completeRef.current = true
    onComplete()
  }

  function togglePlayback() {
    const player = playerRef.current
    if (!player) return
    if (player.paused) player.play().catch(() => setPlaying(false))
    else player.pause()
  }

  return (
    <div className={`video-wrap video-wrap--${orientation}`}>
      {!ready && <div className="video-loading"><LoadingBar label={copy.videoLoading} light /></div>}
      <Suspense fallback={null}>
        <MuxPlayer
          key={orientation}
          ref={playerRef}
          className="mux-player"
          playbackId={playbackId}
          autoPlay
          playsInline
          preload="auto"
          nohotkeys
          metadata={{
            video_id: playbackId,
            video_title: `Annie and Jonathan wedding invitation (${orientation})`,
          }}
          style={{ '--controls': 'none' }}
          onLoadedMetadata={restorePlayback}
          onTimeUpdate={updateProgress}
          onPlay={() => setPlaying(true)}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={finishVideo}
        />
      </Suspense>
      <button className={`video-toggle ${playing ? 'video-toggle--playing' : ''}`} type="button" onClick={togglePlayback} disabled={!ready} aria-label={playing ? copy.videoPause : copy.videoPlay}>
        <span>{playing ? <Pause size={28} fill="currentColor" /> : <Play size={30} fill="currentColor" />}</span>
      </button>
      <div className="video-progress"><span style={{ width: `${progress}%` }} /></div>
    </div>
  )
}
