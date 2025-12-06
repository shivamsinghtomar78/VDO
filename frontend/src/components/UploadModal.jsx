import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingOverlay } from './Loading'
import { useToast } from './Toast'
import { uploadVideo } from '../utils/uploadService'
import { useLoading } from '../utils/loadingContext.jsx'

export default function UploadModal({ onClose, isOpen = false }) {
  const navigate = useNavigate()
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const toast = useToast()
  const { isLoading, startLoading, stopLoading } = useLoading()

  if (!isOpen) return null

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.some(type => file.type.includes(type))) {
      toast.error('❌ Invalid file type. Please upload MP4, WebM, MOV, or AVI.')
      return
    }

    const maxSize = 200 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('❌ File size exceeds 200 MB limit')
      return
    }

    startLoading('🎬 Processing your video...')
    toast.info('📤 Uploading your video...')

    try {
      const data = await uploadVideo(file)
      console.log('Upload successful, data:', data)

      // Show warning if using mock/fallback data
      if (data.isMockData) {
        toast.warning('⚠️ Using mock data - AI service unavailable')
      } else if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach(warning => {
          toast.warning(`⚠️ ${warning}`)
        })
      } else {
        toast.success('✅ Video processed successfully!')
      }

      stopLoading()
      console.log('Navigating to results with data:', data)
      navigate('/results', { state: { resultData: data } })
    } catch (error) {
      console.error('Upload error:', error.message)
      toast.error(`❌ ${error.message || 'Upload failed. Please try again.'}`)
      stopLoading()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => !isLoading && onClose()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-[#0f172a] rounded-3xl max-w-lg w-full p-1 overflow-hidden shadow-2xl shadow-emerald-500/10 border border-white/10"
            >
              {/* Animated Border Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20 opacity-50 pointer-events-none" />

              <div className="relative bg-[#020617]/90 backdrop-blur-xl rounded-[22px] p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                    <span className="text-3xl">☁️</span>
                  </div>
                  <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Upload Video
                  </h2>
                  <p className="text-gray-400">Transform your content into a viral blog post</p>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative group border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 overflow-hidden ${dragActive
                      ? 'border-emerald-500 bg-emerald-500/5 scale-[1.02]'
                      : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/5'
                    }`}
                >
                  <div className="relative z-10">
                    <motion.div
                      animate={{ scale: dragActive ? 1.1 : 1, rotate: dragActive ? 10 : 0 }}
                      className="text-5xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      {dragActive ? '📂' : '📹'}
                    </motion.div>
                    <p className="font-bold text-white mb-2 text-lg group-hover:text-emerald-300 transition-colors">
                      {dragActive ? 'Drop it like it\'s hot!' : 'Drag & drop your video'}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">or</p>
                    <label className="relative inline-flex group/btn">
                      <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-xl blur-lg group-hover/btn:opacity-100 group-hover/btn:-inset-1 group-hover/btn:duration-200 animate-tilt"></div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="relative inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white transition-all duration-200 bg-slate-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 cursor-pointer">
                        Browse Files
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center text-xs text-gray-500 px-2">
                  <span>Supported: MP4, MOV, AVI</span>
                  <span>Max Size: 200MB</span>
                </div>

                <AnimatePresence>
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl">
                        🎬
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{file.name}</p>
                        <p className="text-xs text-emerald-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                        </p>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl border border-white/10 transition-all duration-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!file || isLoading}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    {isLoading ? 'Processing...' : 'Start Magic ✨'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
          {isLoading && <LoadingOverlay message="Creating your masterpiece..." />}
        </>
      )}
    </AnimatePresence>
  )
}
