import { validateUploadResponse } from './validation'

const TIMEOUT = 300000 // 5 minutes for video processing
const MAX_RETRIES = 1 // Don't retry since processing takes long
const RETRY_DELAY = 1000 // 1 second

export async function uploadVideo(file, onProgress) {
  let lastError
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${MAX_RETRIES}`)
      return await uploadWithTimeout(file, onProgress)
    } catch (error) {
      lastError = error
      console.error(`Upload attempt ${attempt}/${MAX_RETRIES} failed:`, error.message)
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt))
      }
    }
  }
  
  throw lastError
}

async function uploadWithTimeout(file, onProgress) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.error('Upload timeout after 5 minutes')
    controller.abort()
  }, TIMEOUT)

  try {
    const formData = new FormData()
    formData.append('video', file)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    console.log('Uploading to:', apiUrl)
    
    const response = await fetch(`${apiUrl}/api/upload-video`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length')
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `Upload failed with status ${response.status}`)
    }

    console.log('Upload response received, data keys:', Object.keys(data))
    console.log('Response structure check:')
    console.log('  - Has jobId:', !!data.jobId, data.jobId)
    console.log('  - Has status:', !!data.status, data.status)
    console.log('  - Has blog:', !!data.blog)
    console.log('  - Has blog.title:', !!data.blog?.title, data.blog?.title)
    console.log('  - Has blog.sections:', Array.isArray(data.blog?.sections), data.blog?.sections?.length)
    console.log('  - Has seo:', !!data.seo)
    console.log('  - Has imageSuggestions:', Array.isArray(data.imageSuggestions))
    
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
    
    console.log('Enriched data:', enrichedData)
    
    try {
      validateUploadResponse(enrichedData)
    } catch (validationError) {
      console.error('Validation error:', validationError.message)
      console.error('Failed data:', JSON.stringify(enrichedData, null, 2))
      throw validationError
    }
    
    return enrichedData
  } finally {
    clearTimeout(timeoutId)
  }
}
