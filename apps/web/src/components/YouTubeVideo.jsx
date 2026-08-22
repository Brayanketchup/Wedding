import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

let youtubeApiPromise

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      resolve(window.YT)
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }
  })
  return youtubeApiPromise
}

export default function YouTubeVideo({ onComplete, copy }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const completeRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const videoId = import.meta.env.VITE_YOUTUBE_VIDEO_ID || 'aqz-KE-bpKQ'
  const startSeconds = Number(import.meta.env.VITE_YOUTUBE_START_SECONDS || 0)
  const endSeconds = startSeconds + 60

  useEffect(() => {
    let active = true
    let interval

    loadYouTubeApi().then((YT) => {
      if (!active || !containerRef.current) return
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          start: startSeconds,
          end: endSeconds,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            if (!active) return
            setReady(true)
            event.target.getIframe?.().setAttribute('tabindex', '-1')
            event.target.playVideo()
            interval = window.setInterval(() => {
              const current = event.target.getCurrentTime?.() || 0
              setProgress(Math.min(100, ((current - startSeconds) / 60) * 100))
              if (current >= endSeconds - 0.5 && !completeRef.current) {
                completeRef.current = true
                onComplete()
              }
            }, 300)
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) setPlaying(true)
            if ([YT.PlayerState.PAUSED, YT.PlayerState.CUED, YT.PlayerState.ENDED].includes(event.data)) setPlaying(false)
            if (event.data === YT.PlayerState.ENDED && !completeRef.current) {
              completeRef.current = true
              onComplete()
            }
          },
        },
      })
    })

    return () => {
      active = false
      window.clearInterval(interval)
      playerRef.current?.destroy?.()
    }
  }, [endSeconds, onComplete, startSeconds, videoId])

  function togglePlayback() {
    const player = playerRef.current
    if (!player) return
    if (player.getPlayerState?.() === window.YT?.PlayerState.PLAYING) player.pauseVideo()
    else player.playVideo()
  }

  return (
    <div className="video-wrap">
      {!ready && <div className="video-loading"><span /><p>{copy.videoLoading}</p></div>}
      <div ref={containerRef} className="youtube-player" />
      <button className={`video-toggle ${playing ? 'video-toggle--playing' : ''}`} type="button" onClick={togglePlayback} disabled={!ready} aria-label={playing ? copy.videoPause : copy.videoPlay}>
        <span>{playing ? <Pause size={28} fill="currentColor" /> : <Play size={30} fill="currentColor" />}</span>
      </button>
      <div className="video-progress"><span style={{ width: `${progress}%` }} /></div>
    </div>
  )
}
