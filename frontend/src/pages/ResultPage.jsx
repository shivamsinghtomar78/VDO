import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '../components/Layout'
import UploadModal from '../components/UploadModal'
import { MOCK_RESULT } from '../utils/mockData'
import heroBg from '../assets/hero-bg.png'

const SAMPLE_DATA = MOCK_RESULT

export default function ResultPage() {
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('blog')
  const [expandedSection, setExpandedSection] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    console.log('ResultPage mounted, location.state:', location.state)
    if (location.state?.resultData) {
      console.log('Setting result from location.state')
      setResult(location.state.resultData)
      return
    }

    const sampleMode = localStorage.getItem('sampleMode')
    const savedData = localStorage.getItem('resultData')

    if (sampleMode) {
      setResult(SAMPLE_DATA)
      localStorage.removeItem('sampleMode')
    } else if (savedData) {
      try {
        setResult(JSON.parse(savedData))
        localStorage.removeItem('resultData')
      } catch {
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [navigate, location])

  if (!result) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center relative z-10"
        >
          <div className="text-6xl mb-6 animate-bounce">🎬</div>
          <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-bold mb-8">
            Crafting your story...
          </p>
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ height: ['10px', '40px', '10px'], backgroundColor: ['#34d399', '#2dd4bf', '#34d399'] }}
                transition={{ duration: 1, delay: i * 0.15, repeat: Infinity }}
                className="w-2 rounded-full"
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
    element.setAttribute('download', `${result.blog.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`)
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
    <div className="min-h-screen bg-[#020617] relative selection:bg-emerald-500/30">

      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src={heroBg}
          alt="Background"
          className="w-full h-full object-cover opacity-20 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#020617]/90 to-[#020617]" />
      </div>

      <Navigation onUpload={() => setShowUpload(true)} />

      <main className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <button
              onClick={handleBackHome}
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">←</span>
              <span className="font-medium">Back to Home</span>
            </button>

            <div className="flex gap-3">
              <motion.button
                onClick={() => navigate('/answers')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-all flex items-center gap-2"
              >
                <span>✨</span> View Answers
              </motion.button>
              <motion.button
                onClick={downloadBlog}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
              >
                <span>📥</span> Download
              </motion.button>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-6 leading-tight">
            {result.blog.title}
          </h1>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">
              <span>✅</span> Complete
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
              <span>📊</span> {result.blog.sections.length} Sections
            </div>
            {result.transcript && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-sm font-medium border border-purple-500/20">
                <span>📝</span> {result.transcript.split(' ').length} Words
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <div className="sticky top-20 z-30 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl inline-flex gap-1 overflow-x-auto max-w-full">
            {[
              { id: 'blog', label: 'Blog Article', icon: '✍️' },
              { id: 'seo', label: 'SEO Metadata', icon: '🎯' },
              { id: 'images', label: 'Images', icon: '🖼️' },
              { id: 'social', label: 'Social Media', icon: '📱' },
              { id: 'export', label: 'Export', icon: '📤' },
              { id: 'transcript', label: 'Transcript', icon: '📋' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2
                  ${activeTab === tab.id ? 'text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}
                `}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Blog Tab */}
            {activeTab === 'blog' && (
              <div className="space-y-4">
                {result.blog.sections.map((section, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white/5 hover:bg-white/[0.07] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/20">
                          {idx + 1}
                        </span>
                        <h3 className="text-xl font-bold text-gray-100 group-hover:text-emerald-400 transition-colors">
                          {section.heading}
                        </h3>
                      </div>
                      <span className={`text-2xl text-gray-500 transition-transform duration-300 ${expandedSection === idx ? 'rotate-180 text-emerald-400' : ''}`}>
                        ↓
                      </span>
                    </button>
                    <AnimatePresence>
                      {expandedSection === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-0 border-t border-white/5">
                            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                              {section.content}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <span>📌</span> Meta Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Title Tag</label>
                        <p className="text-gray-200 mt-1 font-medium">{result.seo.title}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Meta Description</label>
                        <p className="text-gray-300 mt-1 leading-relaxed">{result.seo.metaDescription}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                      <span>🏷️</span> Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.seo.keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="relative w-40 h-40 mb-6">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                      <motion.circle
                        cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset="283"
                        animate={{ strokeDashoffset: 283 - (283 * result.seo.seoScore / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white">{result.seo.seoScore}</span>
                      <span className="text-xs text-emerald-400 font-bold uppercase">SEO Score</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Excellent Optimization!</h3>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Your content is well-optimized for search engines. Readability score: <span className="text-emerald-400 font-bold">{result.seo.readabilityScore}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.imageSuggestions.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all group"
                  >
                    {img.imageUrl ? (
                      <div className="aspect-video relative overflow-hidden group">
                        <img
                          src={img.imageUrl}
                          alt={img.prompt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <a
                            href={img.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white text-sm font-bold bg-purple-500/80 px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors"
                          >
                            View Full Size
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                        <span className="text-4xl">🖼️</span>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-purple-400">Section {idx + 1}: {img.section}</span>
                      </div>
                      <div className="bg-black/30 rounded-xl p-4 mb-4 border border-white/5">
                        <p className="text-gray-300 text-sm leading-relaxed italic">
                          "{img.prompt}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && result.socialSnippets && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Twitter */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-400/30 transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🐦</span>
                    <h3 className="text-lg font-bold text-white">Twitter Thread</h3>
                  </div>
                  <div className="space-y-4">
                    {result.socialSnippets.twitter.thread.map((tweet, i) => (
                      <div key={i} className="bg-black/30 p-4 rounded-xl border border-white/5 text-gray-300 text-sm">
                        {tweet}
                      </div>
                    ))}
                    <button
                      onClick={() => navigator.clipboard.writeText(result.socialSnippets.twitter.thread.join('\n\n'))}
                      className="w-full py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-500/20 transition-colors"
                    >
                      Copy Thread
                    </button>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-600/30 transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">💼</span>
                    <h3 className="text-lg font-bold text-white">LinkedIn Post</h3>
                  </div>
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-gray-300 text-sm whitespace-pre-wrap mb-4">
                    {result.socialSnippets.linkedin}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.socialSnippets.linkedin)}
                    className="w-full py-2 bg-blue-600/10 text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-600/20 transition-colors"
                  >
                    Copy Post
                  </button>
                </div>

                {/* Instagram */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-pink-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📸</span>
                    <h3 className="text-lg font-bold text-white">Instagram Caption</h3>
                  </div>
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-gray-300 text-sm whitespace-pre-wrap mb-4">
                    {result.socialSnippets.instagram}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.socialSnippets.instagram)}
                    className="w-full py-2 bg-pink-500/10 text-pink-400 rounded-lg text-sm font-bold hover:bg-pink-500/20 transition-colors"
                  >
                    Copy Caption
                  </button>
                </div>

                {/* Facebook */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">👥</span>
                    <h3 className="text-lg font-bold text-white">Facebook Post</h3>
                  </div>
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-gray-300 text-sm whitespace-pre-wrap mb-4">
                    {result.socialSnippets.facebook}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.socialSnippets.facebook)}
                    className="w-full py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-500/20 transition-colors"
                  >
                    Copy Post
                  </button>
                </div>
              </div>
            )}

            {/* Export Tab */}
            {activeTab === 'export' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Markdown', ext: '.md', icon: '📝', desc: 'Clean text format for developers', format: 'markdown' },
                  { name: 'HTML', ext: '.html', icon: '🌐', desc: 'Ready-to-publish web page', format: 'html' },
                  { name: 'WordPress', ext: '.json', icon: 'Wordpress', desc: 'Import directly to WordPress', format: 'wordpress' }
                ].map((option) => (
                  <button
                    key={option.name}
                    onClick={() => {
                      fetch('/api/export', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ blog: result.blog, format: option.format })
                      })
                        .then(res => res.json())
                        .then(data => {
                          const blob = new Blob([data.content], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${result.blog.title.slice(0, 20)}${data.extension}`;
                          a.click();
                        });
                    }}
                    className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-emerald-500/30 transition-all text-left"
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{option.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{option.name}</h3>
                    <p className="text-gray-400 text-sm mb-6">{option.desc}</p>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm group-hover:gap-3 transition-all">
                      Download {option.ext} <span>→</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Transcript Tab */}
            {activeTab === 'transcript' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>📋</span> Original Transcript
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.transcript)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    COPY TEXT
                  </button>
                </div>
                <div className="bg-black/30 rounded-xl p-6 border border-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                    {result.transcript || 'Transcript not available'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <UploadModal onClose={() => setShowUpload(false)} isOpen={showUpload} />
    </div>
  )
}
