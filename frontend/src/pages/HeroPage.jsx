import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '../components/Layout'
import UploadModal from '../components/UploadModal'

import heroBg from '../assets/hero-bg.png'

export default function HeroPage() {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Background"
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <Navigation onUpload={() => setShowUpload(true)} />

      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-300">AI-Powered Video Transformation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
          >
            Turn Videos into
            <br />
            <span className="text-gradient animate-pulse-slow">Viral Blog Posts</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Stop wasting hours transcribing. Upload any video and let our AI generate
            SEO-optimized articles, image prompts, and metadata in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              onClick={() => setShowUpload(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-bold text-lg text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 w-full sm:w-auto overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                🚀 Start Converting Free
              </span>
            </motion.button>


          </motion.div>
        </div>

        {/* Floating 3D Elements / Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            {
              icon: '⚡',
              title: 'Lightning Fast',
              desc: 'Process hours of video content in minutes with our advanced AI engine.',
              gradient: 'from-amber-500/20 to-orange-500/20',
              border: 'group-hover:border-amber-500/50'
            },
            {
              icon: '🎯',
              title: 'SEO Optimized',
              desc: 'Get content that ranks. Auto-generated keywords, meta tags, and structure.',
              gradient: 'from-emerald-500/20 to-teal-500/20',
              border: 'group-hover:border-emerald-500/50'
            },
            {
              icon: '🎨',
              title: 'Creative Assets',
              desc: 'Includes AI image prompts and social media snippets for your post.',
              gradient: 'from-purple-500/20 to-pink-500/20',
              border: 'group-hover:border-purple-500/50'
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
              className={`group glass p-8 rounded-3xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>


      </main>

      <UploadModal onClose={() => setShowUpload(false)} isOpen={showUpload} />
    </div>
  )
}
