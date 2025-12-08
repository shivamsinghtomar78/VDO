import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Navigation } from '../components/Layout'
import UploadModal from '../components/UploadModal'
import { MOCK_RESULT } from '../utils/mockData'
import heroBg from '../assets/hero-bg.png'

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
    fetch('/api/export', {
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
    <div className="min-h-screen bg-[#ffffff] text-slate-900 font-serif selection:bg-emerald-100 selection:text-emerald-900">
      <Navigation onUpload={() => setShowUpload(true)} dark={false} />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-32 pb-24 px-6 max-w-[720px] mx-auto"
      >
        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.15] font-serif">
            {result.blog.title}
          </h1>
          <h2 className="text-xl text-slate-500 font-medium leading-relaxed mb-8 font-sans">
            {result.seo.metaDescription}
          </h2>

          {/* Quick Access Menu */}
          <div className="flex flex-wrap gap-4 pb-8 mb-8 border-b border-slate-100 font-sans">
            <button onClick={() => setActiveTab('blog')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:border-slate-400 hover:text-slate-900 transition-all group">
              <span className="group-hover:scale-110 transition-transform">📖</span> Blog
            </button>
            <button onClick={() => setActiveTab('seo')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:border-slate-400 hover:text-slate-900 transition-all group">
              <span className="group-hover:scale-110 transition-transform">🎯</span> SEO Data
            </button>
            <button onClick={() => setActiveTab('instagram')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:border-pink-300 hover:text-pink-600 transition-all group">
              <span className="group-hover:scale-110 transition-transform">📸</span> Instagram
            </button>
            <button onClick={() => setActiveTab('twitter')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:border-blue-300 hover:text-blue-500 transition-all group">
              <span className="group-hover:scale-110 transition-transform">𝕏</span> Twitter
            </button>
            <button onClick={() => setActiveTab('linkedin')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:border-blue-700 hover:text-blue-700 transition-all group">
              <span className="group-hover:scale-110 transition-transform">💼</span> LinkedIn
            </button>
            <button onClick={() => setActiveTab('facebook')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:border-blue-600 hover:text-blue-600 transition-all group">
              <span className="group-hover:scale-110 transition-transform">👥</span> Facebook
            </button>
          </div>
        </header>

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <>
            {/* Hero Image */}
            {heroImage && (
              <motion.figure
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-16 -mx-6 md:-mx-12"
              >
                <img
                  src={heroImage}
                  alt={result.blog.title}
                  className="w-full h-auto aspect-video object-cover rounded-md shadow-sm"
                />
              </motion.figure>
            )}

            {/* Article Body */}
            <article className="prose prose-lg prose-slate prose-headings:font-sans prose-headings:font-bold prose-p:text-slate-800 prose-p:leading-8 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline mb-20 max-w-none">
              {result.blog.sections.map((section, idx) => (
                <div key={idx} className="mb-12">
                  <h2 className="text-3xl mb-6 text-slate-900">{section.heading}</h2>
                  <div className="whitespace-pre-wrap text-slate-700 leading-8">{section.content}</div>
                </div>
              ))}
            </article>
          </>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-2xl text-slate-900 mb-6 flex items-center gap-2">
              <span>🎯</span> SEO Analysis
            </h3>
            <div className="space-y-6">
              <div>
                <span className="text-slate-500 block mb-2 font-bold">SEO Score</span>
                <div className="flex items-center gap-4">
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${result.seo.seoScore}%` }}></div>
                  </div>
                  <span className="font-bold text-emerald-600 text-lg">{result.seo.seoScore}/100</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block mb-3 font-bold">SEO Title</span>
                <p className="text-slate-700 bg-white p-3 rounded border border-slate-200">{result.seo.title}</p>
              </div>
              <div>
                <span className="text-slate-500 block mb-3 font-bold">Meta Description</span>
                <p className="text-slate-700 bg-white p-3 rounded border border-slate-200">{result.seo.metaDescription}</p>
              </div>
              <div>
                <span className="text-slate-500 block mb-3 font-bold">Keywords</span>
                <div className="flex flex-wrap gap-2">
                  {result.seo.keywords.map(k => (
                    <span key={k} className="px-3 py-1 bg-white border border-emerald-200 rounded-full text-sm font-medium text-emerald-700">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instagram Tab */}
        {activeTab === 'instagram' && (
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-2xl border border-pink-200">
            <h3 className="font-bold text-2xl text-slate-900 mb-6 flex items-center gap-2">
              <span>📸</span> Instagram Caption
            </h3>
            <div className="bg-white p-6 rounded-xl border border-pink-200 mb-4">
              <p className="text-slate-700 whitespace-pre-wrap leading-7">{result.socialSnippets?.instagram}</p>
            </div>
            <button
              onClick={() => copyToClipboard(result.socialSnippets?.instagram)}
              className="w-full px-6 py-3 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold transition-colors"
            >
              📋 Copy Caption
            </button>
          </div>
        )}

        {/* Twitter Tab */}
        {activeTab === 'twitter' && (
          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200">
            <h3 className="font-bold text-2xl text-slate-900 mb-6 flex items-center gap-2">
              <span>𝕏</span> Twitter/X Post
            </h3>
            <div className="bg-white p-6 rounded-xl border border-blue-200 mb-4">
              <p className="text-slate-700 whitespace-pre-wrap leading-7">{result.socialSnippets?.twitter?.singleTweet}</p>
            </div>
            <button
              onClick={() => copyToClipboard(result.socialSnippets?.twitter?.singleTweet)}
              className="w-full px-6 py-3 rounded-full bg-blue-400 hover:bg-blue-500 text-white font-bold transition-colors"
            >
              📋 Copy Tweet
            </button>
          </div>
        )}

        {/* LinkedIn Tab */}
        {activeTab === 'linkedin' && (
          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-300">
            <h3 className="font-bold text-2xl text-slate-900 mb-6 flex items-center gap-2">
              <span>💼</span> LinkedIn Post
            </h3>
            <div className="bg-white p-6 rounded-xl border border-blue-300 mb-4">
              <p className="text-slate-700 whitespace-pre-wrap leading-7">{result.socialSnippets?.linkedin}</p>
            </div>
            <button
              onClick={() => copyToClipboard(result.socialSnippets?.linkedin)}
              className="w-full px-6 py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold transition-colors"
            >
              📋 Copy Post
            </button>
          </div>
        )}

        {/* Facebook Tab */}
        {activeTab === 'facebook' && (
          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200">
            <h3 className="font-bold text-2xl text-slate-900 mb-6 flex items-center gap-2">
              <span>👥</span> Facebook Post
            </h3>
            <div className="bg-white p-6 rounded-xl border border-blue-200 mb-4">
              <p className="text-slate-700 whitespace-pre-wrap leading-7">{result.socialSnippets?.facebook}</p>
            </div>
            <button
              onClick={() => copyToClipboard(result.socialSnippets?.facebook)}
              className="w-full px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
            >
              📋 Copy Post
            </button>
          </div>
        )}

      </motion.main>

      {/* Footer / Downloads */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-200 font-sans z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="hidden md:block">
            <button onClick={() => navigate('/')} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              ← Back to Dashboard
            </button>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => downloadBlog('markdown')}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm transition-colors"
            >
              Copy Markdown
            </button>
            <button
              onClick={() => downloadBlog('html')}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg transition-all hover:-translate-y-0.5"
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
