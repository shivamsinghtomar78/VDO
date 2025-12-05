import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui'
import { Navigation } from '../components/Layout'
import UploadModal from '../components/UploadModal'
import { MOCK_RESULT } from '../utils/mockData'

const generateAnswers = (data) => {
  const { blog, seo, transcript } = data
  
  // Extract key insights from blog sections
  const mainIdeas = blog.sections.slice(0, 3).map((section, idx) => ({
    id: idx,
    title: section.heading,
    answer: section.content.substring(0, 200) + '...',
    type: 'insight'
  }))

  // Generate Q&A from content
  const questions = [
    {
      id: 'q1',
      question: `What is the main topic of this video?`,
      answer: blog.title,
      type: 'main'
    },
    {
      id: 'q2',
      question: `How many key points are covered?`,
      answer: `${blog.sections.length} main sections are discussed in detail`,
      type: 'summary'
    },
    {
      id: 'q3',
      question: `What are the SEO keywords?`,
      answer: seo.keywords.join(', '),
      type: 'meta'
    },
    {
      id: 'q4',
      question: `What is the content duration?`,
      answer: `${Math.ceil(transcript.length / 50)} minutes (approximately)`,
      type: 'meta'
    },
    ...mainIdeas.map(idea => ({
      ...idea,
      question: `What about "${idea.title}"?`
    }))
  ]

  return questions
}

export default function AnswerPage() {
  const [result, setResult] = useState(null)
  const [answers, setAnswers] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const sampleMode = localStorage.getItem('sampleMode')
    const savedData = localStorage.getItem('resultData')

    if (sampleMode || savedData) {
      try {
        const data = sampleMode 
          ? JSON.parse(localStorage.getItem('resultData') || '{}')
          : JSON.parse(savedData)
        setResult(data)
        setAnswers(generateAnswers(data))
        setSelectedAnswer(generateAnswers(data)[0])
      } catch (error) {
        console.error('Error loading data:', error)
        console.log('No valid data, redirecting to home')
        navigate('/')
      }
    } else {
      console.log('No data found, redirecting to home')
      navigate('/')
    }
  }, [navigate])

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="text-6xl mb-4">✨</div>
          <p className="text-xl text-emerald-400 font-semibold">Generating answers...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
      <Navigation onUpload={() => setShowUpload(true)} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-emerald-500/20 backdrop-blur-xl bg-gradient-to-r from-black/50 to-black/30 p-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Key Answers & Insights
              </h1>
              <p className="text-gray-400 mt-2">Questions answered from your video content</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-400">{answers.length}</div>
              <p className="text-gray-400">Questions</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Questions List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <h2 className="text-xl font-semibold text-emerald-400 mb-4">Questions</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {answers.map((item, idx) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    setSelectedAnswer(item)
                    setExpandedIdx(idx)
                  }}
                  whileHover={{ x: 5 }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedAnswer?.id === item.id
                      ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-500/50'
                      : 'bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold mt-0.5">
                      {String.fromCharCode(65 + (idx % 26))}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {item.question || item.title}
                      </p>
                      <span className={`text-xs mt-1 inline-block px-2 py-1 rounded-full ${
                        item.type === 'main' ? 'bg-emerald-500/20 text-emerald-300'
                        : item.type === 'insight' ? 'bg-teal-500/20 text-teal-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Answer Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={selectedAnswer?.id}
            className="lg:col-span-2"
          >
            {selectedAnswer && (
              <div className="space-y-6">
                {/* Question */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-6">
                  <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Question</p>
                  <h3 className="text-2xl font-bold text-emerald-300">
                    {selectedAnswer.question || selectedAnswer.title}
                  </h3>
                </div>

                {/* Answer */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-slate-900/50 to-black/50 border border-emerald-500/20 rounded-xl p-8 backdrop-blur-sm"
                >
                  <p className="text-gray-400 text-sm uppercase tracking-wide mb-4">Answer</p>
                  <p className="text-lg text-gray-100 leading-relaxed mb-6">
                    {selectedAnswer.answer}
                  </p>
                  
                  {/* Additional Context */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-emerald-500/10">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                      <p className="text-emerald-400 font-semibold capitalize">
                        {selectedAnswer.type}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Position</p>
                      <p className="text-emerald-400 font-semibold">
                        {expandedIdx + 1} of {answers.length}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const text = `Q: ${selectedAnswer.question || selectedAnswer.title}\n\nA: ${selectedAnswer.answer}`
                      navigator.clipboard.writeText(text)
                      alert('Copied to clipboard!')
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg transition-all"
                  >
                    📋 Copy Answer
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/results')}
                    className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-lg transition-all border border-emerald-500/30"
                  >
                    📄 View Blog
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-emerald-500/10 flex gap-4 justify-center"
        >
          <Button
            onClick={() => navigate('/')}
            variant="secondary"
            className="px-8"
          >
            🏠 Home
          </Button>
          <Button
            onClick={() => navigate('/results')}
            className="px-8"
          >
            📄 Full Blog
          </Button>
          <Button
            onClick={() => setShowUpload(true)}
            className="px-8"
          >
            📹 New Video
          </Button>
        </motion.div>
      </div>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} />
      )}
    </div>
  )
}
