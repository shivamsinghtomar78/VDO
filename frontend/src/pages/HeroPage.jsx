import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '../components/Layout'
import UploadModal from '../components/UploadModal'
import { processYouTubeUrl } from '../utils/uploadService'
import { useToast } from '../components/Toast'
import { useLoading } from '../utils/loadingContext'
import heroBg from '../assets/hero-bg.png'

export default function HeroPage() {
  const [showUpload, setShowUpload] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const navigate = useNavigate()
  const toast = useToast()
  const { isLoading, startLoading, stopLoading } = useLoading()

  const handleYouTubeSubmit = async (e) => {
    e.preventDefault()
    if (!youtubeUrl) return

    // Simple validation
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/
    if (!pattern.test(youtubeUrl)) {
      toast.error('❌ Invalid YouTube URL. Please enter a valid video link.')
      return
    }

    startLoading('🚀 Analyzing video content...')
    toast.info('📺 Fetching transcript & generating blog...')

    try {
      const data = await processYouTubeUrl(youtubeUrl, 'standard')

      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach(w => toast.warning(`⚠️ ${w}`))
      } else {
        toast.success('✨ Blog post generated successfully!')
      }

      stopLoading()
      navigate('/results', { state: { resultData: data } })
    } catch (error) {
      console.error('YouTube error:', error)
      toast.error(`❌ ${error.message || 'Failed to process video.'}`)
      stopLoading()
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden selection:bg-emerald-500/30 font-sans">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Background"
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#020617]/80 to-[#020617]" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <Navigation onUpload={() => setShowUpload(true)} />

      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto mb-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-white/10"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-300 tracking-wide">AI-Powered Content Engine • V2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1] text-white"
          >
            Turn Videos into
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-pulse-slow">
              Viral Blog Posts
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Instantly convert any YouTube video into SEO-optimized articles, social media threads, and ready-to-publish content.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-2xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <form onSubmit={handleYouTubeSubmit} className="relative flex items-center bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
              <div className="pl-4 text-2xl">🔗</div>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Paste YouTube Link (e.g. youtube.com/watch?v=...)"
                className="flex-1 bg-transparent border-none text-white placeholder-gray-500 text-lg px-4 py-3 focus:ring-0 focus:outline-none w-full"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !youtubeUrl}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Generate ✨"
                )}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-gray-500 text-sm"
          >
            Or <button onClick={() => setShowUpload(true)} className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-500 transition-all">upload a video file</button> directly
          </motion.div>
        </div>

        {/* Features / Floating Elements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full mb-10">
          {[
            {
              icon: '⚡',
              title: 'Lightning Fast',
              desc: 'Process hours of content in minutes with our advanced AI engine.',
              gradient: 'from-amber-500/20 to-orange-500/20'
            },
            {
              icon: '🎯',
              title: 'SEO Optimized',
              desc: 'Get content that ranks. Auto-generated keywords & meta tags.',
              gradient: 'from-emerald-500/20 to-teal-500/20'
            },
            {
              icon: '🎨',
              title: 'Creative Assets',
              desc: 'Includes AI image prompts & social media snippets.',
              gradient: 'from-purple-500/20 to-pink-500/20'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
              className={`group glass p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden border border-white/5 hover:border-white/10`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1 text-white">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <UploadModal onClose={() => setShowUpload(false)} isOpen={showUpload} />
    </div>
  )
}
