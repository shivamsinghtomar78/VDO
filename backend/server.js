import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}))
app.use(express.json())

// Setup uploads directory
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${name}-${uuidv4()}${ext}`)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'))
    }
  },
  limits: {
    fileSize: 200 * 1024 * 1024 // 200 MB
  }
})

// Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend service is running' })
})

/**
 * Upload video endpoint
 * POST /api/upload-video
 */
app.post('/api/upload-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' })
    }

    const jobId = uuidv4()
    const videoPath = req.file.path

    console.log(`✓ Video uploaded: ${req.file.filename} (${(req.file.size / (1024 * 1024)).toFixed(2)} MB)`)
    console.log(`✓ Job ID: ${jobId}`)

    // Call Python service to process the video
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/api/process-video`, {
        jobId,
        videoPath,
        filename: req.file.filename
      }, {
        timeout: 300000 // 5 minute timeout for video processing
      })

      console.log(`✓ Processing completed for job ${jobId}`)
      
      // Parse response from Python service
      const result = response.data
      console.log('Raw Python response:', JSON.stringify(result).substring(0, 200))
      
      // Ensure response has all required fields
      const finalResult = {
        jobId: result.jobId || jobId,
        status: result.status || 'completed',
        transcript: result.transcript || '',
        blog: result.blog || { title: '', sections: [] },
        seo: result.seo || { 
          title: '', 
          metaDescription: '', 
          keywords: [],
          seoScore: 0,
          readabilityScore: 0
        },
        imageSuggestions: result.imageSuggestions || []
      }
      
      console.log('Response data structure:')
      console.log('  - jobId:', !!finalResult.jobId)
      console.log('  - status:', finalResult.status)
      console.log('  - blog.title:', !!finalResult.blog.title)
      console.log('  - blog.sections:', finalResult.blog.sections.length)
      console.log('  - seo.title:', !!finalResult.seo.title)
      console.log('  - transcript length:', finalResult.transcript.length)
      console.log('Response data:', JSON.stringify(finalResult).substring(0, 300))
      
      // Clean up uploaded file after processing
      try {
        fs.unlinkSync(videoPath)
      } catch (e) {
        console.warn('Could not delete uploaded file:', e.message)
      }
      
      res.json(finalResult)
    } catch (pythonError) {
      console.error('Error calling Python service:', pythonError.message)
      const mockResult = generateMockResult(jobId)
      mockResult.isMockData = true
      mockResult.warning = 'AI service unavailable - using mock data'
      console.log(`⚠ Returning mock data for job ${jobId}`)
      res.status(202).json(mockResult)
    }
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Error processing video: ' + error.message })
  }
})

/**
 * Get job status
 * GET /api/status/:jobId
 */
app.get('/api/status/:jobId', (req, res) => {
  const { jobId } = req.params
  // In a real app, this would check a database or queue
  res.json({ 
    jobId, 
    status: 'completed',
    message: 'Video processing completed'
  })
})

// Error handler for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 200 MB limit' })
    }
    return res.status(400).json({ error: error.message })
  }
  if (error) {
    return res.status(400).json({ error: error.message })
  }
  next()
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   Video-to-Blog Backend Started     ║
║   Port: ${PORT}                              ║
║   Python Service: ${PYTHON_SERVICE_URL}         ║
╚══════════════════════════════════════╝
  `)
})

/**
 * Generate mock result for demo purposes
 */
function generateMockResult(jobId) {
  return {
    jobId,
    status: 'completed',
    transcript: 'Sample transcript from your video would appear here.',
    blog: {
      title: 'Your Blog Title Here',
      sections: [
        { heading: 'Introduction', content: 'Introduction content...' }
      ]
    },
    seo: {
      title: 'Your SEO Title',
      metaDescription: 'Your SEO meta description',
      keywords: ['keyword1', 'keyword2']
    },
    imageSuggestions: []
  }
}
