import { validateUploadResponse } from './validation'

const TIMEOUT = 300000 // 5 minutes for video processing
const MAX_RETRIES = 2 // Retry once for cold start
const RETRY_DELAY = 5000 // 5 seconds between retries

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

    const apiUrl = import.meta.env.VITE_API_URL || ''
    const uploadUrl = `${apiUrl}/api/upload-video`
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

export async function processYouTubeUrl(youtubeUrl, isRetry = false) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minute timeout

  try {
    const apiUrl = import.meta.env.VITE_API_URL || ''
    console.log(`Processing YouTube URL: ${youtubeUrl} (retry: ${isRetry})`)

    const response = await fetch(`${apiUrl}/api/process-youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ youtubeUrl }),
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

    // Retry once if it's a network error (cold start scenario)
    if (!isRetry && (error.name === 'AbortError' || error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      console.log('Retrying due to possible cold start...')
      clearTimeout(timeoutId)
      // Wait 5 seconds for server to wake up, then retry
      await new Promise(resolve => setTimeout(resolve, 5000))
      return processYouTubeUrl(youtubeUrl, true)
    }

    // Provide better error message for timeout
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server may be starting up - please try again.')
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

