'use client'

import { useState, useCallback } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { SlideUp } from '@/components/animations/SlideUp'

export default function NewDocumentPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [watermarkEnabled, setWatermarkEnabled] = useState(true)
  const [watermarkType, setWatermarkType] = useState<'text' | 'image' | 'both'>('text')
  const [watermarkText, setWatermarkText] = useState('')
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null)
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleWatermarkImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file must be less than 5MB')
        return
      }
      
      setWatermarkImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setWatermarkImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const removeWatermarkImage = useCallback(() => {
    setWatermarkImage(null)
    setWatermarkImagePreview(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      console.log('🚀 Starting document upload...')
      
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      // Validate form data before sending
      const title = formData.get('title') as string
      const file = formData.get('document') as File
      
      if (!title || !title.trim()) {
        throw new Error('Please enter a document title')
      }
      
      if (!file || file.size === 0) {
        throw new Error('Please select a PDF file to upload')
      }
      
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Please select a valid PDF file')
      }
      
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB')
      }
      
      console.log('✅ Form validation passed')
      
      // Add watermark data
      if (watermarkEnabled) {
        formData.append('watermarkType', watermarkType)
        if (watermarkText) {
          formData.append('watermarkText', watermarkText)
        }
        if (watermarkImage) {
          formData.append('watermarkImage', watermarkImage)
        }
      }
      
      console.log('📤 Sending upload request...')
      
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 300)
      
      // Add timeout to the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout
      
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      clearInterval(progressInterval)
      setUploadProgress(95)

      console.log('📥 Response received:', response.status)

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        throw new Error('Server returned invalid response')
      }
      
      console.log('📋 Response data:', result)

      if (!response.ok) {
        const errorMessage = result.error || result.details || `Server error (${response.status})`
        console.error('❌ Upload failed:', errorMessage)
        throw new Error(errorMessage)
      }
      
      setUploadProgress(100)
      console.log('✅ Upload successful!')

      // Show success message with watermark info
      const watermarkInfo = watermarkEnabled ? 
        `\nWatermark: ${watermarkType === 'text' ? 'Text' : watermarkType === 'image' ? 'Image' : 'Text + Image'}` : 
        '\nNo watermark applied'
      
      alert(`Document "${result.document.title}" uploaded successfully!${watermarkInfo}\n\nRedirecting to dashboard...`)
      
      // Small delay to show 100% progress
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
      
    } catch (error) {
      console.error('❌ Upload error:', error)
      
      let errorMessage = 'Upload failed'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Upload timed out. Please try again with a smaller file.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(`Upload failed: ${errorMessage}`)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <a href="/dashboard" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              📄 Flipbook DRM
            </a>
            <div className="flex gap-6">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-800 transition-colors">
                Dashboard
              </a>
              <a href="/documents/new" className="text-blue-600 font-medium">
                Upload
              </a>
              <a href="/subscription" className="text-gray-600 hover:text-gray-800 transition-colors">
                Subscription
              </a>
            </div>
          </div>
          <a href="/auth/sign-in" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">
            Sign Out
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Upload New Document
                </h1>
                <p className="text-gray-600">
                  Upload your PDF document to create a secure, view-only flipbook with DRM protection.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* File Upload */}
                <SlideUp delay={100}>
                  <div>
                    <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-3">
                      PDF Document <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="text-5xl mb-4">📄</div>
                      <input
                        type="file"
                        id="document"
                        name="document"
                        accept=".pdf"
                        required
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                              alert('File size must be less than 50MB')
                              e.target.value = ''
                              return
                            }
                            if (!file.type.includes('pdf')) {
                              alert('Please select a PDF file')
                              e.target.value = ''
                              return
                            }
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 disabled:opacity-50"
                      />
                      <p className="text-gray-500 text-sm">
                        Select a PDF file to upload (Max 50MB)
                      </p>
                    </div>
                  </div>
                </SlideUp>

                {/* Document Details */}
                <SlideUp delay={200}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Document Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        disabled={isUploading}
                        placeholder="Enter document title"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        disabled={isUploading}
                        placeholder="Brief description of the document"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                </SlideUp>

                {/* Watermark Options */}
                <SlideUp delay={300}>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      💧 Watermark Options
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Enable Watermark */}
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="watermark" 
                          checked={watermarkEnabled}
                          onChange={(e) => setWatermarkEnabled(e.target.checked)}
                          disabled={isUploading}
                          className="mt-1 disabled:opacity-50" 
                        />
                        <div>
                          <span className="font-medium text-gray-900">Add custom watermark</span>
                          <p className="text-gray-600 text-sm">Protect content with your own text or image watermark</p>
                        </div>
                      </label>

                      {/* Watermark Configuration */}
                      {watermarkEnabled && (
                        <div className="ml-6 space-y-4 border-l-2 border-blue-200 pl-4">
                          {/* Watermark Type Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Watermark Type
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="watermarkType"
                                  value="text"
                                  checked={watermarkType === 'text'}
                                  onChange={(e) => setWatermarkType(e.target.value as 'text')}
                                  disabled={isUploading}
                                  className="disabled:opacity-50"
                                />
                                <span className="text-sm text-gray-700">Text Only</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="watermarkType"
                                  value="image"
                                  checked={watermarkType === 'image'}
                                  onChange={(e) => setWatermarkType(e.target.value as 'image')}
                                  disabled={isUploading}
                                  className="disabled:opacity-50"
                                />
                                <span className="text-sm text-gray-700">Image Only</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="watermarkType"
                                  value="both"
                                  checked={watermarkType === 'both'}
                                  onChange={(e) => setWatermarkType(e.target.value as 'both')}
                                  disabled={isUploading}
                                  className="disabled:opacity-50"
                                />
                                <span className="text-sm text-gray-700">Text + Image</span>
                              </label>
                            </div>
                          </div>

                          {/* Text Watermark */}
                          {(watermarkType === 'text' || watermarkType === 'both') && (
                            <div>
                              <label htmlFor="watermarkText" className="block text-sm font-medium text-gray-700 mb-2">
                                Watermark Text
                              </label>
                              <input
                                type="text"
                                id="watermarkText"
                                value={watermarkText}
                                onChange={(e) => setWatermarkText(e.target.value)}
                                placeholder="Enter your watermark text (e.g., Company Name, Copyright)"
                                disabled={isUploading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                This text will appear as a watermark on every page
                              </p>
                            </div>
                          )}

                          {/* Image Watermark */}
                          {(watermarkType === 'image' || watermarkType === 'both') && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Watermark Image
                              </label>
                              
                              {!watermarkImagePreview ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                                  <div className="text-2xl mb-2">🖼️</div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleWatermarkImageChange}
                                    disabled={isUploading}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                                  />
                                  <p className="text-xs text-gray-500 mt-2">
                                    PNG, JPG, or GIF (max 5MB). Transparent backgrounds recommended.
                                  </p>
                                </div>
                              ) : (
                                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                                  <div className="flex items-start gap-4">
                                    <img
                                      src={watermarkImagePreview}
                                      alt="Watermark preview"
                                      className="w-20 h-20 object-contain border border-gray-200 rounded"
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {watermarkImage?.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {watermarkImage && (watermarkImage.size / 1024).toFixed(1)} KB
                                      </p>
                                      <button
                                        type="button"
                                        onClick={removeWatermarkImage}
                                        disabled={isUploading}
                                        className="mt-2 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                                      >
                                        Remove image
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Watermark Preview */}
                          {(watermarkText || watermarkImagePreview) && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Watermark Preview</h4>
                              <div className="relative bg-gray-100 rounded p-4 min-h-[100px] flex items-center justify-center">
                                <div className="text-center opacity-60">
                                  {watermarkImagePreview && (
                                    <img 
                                      src={watermarkImagePreview} 
                                      alt="Watermark" 
                                      className="max-w-[80px] max-h-[40px] object-contain mx-auto mb-2"
                                    />
                                  )}
                                  {watermarkText && (
                                    <div className="text-gray-600 text-sm font-medium">
                                      {watermarkText}
                                    </div>
                                  )}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">
                                    Sample Document Content
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                This is how your watermark will appear on the document
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </SlideUp>

                {/* Security Options */}
                <SlideUp delay={350}>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      🔒 Security Options
                    </h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="preventDownload" 
                          defaultChecked 
                          disabled={isUploading}
                          className="mt-1 disabled:opacity-50" 
                        />
                        <div>
                          <span className="font-medium text-gray-900">Prevent downloads</span>
                          <p className="text-gray-600 text-sm">Disable right-click and download options</p>
                        </div>
                      </label>
                      
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="trackViews" 
                          defaultChecked 
                          disabled={isUploading}
                          className="mt-1 disabled:opacity-50" 
                        />
                        <div>
                          <span className="font-medium text-gray-900">Track views</span>
                          <p className="text-gray-600 text-sm">Monitor who accesses your document</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </SlideUp>

                {/* Access Control */}
                <SlideUp delay={400}>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      🎯 Access Control
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
                          Link Expiry (Optional)
                        </label>
                        <select
                          id="expiry"
                          name="expiry"
                          disabled={isUploading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                        >
                          <option value="">No expiry</option>
                          <option value="1">1 day</option>
                          <option value="7">1 week</option>
                          <option value="30">1 month</option>
                          <option value="90">3 months</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="maxViews" className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Views (Optional)
                        </label>
                        <input
                          type="number"
                          id="maxViews"
                          name="maxViews"
                          min="1"
                          disabled={isUploading}
                          placeholder="Unlimited"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </SlideUp>

                {/* Submit Buttons */}
                <SlideUp delay={500}>
                  <div className="flex gap-4 justify-end pt-6">
                    <a
                      href="/dashboard"
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </a>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative overflow-hidden"
                    >
                      {/* Progress Bar Background */}
                      {isUploading && (
                        <div 
                          className="absolute inset-0 bg-blue-700 transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      )}
                      
                      {/* Button Content */}
                      <div className="relative z-10 flex items-center gap-2">
                        {isUploading && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {isUploading ? 
                          `Uploading... ${Math.round(uploadProgress)}%` : 
                          'Upload & Secure Document'
                        }
                      </div>
                    </button>
                  </div>
                </SlideUp>
              </form>

              {/* Info Box */}
              <SlideUp delay={600}>
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    ℹ️ What happens after upload?
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 pl-4">
                    <li>• Your PDF is encrypted and processed into a secure flipbook</li>
                    <li>• A unique sharing link is generated with your security settings</li>
                    <li>• You can track views and manage access from your dashboard</li>
                    <li>• Recipients can only view - no downloads or prints allowed</li>
                  </ul>
                </div>
              </SlideUp>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}