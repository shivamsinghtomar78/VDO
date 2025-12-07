import { useState, useEffect, useRef } from 'react'

export default function BackgroundMusic({ src }) {
    const [isMuted, setIsMuted] = useState(false)
    const audioRef = useRef(null)

    useEffect(() => {
        // Attempt autoplay logic
        if (audioRef.current) {
            audioRef.current.volume = 0.4 // 40% volume
            const playPromise = audioRef.current.play()

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay prevented by browser:", error)
                    // Add a one-time click listener to start audio on user interaction
                    const startAudio = () => {
                        if (audioRef.current) {
                            audioRef.current.play()
                            document.removeEventListener('click', startAudio)
                        }
                    }
                    document.addEventListener('click', startAudio)
                })
            }
        }

        return () => {
            document.removeEventListener('click', () => { })
        }
    }, [src])

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted
            setIsMuted(!isMuted)
        }
    }

    if (!src) return null

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <button
                onClick={toggleMute}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all hover:scale-105"
                title={isMuted ? "Unmute Background Music" : "Mute Background Music"}
            >
                {isMuted ? '🔇' : '🔊'}
            </button>
            <audio
                ref={audioRef}
                src={src}
                loop
                playsInline
                autoPlay
            />
        </div>
    )
}
