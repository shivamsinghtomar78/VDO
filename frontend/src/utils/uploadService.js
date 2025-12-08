import { validateUploadResponse } from './validation'

const TIMEOUT = 300000 // 5 minutes for video processing
const MAX_RETRIES = 1 // Don't retry since processing takes long
const RETRY_DELAY = 1000 // 1 second

export async function uploadVideo(file, template = 'standard', onProgress) {
  let lastError

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await uploadWithTimeout(file, template, onProgress)
    } catch (error) {
      lastError = error
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt))
      }
    }
  }

  throw lastError
}

async function uploadWithTimeout(file, template, onProgress) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const formData = new FormData()
    formData.append('video', file)
    formData.append('template', template)

    const uploadUrl = '/api/upload-video'
    console.log('Uploading to:', uploadUrl)

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server error:', errorText)
      throw new Error(`Upload failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (!data) {
      throw new Error('Empty response from server')
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
      transcript: data.transcript || 'Transcript not available',
      warnings: data.warnings || [],
      socialSnippets: data.socialSnippets || {},
      availableExports: data.availableExports || [],
      isMockData: data.isMockData || false
    }

    validateUploadResponse(enrichedData)
    console.log('Upload successful:', enrichedData)

    // Log warnings if present
    if (enrichedData.warnings && enrichedData.warnings.length > 0) {
      console.warn('Processing warnings:', enrichedData.warnings)
    }

    return enrichedData
  } catch (error) {
    console.error('Upload error:', error.message)
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function processYouTubeUrl(youtubeUrl, template = 'standard') {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

  try {
    const response = await fetch('/api/process-youtube', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ youtubeUrl, template }),
      signal: controller.signal
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('YouTube API error:', errorText)
      throw new Error(`YouTube processing failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (!data) {
      throw new Error('Empty response from server')
    }

    // Add fallback defaults for optional fields
    const enrichedData = {
      ...data,
      source: 'youtube',
      blog: {
        title: data.blog?.title || 'Untitled Blog',
        sections: data.blog?.sections || []
      },
      seo: {
        title: data.seo?.title || data.blog?.title || 'Blog Title',
        metaDescription: data.seo?.metaDescription || 'Blog content generated from YouTube video',
        keywords: data.seo?.keywords || [],
        seoScore: data.seo?.seoScore || 75,
        readabilityScore: data.seo?.readabilityScore || 'Good'
      },
      imageSuggestions: data.imageSuggestions || [],
      transcript: data.transcript || 'Transcript not available',
      warnings: data.warnings || [],
      socialSnippets: data.socialSnippets || {},
      availableExports: data.availableExports || []
    }

    console.log('YouTube processing successful:', enrichedData)

    return enrichedData
  } catch (error) {
    console.error('YouTube processing error:', error.message)
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
