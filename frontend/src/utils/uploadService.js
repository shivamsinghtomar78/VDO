import { validateUploadResponse } from './validation'

const TIMEOUT = 300000 // 5 minutes for video processing
const MAX_RETRIES = 1 // Don't retry since processing takes long
const RETRY_DELAY = 1000 // 1 second

export async function uploadVideo(file, onProgress) {
  let lastError
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await uploadWithTimeout(file, onProgress)
    } catch (error) {
      lastError = error
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt))
      }
    }
  }
  
  throw lastError
}

async function uploadWithTimeout(file, onProgress) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const formData = new FormData()
    formData.append('video', file)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    
    const response = await fetch(`${apiUrl}/api/upload-video`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `Upload failed with status ${response.status}`)
    }
    
    // Add fallback defaults for optional fields
    const enrichedData = {
      ...data,
      blog: {
        title: data.blog?.title || 'Untitled Blog',
        sections: data.blog?.sections || []
      },
      seo: {
        title: data.seo?.title || data.blog?.title || 'Blog Title',
        metaDescription: data.seo?.metaDescription || 'Blog content generated from video',
        keywords: data.seo?.keywords || [],
        seoScore: data.seo?.seoScore || 75,
        readabilityScore: data.seo?.readabilityScore || 'Good'
      },
      imageSuggestions: data.imageSuggestions || [],
      transcript: data.transcript || 'Transcript not available'
    }
    
    validateUploadResponse(enrichedData)
    
    return enrichedData
  } finally {
    clearTimeout(timeoutId)
  }
}
