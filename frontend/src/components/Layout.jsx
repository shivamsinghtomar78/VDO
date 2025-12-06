import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export function Navigation({ onUpload }) {
  const navigate = useNavigate()

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md border-b border-white/5" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10 flex items-center justify-between">
        {/* Logo */}
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
            <span className="text-2xl">✨</span>
          </div>
          <div className="hidden sm:block text-left">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-white">
              VideoBlog AI
            </h1>
            <p className="text-[10px] text-emerald-400/80 font-medium tracking-wider uppercase">
              Premium Converter
            </p>
          </div>
        </motion.button>

        {/* CTA Button */}
        <motion.button
          onClick={onUpload}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group px-6 py-2.5 rounded-xl font-semibold text-white overflow-hidden shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <div className="relative z-10 flex items-center gap-2">
            <span>🚀</span>
            <span>Start Creating</span>
          </div>
        </motion.button>
      </div>
    </motion.nav>
  )
}

