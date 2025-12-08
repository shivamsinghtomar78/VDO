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

  // Extract Hero Image (from Mystic API or Fallback)
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

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 font-serif selection:bg-emerald-100 selection:text-emerald-900">
      <Navigation onUpload={() => setShowUpload(true)} dark={false} />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-32 pb-24 px-6 max-w-[720px] mx-auto" // Standard Medium column width
      >
        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-[1.15] font-sans">
            {result.blog.title}
          </h1>
          <h2 className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed mb-8 font-sans">
            {result.seo.metaDescription}
          </h2>

          <div className="flex items-center gap-4 border-b border-slate-100 pb-8 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-200">
              AI
            </div>
            <div>
              <div className="font-bold text-slate-900 font-sans">AI Ghostwriter</div>
              <div className="text-slate-500 text-sm font-sans flex items-center gap-2">
                <span>5 min read</span>
                <span>•</span>
                <span className="text-emerald-600">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </header>

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
            <figcaption className="text-center text-sm text-slate-500 mt-4 font-sans max-w-lg mx-auto">
              Generated by Freepik Mystic AI • Prompt: "{result.blog.title}"
            </figcaption>
          </motion.figure>
        )}

        {/* Article Body */}
        <article className="prose prose-lg prose-slate prose-headings:font-sans prose-headings:font-bold prose-p:text-slate-800 prose-p:leading-8 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline mb-20 max-w-none">
          {result.blog.sections.map((section, idx) => (
            <div key={idx} className="mb-12">
              <h2 className="text-3xl mb-6 text-slate-900">{section.heading}</h2>
              <div className="whitespace-pre-wrap">{section.content}</div>
            </div>
          ))}
        </article>

        {/* Footer / Meta Info */}
        <hr className="border-slate-200 mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-sans mb-16">
          {/* SEO Card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>🎯</span> SEO Analysis
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">SEO Score</span>
                <span className="font-bold text-emerald-600">{result.seo.seoScore}/100</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Keywords</span>
                <div className="flex flex-wrap gap-2">
                  {result.seo.keywords.map(k => (
                    <span key={k} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Social Snippets */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>📱</span> Viral Snippets
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => navigator.clipboard.writeText(result.socialSnippets?.twitter?.singleTweet)}
                className="w-full text-left p-3 bg-white rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors group"
              >
                <div className="text-xs font-bold text-slate-400 mb-1 uppercase">Twitter</div>
                <p className="text-sm text-slate-700 line-clamp-2">{result.socialSnippets?.twitter?.singleTweet}</p>
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(result.socialSnippets?.linkedin)}
                className="w-full text-left p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-colors group"
              >
                <div className="text-xs font-bold text-slate-400 mb-1 uppercase">LinkedIn</div>
                <p className="text-sm text-slate-700 line-clamp-2">{result.socialSnippets?.linkedin}</p>
              </button>
            </div>
          </div>
        </div>

        {/* CTA / Downloads */}
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

      </motion.main>

      <UploadModal onClose={() => setShowUpload(false)} isOpen={showUpload} />
    </div>
  )
}
