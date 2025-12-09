import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Navigation } from '../components/Layout'
import UploadModal from '../components/UploadModal'
import { MOCK_RESULT } from '../utils/mockData'


const SAMPLE_DATA = MOCK_RESULT

export default function ResultPage() {
  const [result, setResult] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState('blog')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.resultData) {
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
        </motion.div>
      </div>
    )
  }

  const heroImage = result.imageSuggestions?.find(img => img.type === 'hero' || img.section === 'Hero')?.imageUrl || result.imageSuggestions?.[0]?.imageUrl

  const downloadBlog = (format) => {
    const apiUrl = import.meta.env.VITE_API_URL || ''
    fetch(`${apiUrl}/api/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blog: result.blog, format: format })
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
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-serif selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/5 via-[#020617] to-teal-500/5 pointer-events-none" />
      <Navigation onUpload={() => setShowUpload(true)} dark={true} />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative pt-32 pb-24 px-6 max-w-[720px] mx-auto z-10"
      >
        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-[1.15] font-serif bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            {result.blog.title}
          </h1>
          <h2 className="text-xl text-slate-400 font-medium leading-relaxed mb-8 font-sans">
            {result.seo.metaDescription}
          </h2>

          {/* Quick Access Menu - Dark & Glassy */}
          <div className="flex flex-wrap gap-3 pb-8 mb-8 border-b border-white/10 font-sans">
            {[
              { id: 'blog', icon: '📖', label: 'Blog' },
              { id: 'seo', icon: '🎯', label: 'SEO' },
              { id: 'instagram', icon: '📸', label: 'Instagram' },
              { id: 'twitter', icon: '𝕏', label: 'Twitter' },
              { id: 'linkedin', icon: '💼', label: 'LinkedIn' },
              { id: 'facebook', icon: '👥', label: 'Facebook' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 group backdrop-blur-sm border ${activeTab === tab.id
                  ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/10'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20'
                  }`}
              >
                <span className="group-hover:scale-110 transition-transform">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* Hero Image */}
            {heroImage && (
              <motion.figure
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-16 -mx-6 md:-mx-12 relative group rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-50" />
                <img
                  src={heroImage}
                  alt={result.blog.title}
                  className="w-full h-auto aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <figcaption className="absolute bottom-4 left-4 right-4 text-center text-xs text-white/50 backdrop-blur-sm bg-black/30 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Generated by Freepik Mystic AI
                </figcaption>
              </motion.figure>
            )}

            {/* Article Body */}
            <article className="prose prose-lg prose-invert prose-headings:font-sans prose-headings:font-bold prose-headings:text-white prose-p:text-slate-300 prose-p:leading-8 prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white mb-20 max-w-none">
              {result.blog.sections.map((section, idx) => {
                // Check if we should insert an image here
                const sectionImage = result.imageSuggestions?.find(img => img.type === 'section');
                const showSectionImage = sectionImage && idx === 1; // Show after 2nd section

                return (
                  <div key={idx} className="mb-12">
                    <h2 className="text-3xl mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent inline-block">
                      {section.heading}
                    </h2>
                    <div className="whitespace-pre-wrap text-slate-300 leading-8 font-light">{section.content}</div>

                    {/* Interspersed Section Image */}
                    {showSectionImage && (
                      <motion.figure
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="my-12 -mx-6 md:-mx-12 rounded-xl overflow-hidden shadow-2xl border border-white/5"
                      >
                        <img
                          src={sectionImage.imageUrl}
                          alt={section.heading}
                          className="w-full h-auto aspect-video object-cover"
                        />
                      </motion.figure>
                    )}
                  </div>
                );
              })}

              {/* Conclusion Image */}
              {result.imageSuggestions?.find(img => img.type === 'footer') && (
                <motion.figure
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="mt-16 mb-8 rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20"
                >
                  <img
                    src={result.imageSuggestions.find(img => img.type === 'footer').imageUrl}
                    alt="Conclusion"
                    className="w-full h-[400px] object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
                  />
                </motion.figure>
              )}
            </article>
          </motion.div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10"
          >
            <h3 className="font-bold text-2xl text-white mb-8 flex items-center gap-3">
              <span className="text-3xl">🎯</span> SEO Analysis
            </h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-slate-400 font-medium">Optimization Score</span>
                  <span className="text-2xl font-bold text-emerald-400">{result.seo.seoScore}/100</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-4 p-1 border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.seo.seoScore}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                </div>
              </div>

              <div className="grid gap-6">
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                  <span className="text-slate-500 block mb-2 text-xs uppercase tracking-wider font-bold">SEO Title</span>
                  <p className="text-white font-medium">{result.seo.title}</p>
                </div>
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                  <span className="text-slate-500 block mb-2 text-xs uppercase tracking-wider font-bold">Meta Description</span>
                  <p className="text-slate-300 leading-relaxed">{result.seo.metaDescription}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-4 text-xs uppercase tracking-wider font-bold">Target Keywords</span>
                <div className="flex flex-wrap gap-2">
                  {result.seo.keywords.map((k) => (
                    <span
                      key={k}
                      className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-default"
                    >
                      #{k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Social Tabs (Generic Wrapper) */}
        {['instagram', 'twitter', 'linkedin', 'facebook'].includes(activeTab) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-8 rounded-3xl border backdrop-blur-xl ${activeTab === 'instagram'
              ? 'bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20'
              : activeTab === 'twitter'
                ? 'bg-gradient-to-br from-blue-400/10 to-sky-500/10 border-blue-400/20'
                : 'bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-600/20'
              }`}
          >
            <h3 className="font-bold text-2xl text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">
                {activeTab === 'instagram' ? '📸' : activeTab === 'twitter' ? '𝕏' : activeTab === 'linkedin' ? '💼' : '👥'}
              </span>
              <span className="capitalize">{activeTab} Post</span>
            </h3>

            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-6 shadow-inner">
              <p className="text-slate-300 whitespace-pre-wrap leading-7 font-light">
                {activeTab === 'twitter'
                  ? result.socialSnippets?.twitter?.singleTweet
                  : result.socialSnippets?.[activeTab]}
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(
                activeTab === 'twitter'
                  ? result.socialSnippets?.twitter?.singleTweet
                  : result.socialSnippets?.[activeTab]
              )}
              className={`w-full px-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-2 ${activeTab === 'instagram'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/20'
                : activeTab === 'twitter'
                  ? 'bg-black border border-white/20 hover:bg-white/10'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20'
                }`}
            >
              <span>📋</span> Copy to Clipboard
            </button>
          </motion.div>
        )}
      </motion.main>

      {/* Footer / Downloads */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#020617]/80 backdrop-blur-xl border-t border-white/10 font-sans z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="hidden md:block">
            <button
              onClick={() => navigate('/')}
              className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>←</span> Back to Dashboard
            </button>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => downloadBlog('markdown')}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all"
            >
              Copy Markdown
            </button>
            <button
              onClick={() => downloadBlog('html')}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
            >
              Download HTML
            </button>
          </div>
        </div>
      </div>

      <UploadModal onClose={() => setShowUpload(false)} isOpen={showUpload} />
    </div>
  )
}
