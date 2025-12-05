import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui'
import { Navigation } from '../components/Layout'
import UploadModal from '../components/UploadModal'
import { MOCK_RESULT } from '../utils/mockData'

const SAMPLE_DATA = MOCK_RESULT

export default function ResultPage() {
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('blog')
  const [expandedSection, setExpandedSection] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
      if (location.state?.resultData) {
        console.log('✅ Found data in location.state')
        setResult(location.state.resultData)
        return
      }
      
      const sampleMode = localStorage.getItem('sampleMode')
      const savedData = localStorage.getItem('resultData')

      console.log('=== ResultPage useEffect ===')
      console.log('Current URL:', window.location.pathname)
      console.log('sampleMode:', sampleMode)
      console.log('savedData exists:', !!savedData)
      console.log('savedData length:', savedData?.length || 0)
      console.log('localStorage keys:', Object.keys(localStorage))

      if (sampleMode) {
        console.log('✅ Loading SAMPLE_DATA from sampleMode')
        setResult(SAMPLE_DATA)
        localStorage.removeItem('sampleMode')
      } else if (savedData) {
        try {
          console.log('🔍 Parsing savedData from localStorage')
          const parsed = JSON.parse(savedData)
          console.log('✅ Parsed data successfully')
          console.log('Parsed result:', parsed)
          setResult(parsed)
          localStorage.removeItem('resultData')
        } catch (error) {
          console.error('❌ Failed to parse resultData:', error)
          console.error('Raw savedData preview:', savedData?.substring(0, 200))
          navigate('/')
        }
      } else {
        console.log('❌ No user data found, redirecting to home')
        navigate('/')
      }
  }, [navigate, location])

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-xl text-emerald-400 font-semibold">Processing your video...</p>
          <div className="mt-6 flex gap-1 justify-center">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ height: ['10px', '30px', '10px'] }}
                transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}
                className="w-1 bg-gradient-to-t from-emerald-400 to-teal-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  const downloadBlog = () => {
    const content = `${result.blog.title}\n\n${result.blog.sections.map(s => `${s.heading}\n\n${s.content}`).join('\n\n---\n\n')}`
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', `${result.blog.title}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleBackHome = () => {
    localStorage.removeItem('resultData')
    localStorage.removeItem('sampleMode')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
      <Navigation onUpload={() => setShowUpload(true)} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-emerald-500/20 backdrop-blur-xl bg-gradient-to-r from-black/50 to-black/30"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <motion.button 
              onClick={handleBackHome}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            >
              ← Back to Home
            </motion.button>
            <div className="flex gap-3">
              <motion.button 
                onClick={() => navigate('/answers')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all flex items-center gap-2"
              >
                <span>✨</span>
                <span>View Answers</span>
              </motion.button>
              <motion.button 
                onClick={downloadBlog}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center gap-2"
              >
                <span>📥</span>
                <span>Download Blog</span>
              </motion.button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4 leading-tight">
              {result.blog.title}
            </h1>
            <p className="text-gray-400 text-lg mb-4 max-w-3xl">
              {result.blog.sections[0]?.content?.substring(0, 150)}...
            </p>
          </motion.div>
          <div className="flex gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold border border-emerald-500/40">
              <span>✅</span>
              <span>Processing Complete</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 text-teal-300 text-sm font-semibold border border-teal-500/40">
              <span>📊</span>
              <span>{result.blog.sections.length} Sections</span>
            </div>
            {result.transcript && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 text-sm font-semibold border border-cyan-500/40">
                <span>📝</span>
                <span>{result.transcript.split(' ').length} Words</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-emerald-500/10 sticky top-0 z-40 backdrop-blur-xl bg-black/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'blog', label: '📝 Blog Article', icon: '✍️' },
              { id: 'seo', label: '🔍 SEO Metadata', icon: '🎯' },
              { id: 'images', label: '🖼️ Image Suggestions', icon: '🎨' },
              { id: 'transcript', label: '📄 Transcript', icon: '📋' }
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`py-4 px-4 border-b-2 font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Blog Tab */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30"
              >
                <p className="text-sm text-emerald-300 font-semibold mb-2">📌 Blog Overview</p>
                <p className="text-gray-300 leading-relaxed">
                  This blog post contains {result.blog.sections.length} carefully crafted sections, optimized for readability and SEO performance.
                </p>
              </motion.div>

              {result.blog.sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="overflow-hidden rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all duration-300"
                >
                  <button
                    onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
                    className="w-full text-left p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                          {section.heading}
                        </h2>
                      </div>
                      <motion.span
                        animate={{ rotate: expandedSection === idx ? 180 : 0 }}
                        className="text-2xl text-emerald-400"
                      >
                        ▼
                      </motion.span>
                    </div>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: expandedSection === idx ? 'auto' : 0, opacity: expandedSection === idx ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <p className="text-gray-300 leading-relaxed p-6 whitespace-pre-wrap text-lg bg-black/20">
                      {section.content}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30"
              >
                <p className="text-sm text-blue-300 font-semibold mb-2">🔍 SEO Optimization</p>
                <p className="text-gray-300 leading-relaxed">
                  Your content is optimized for search engines with strategic keywords and meta descriptions.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-8 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl">📌</span>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-emerald-400">SEO Title</h3>
                      <p className="text-gray-300 font-semibold mb-2">{result.seo.title}</p>
                      <p className="text-sm text-gray-500">
                        Length: {result.seo.title.length} characters <span className={result.seo.title.length > 50 && result.seo.title.length < 60 ? 'text-emerald-400' : 'text-amber-400'}>({result.seo.title.length > 50 && result.seo.title.length < 60 ? '✓ Optimal' : '⚠ Adjust'})</span>
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-8 hover:border-teal-500/30 transition-all"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl">📝</span>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-emerald-400">Meta Description</h3>
                      <p className="text-gray-300 font-semibold mb-2">{result.seo.metaDescription}</p>
                      <p className="text-sm text-gray-500">
                        Length: {result.seo.metaDescription.length} characters <span className={result.seo.metaDescription.length > 150 && result.seo.metaDescription.length < 160 ? 'text-emerald-400' : 'text-amber-400'}>({result.seo.metaDescription.length > 150 && result.seo.metaDescription.length < 160 ? '✓ Optimal' : '⚠ Adjust'})</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🏷️</span>
                  <h3 className="font-bold text-lg text-emerald-400">Keywords ({result.seo.keywords.length})</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {result.seo.keywords.length > 0 ? (
                    result.seo.keywords.map((keyword, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 font-semibold border border-emerald-500/40 hover:border-emerald-500/60 transition-all cursor-pointer"
                      >
                        {keyword}
                      </motion.span>
                    ))
                  ) : (
                    <p className="text-gray-400">No keywords generated</p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">📊</span>
                  <h3 className="font-bold text-lg text-emerald-400">SEO Performance</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-300 font-semibold">Overall SEO Score</span>
                      <span className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{result.seo.seoScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.seo.seoScore}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full shadow-lg shadow-emerald-500/50"
                      ></motion.div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-semibold">Readability Score</span>
                      <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">{result.seo.readabilityScore}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30"
              >
                <p className="text-sm text-purple-300 font-semibold mb-2">🎨 AI Image Suggestions</p>
                <p className="text-gray-300 leading-relaxed">
                  Get AI-powered image suggestions for each section of your blog. Use these prompts with any image generation tool.
                </p>
              </motion.div>

              {result.imageSuggestions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {result.imageSuggestions.map((img, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl border border-purple-500/30 overflow-hidden hover:border-purple-500/50 transition-all"
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {idx + 1}
                          </div>
                          <h3 className="font-bold text-lg text-purple-400">{img.section}</h3>
                        </div>
                        <div className="bg-gradient-to-br from-slate-700/30 to-slate-600/30 rounded-lg p-8 mb-4 border-2 border-dashed border-purple-500/40 flex items-center justify-center min-h-32">
                          <p className="text-4xl">🖼️</p>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-400 font-semibold mb-2">💡 Image Prompt:</p>
                          <p className="text-gray-300 leading-relaxed italic bg-black/30 p-3 rounded-lg">
                            {img.prompt}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                        >
                          🎨 Generate Image with AI
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No image suggestions available</p>
                </div>
              )}
            </div>
          )}

          {/* Transcript Tab */}
          {activeTab === 'transcript' && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30"
              >
                <p className="text-sm text-cyan-300 font-semibold mb-2">📋 Original Video Transcript</p>
                <p className="text-gray-300 leading-relaxed">
                  This is the original transcript extracted from your video, automatically converted to text.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl border border-cyan-500/30 overflow-hidden"
              >
                <div className="p-8 max-h-96 overflow-y-auto">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                    {result.transcript || 'Transcript not available'}
                  </p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6 text-center"
                >
                  <p className="text-4xl mb-2">📝</p>
                  <p className="text-gray-500 text-sm mb-1">Word Count</p>
                  <p className="text-2xl font-bold text-emerald-400">{result.transcript.split(/\s+/).filter(w => w).length}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6 text-center"
                >
                  <p className="text-4xl mb-2">⏱️</p>
                  <p className="text-gray-500 text-sm mb-1">Read Time</p>
                  <p className="text-2xl font-bold text-emerald-400">{Math.ceil(result.transcript.split(/\s+/).filter(w => w).length / 200)} min</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-white/10 p-6 text-center"
                >
                  <p className="text-4xl mb-2">📊</p>
                  <p className="text-gray-500 text-sm mb-1">Character Count</p>
                  <p className="text-2xl font-bold text-emerald-400">{result.transcript.length.toLocaleString()}</p>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-900/40 via-teal-900/40 to-cyan-900/40 border-y border-emerald-500/20 py-16 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Ready to Publish Your Blog?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Export your complete blog with SEO metadata and share it anywhere. Your content is ready for the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/answers')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-teal-500/50 transition-all"
              >
                ✨ View Key Answers
              </motion.button>
              <motion.button
                onClick={downloadBlog}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
              >
                📥 Download Blog Package
              </motion.button>
              <motion.button
                onClick={handleBackHome}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-lg bg-white/10 text-white font-bold text-lg hover:bg-white/20 border border-white/20 transition-all"
              >
                🎬 Process Another Video
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <UploadModal onClose={() => setShowUpload(false)} isOpen={showUpload} />
    </div>
  )
}
