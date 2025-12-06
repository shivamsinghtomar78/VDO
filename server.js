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

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'frontend/dist')))

const uploadsDir = path.join(__dirname, 'backend/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
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
    cb(allowedTypes.includes(file.mimetype) ? null : new Error('Invalid file type'), allowedTypes.includes(file.mimetype))
  },
  limits: { fileSize: 200 * 1024 * 1024 }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/upload-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file provided' })

    const jobId = uuidv4()
    const videoPath = req.file.path

    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/api/process-video`, {
        jobId, videoPath, filename: req.file.filename
      }, { timeout: 300000 })

      const result = response.data
      const finalResult = {
        jobId: result.jobId || jobId,
        status: result.status || 'completed',
        transcript: result.transcript || '',
        blog: result.blog || { title: '', sections: [] },
        seo: result.seo || { title: '', metaDescription: '', keywords: [], seoScore: 0, readabilityScore: 0 },
        imageSuggestions: result.imageSuggestions || []
      }

      try { fs.unlinkSync(videoPath) } catch (e) {}
      res.json(finalResult)
    } catch (pythonError) {
      const mockResult = {
        jobId, status: 'completed',
        transcript: 'Sample transcript',
        blog: { title: 'Blog Title', sections: [{ heading: 'Introduction', content: 'Content...' }] },
        seo: { title: 'SEO Title', metaDescription: 'Description', keywords: ['key1'], seoScore: 75, readabilityScore: 'Good' },
        imageSuggestions: [],
        isMockData: true
      }
      res.status(202).json(mockResult)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/status/:jobId', (req, res) => {
  res.json({ jobId: req.params.jobId, status: 'completed' })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
