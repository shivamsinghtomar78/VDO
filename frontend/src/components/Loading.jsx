import { motion } from 'framer-motion'

export function LoadingSpinner({ size = 'md' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeMap[size]} border-4 border-emerald-500/20 border-t-emerald-500 rounded-full`}
    />
  )
}

export function LoadingOverlay({ message = 'Processing...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-emerald-500/30 text-center"
      >
        <LoadingSpinner size="lg" />
        <p className="mt-6 text-gray-300 font-medium">{message}</p>
        <p className="mt-2 text-sm text-gray-500">This may take a few minutes...</p>
      </motion.div>
    </motion.div>
  )
}
