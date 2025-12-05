import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui'
import { LoadingOverlay } from './Loading'
import { useToast } from './Toast'
import { uploadVideo } from '../utils/uploadService'
import { useLoading } from '../utils/loadingContext.jsx'

export default function UploadModal({ onClose, isOpen = false }) {
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
      console.log('Starting upload...')
      const data = await uploadVideo(file)
      
      console.log('Upload successful, received data:', data)
      console.log('Data structure:', {
        hasJobId: !!data.jobId,
        hasStatus: !!data.status,
        hasBlog: !!data.blog,
        hasSeo: !!data.seo,
        hasImageSuggestions: Array.isArray(data.imageSuggestions),
        isMockData: !!data.isMockData
      })
      
      const jsonString = JSON.stringify(data)
      console.log('JSON string length:', jsonString.length)
      console.log('Setting localStorage resultData...')
      
      if (!data.isMockData) {
        localStorage.setItem('resultData', jsonString)
        localStorage.removeItem('sampleMode')
        console.log('Verified localStorage - resultData size:', localStorage.getItem('resultData')?.length)
        toast.success('✅ Video processed successfully!')
      } else {
        toast.warning('⚠️ Using mock data - AI service unavailable')
        localStorage.setItem('resultData', jsonString)
        console.log('Set mock data to localStorage')
      }
      
      console.log('Redirecting to /results in 500ms...')
      setTimeout(() => {
        console.log('Executing redirect to /results')
        console.log('localStorage.resultData still exists:', !!localStorage.getItem('resultData'))
        window.location.href = '/results'
      }, 500)
    } catch (error) {
      console.error('Upload error:', error)
      console.error('Error stack:', error.stack)
      toast.error(`❌ ${error.message || 'Upload failed. Please try again.'}`)
      stopLoading()
    }
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-md w-full p-8 border border-emerald-500/30 shadow-2xl"
      >
        <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Upload Your Video
        </h2>
        <p className="text-gray-400 mb-6">Transform it into a blog in minutes - completely free!</p>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-500/10 scale-105' 
              : 'border-gray-600 hover:border-emerald-500/50 bg-slate-800/50'
          }`}
        >
          <motion.div
            animate={{ scale: dragActive ? 1.1 : 1 }}
            className="text-6xl mb-4"
          >
            {dragActive ? '🎯' : '📹'}
          </motion.div>
          <p className="font-bold text-white mb-2 text-lg">
            {dragActive ? 'Drop your video here' : 'Drag & drop your video'}
          </p>
          <p className="text-sm text-gray-400 mb-4">or</p>
          <label>
            <input
              type="file"
              accept="video/*"
              onChange={handleChange}
              className="hidden"
            />
            <span className="text-emerald-400 font-bold hover:text-emerald-300 cursor-pointer underline">
              Browse files
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-4">
            Supports MP4, WebM, MOV, AVI • Max 200 MB
          </p>
        </div>

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/30"
          >
            <p className="font-bold text-sm text-gray-300 mb-2">✓ File Selected:</p>
            <p className="text-sm text-gray-400 break-all font-mono">{file.name}</p>
            <p className="text-xs text-gray-500 mt-2">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </motion.div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/50 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 transform hover:scale-105 active:scale-95"
          >
            {isLoading ? '⏳ Uploading...' : '🚀 Upload & Convert'}
          </button>
        </div>
      </motion.div>
    </motion.div>
    {isLoading && <LoadingOverlay message="🎬 Processing your video..." />}
    </>
  )
}
