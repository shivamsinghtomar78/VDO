import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export function Navigation({ onUpload }) {
  const navigate = useNavigate()

  return (
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-black/30 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl">🎬</span>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200 bg-clip-text text-transparent">
                VideoBlog AI
              </h1>
            </div>
          </motion.button>

          {/* CTA Button */}
          <motion.button
            onClick={onUpload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-6 py-2.5 rounded-lg font-semibold text-white overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/50" />
            <span className="relative z-10">+ Upload Video</span>
          </motion.button>
        </div>
      </motion.nav>
  )
}

