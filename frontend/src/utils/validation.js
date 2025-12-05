export function validateUploadResponse(data) {
  if (!data || typeof data !== 'object') {
    console.error('Validation failed: Not an object', typeof data)
    throw new Error('Invalid response format - expected object')
  }

  // Check for minimum required fields - blog and jobId are critical
  if (!data.jobId) {
    console.warn('Missing jobId, but continuing...')
    // Don't throw, we can work without it
  }

  // Ensure blog structure exists
  if (!data.blog) {
    console.error('Validation failed: Missing blog object')
    throw new Error('Missing blog data')
  }

  if (!data.blog.title) {
    console.warn('Blog title missing, using default')
    data.blog.title = 'Blog Post'
  }

  if (!Array.isArray(data.blog.sections)) {
    console.error('Validation failed: blog.sections is not an array', data.blog.sections)
    throw new Error('blog.sections must be an array')
  }

  // Ensure blog has at least one section
  if (data.blog.sections.length === 0) {
    console.warn('No blog sections found')
    data.blog.sections = [{ heading: 'Content', content: 'Blog content appears here.' }]
  }

  // Ensure SEO structure exists
  if (!data.seo) {
    console.warn('Missing seo object, creating default')
    data.seo = {}
  }

  if (!data.seo.title) {
    console.warn('SEO title missing, using blog title')
    data.seo.title = data.blog.title
  }

  if (!data.seo.metaDescription) {
    console.warn('SEO metaDescription missing, using default')
    data.seo.metaDescription = 'Blog post generated from video'
  }

  // Ensure imageSuggestions is an array
  if (!Array.isArray(data.imageSuggestions)) {
    console.warn('imageSuggestions is not an array, setting to empty')
    data.imageSuggestions = []
  }

  console.log('Validation passed!')
  return true
}
