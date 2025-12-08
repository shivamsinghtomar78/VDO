import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingOverlay } from './Loading'
import { useToast } from './Toast'
import { uploadVideo, processYouTubeUrl } from '../utils/uploadService'
import { useLoading } from '../utils/loadingContext.jsx'

export default function UploadModal({ onClose, isOpen = false }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upload') // 'upload' or 'youtube'
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [templates, setTemplates] = useState({})
  const [selectedTemplate, setSelectedTemplate] = useState('standard')
  const toast = useToast()
  const { isLoading, startLoading, stopLoading } = useLoading()

  // Fetch templates on mount
  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (data.templates) {
          setTemplates(data.templates)
        }
      })
      .catch(err => {
        console.warn('Failed to fetch templates, using defaults', err)
        // Fallback defaults
        setTemplates({
          'standard': { name: 'Standard Blog Post', description: 'Balanced summary and analysis' },
          'tutorial': { name: 'Step-by-Step Tutorial', description: 'Instructional content' },
          'listicle': { name: 'Listicle / Top 10', description: 'List-based format' },
          'howto': { name: 'How-To Guide', description: 'Practical guide' },
          'opinion': { name: 'Opinion / Analysis', description: 'Critical perspective' },
          'news': { name: 'News / Update', description: 'Journalistic style' }
        })
      })
  }, [])

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

  const isValidYouTubeUrl = (url) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/
    return pattern.test(url)
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
      const data = await uploadVideo(file, selectedTemplate)
      console.log('Upload successful, data:', data)

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

  const handleYouTubeSubmit = async () => {
    if (!youtubeUrl) return

    if (!isValidYouTubeUrl(youtubeUrl)) {
      toast.error('❌ Invalid YouTube URL. Please enter a valid YouTube video link.')
      return
    }

    startLoading('🎬 Processing YouTube video...')
    toast.info('📺 Fetching YouTube transcript...')

    try {
      const data = await processYouTubeUrl(youtubeUrl, selectedTemplate)
      console.log('YouTube processing successful, data:', data)

      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach(warning => {
          toast.warning(`⚠️ ${warning}`)
        })
      } else {
        toast.success('✅ YouTube video processed successfully!')
      }

      stopLoading()
      navigate('/results', { state: { resultData: data } })
    } catch (error) {
      console.error('YouTube error:', error.message)
      toast.error(`❌ ${error.message || 'Failed to process YouTube video.'}`)
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
              className="relative bg-[#0f172a] rounded-3xl max-w-lg w-full p-1 overflow-hidden shadow-2xl shadow-emerald-500/10 border border-white/10 flex flex-col max-h-[90vh]"
            >
              {/* Animated Border Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20 opacity-50 pointer-events-none" />

              <div className="relative bg-[#020617]/90 backdrop-blur-xl rounded-[22px] p-6 lg:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <div className="text-center mb-6 flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                    <span className="text-3xl">{activeTab === 'upload' ? '☁️' : '📺'}</span>
                  </div>
                  <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    {activeTab === 'upload' ? 'Upload Video' : 'Paste Link'}
                  </h2>
                  <p className="text-gray-400">Transform your content into a viral blog post</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl flex-shrink-0">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${activeTab === 'upload'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    📁 Upload File
                  </button>
                  <button
                    onClick={() => setActiveTab('youtube')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${activeTab === 'youtube'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    📺 Video URL
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex-grow">
                  {/* Upload Tab Content */}
                  {activeTab === 'upload' && (
                    <>
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative group border-2 border-dashed rounded-2xl p-8 py-10 text-center cursor-pointer transition-all duration-300 overflow-hidden ${dragActive
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

                      <div className="mt-4 flex justify-between items-center text-xs text-gray-500 px-2">
                        <span>Supported: MP4, MOV, AVI</span>
                        <span>Max Size: 200MB</span>
                      </div>

                      <AnimatePresence>
                        {file && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex items-center gap-4"
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
                    </>
                  )}

                  {/* YouTube Tab Content */}
                  {activeTab === 'youtube' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <span className="text-2xl">🔗</span>
                        </div>
                        <input
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="Paste YouTube URL here..."
                          className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                        />
                      </div>

                      <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                        <p className="text-sm text-gray-400">
                          <span className="text-red-400 font-semibold">Supported formats:</span>
                        </p>
                        <ul className="text-xs text-gray-500 mt-2 space-y-1">
                          <li>• youtube.com/watch?v=VIDEO_ID</li>
                          <li>• youtu.be/VIDEO_ID</li>
                          <li>• youtube.com/shorts/VIDEO_ID</li>
                        </ul>
                      </div>

                      {youtubeUrl && isValidYouTubeUrl(youtubeUrl) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex items-center gap-3"
                        >
                          <span className="text-2xl">✅</span>
                          <p className="text-sm text-emerald-400 font-medium">Valid YouTube URL detected</p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Template Selection */}
                  <div className="mt-8">
                    <label className="block text-sm font-semibold text-gray-300 mb-3 pl-1">
                      Choose Blog Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(templates).map(([key, template]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedTemplate(key)}
                          className={`p-3 rounded-xl border text-left transition-all duration-200 ${selectedTemplate === key
                            ? 'bg-blue-600/20 border-blue-500/50 ring-1 ring-blue-500/50'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                            }`}
                        >
                          <div className="font-semibold text-sm text-gray-200 mb-0.5">
                            {template.name}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {template.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 flex-shrink-0">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl border border-white/10 transition-all duration-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  {activeTab === 'upload' ? (
                    <button
                      onClick={handleUpload}
                      disabled={!file || isLoading}
                      className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                      {isLoading ? 'Processing...' : 'Start Magic ✨'}
                    </button>
                  ) : (
                    <button
                      onClick={handleYouTubeSubmit}
                      disabled={!youtubeUrl || !isValidYouTubeUrl(youtubeUrl) || isLoading}
                      className="flex-1 px-4 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                      {isLoading ? 'Processing...' : 'Extract & Create ✨'}
                    </button>
                  )}
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
