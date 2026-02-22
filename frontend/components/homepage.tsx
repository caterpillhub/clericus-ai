'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight, History, Settings, Upload, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HomepageProps {
  onDocumentProcessed: (
    sessionId: string,
    extractedText: string,
    analysis: string
  ) => void
  onOpenHistory: () => void
  onOpenSettings: () => void
}

export function Homepage({
  onDocumentProcessed,
  onOpenHistory,
  onOpenSettings
}: HomepageProps) {

  const [input, setInput] = useState('')
  const [greeting, setGreeting] = useState('Good morning')
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // 🔥 PROCESS DOCUMENT
  const processFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    setIsLoading(true)

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Processing failed')
      }

      const data = await response.json()

      onDocumentProcessed(
        data.session_id,
        data.extracted_text,
        data.analysis
      )

    } catch (error) {
      console.error(error)
      alert('Document processing failed.')
    }

    setIsLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    processFile(files[0])
  }

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    processFile(files[0])
  }

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  // 🔥 DISABLE TEXT SUBMIT (UPLOAD REQUIRED)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Please upload a form document to begin.")
  }

  return (
    <div className="w-full h-full min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background p-4 md:p-8">
      <div className="w-full max-w-3xl flex flex-col items-center justify-center gap-12">

        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">FormAssist</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenHistory}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
              title="Chat History"
            >
              <History className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-accent via-accent/60 to-accent/30 shadow-lg shadow-accent/20" />

          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
              {greeting}
            </h1>
            <p className="text-xl md:text-2xl font-light text-muted-foreground">
              Upload a form to begin
            </p>
            <p className="text-sm text-muted-foreground pt-2">
              Chat will unlock after document processing
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="w-full max-w-2xl mx-auto min-h-64">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="space-y-4 py-6">

              <div className="relative w-full">

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.csv,.png,.jpg,.jpeg"
                />

                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleCameraCapture}
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-colors"
                  title="Upload file"
                  disabled={isLoading}
                >
                  <Upload className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="absolute left-14 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-colors"
                  title="Take photo"
                  disabled={isLoading}
                >
                  <Camera className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Upload required before chatting"
                  className="w-full pl-28 pr-12 py-4 bg-card border border-border rounded-2xl text-muted-foreground cursor-not-allowed"
                  disabled
                />

                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Processing...
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                FormAssist can make mistakes. Please double-check responses.
              </p>

            </div>
          </form>
        </div>
      </div>
    </div>
  )
}