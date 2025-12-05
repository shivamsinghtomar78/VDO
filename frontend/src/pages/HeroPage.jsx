import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui'
import { Navigation } from '../components/Layout'
import UploadModal from '../components/UploadModal'

export default function HeroPage() {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
      <Navigation onUpload={() => setShowUpload(true)} />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
      >
        <h1 className="text-5xl sm:text-6xl font-black mb-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
          Transform Videos Into Blogs
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Upload your video and get a ready-to-publish blog post with SEO metadata and image suggestions. Powered by AI.
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Button
            onClick={() => setShowUpload(true)}
            variant="primary"
            size="lg"
            className="transform hover:scale-105"
          >
            🚀 Upload Your Video
          </Button>
        </div>
      </motion.section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '📝', title: 'Blog Content', desc: 'AI-generated blog posts with proper structure' },
            { icon: '🔍', title: 'SEO Optimized', desc: 'Keywords, meta descriptions, and SEO scores' },
            { icon: '🖼️', title: 'Image Suggestions', desc: 'AI prompts for perfect blog images' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 text-center hover:border-emerald-500/30 transition-all"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>


      <UploadModal onClose={() => setShowUpload(false)} isOpen={showUpload} />
    </div>
  )
}
