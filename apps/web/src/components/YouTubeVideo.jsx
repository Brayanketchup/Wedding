import { useEffect, useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'

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

export default function YouTubeVideo({ onComplete }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const completeRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
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
          controls: 1,
          start: startSeconds,
          end: endSeconds,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            if (!active) return
            setReady(true)
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

  return (
    <div className="video-wrap">
      {!ready && <div className="video-loading"><span /><p>Cargando nuestro mensaje…</p></div>}
      <div ref={containerRef} className="youtube-player" />
      <div className="video-progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="sound-hint"><Volume2 size={15} /> Activa el sonido</div>
    </div>
  )
}
