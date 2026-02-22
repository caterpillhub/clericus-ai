'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight, History, Settings, Upload, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HomepageProps {
  onStartChat: (message: string) => void
  onOpenHistory: () => void
  onOpenSettings: () => void
}

export function Homepage({ onStartChat, onOpenHistory, onOpenSettings }: HomepageProps) {
  const [input, setInput] = useState('')
  const [greeting, setGreeting] = useState('Good morning')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const content = `[File uploaded: ${file.name}]\n\nPlease help me with this file.`
    onStartChat(content)
  }

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const content = `[Photo captured]\n\nPlease help me with this photo.`
    onStartChat(content)
  }

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onStartChat(input)
      setInput('')
    }
  }

  return (
    <div className="w-full h-full min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background p-4 md:p-8">
      <div className="w-full max-w-3xl flex flex-col items-center justify-center gap-12">
        {/* Logo Header */}
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

        {/* Central Content */}
        <div className="flex flex-col items-center gap-8">
          {/* Gradient Circle Icon */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-accent via-accent/60 to-accent/30 shadow-lg shadow-accent/20" />

          {/* Greeting Text */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
              {greeting}
            </h1>
            <p className="text-xl md:text-2xl font-light text-muted-foreground">
              How can I help you with your forms today?
            </p>
            <p className="text-sm text-muted-foreground pt-2">
              Describe your form assistance needs or ask anything
            </p>
          </div>
        </div>

        {/* Chat Input Area */}
        <div className="w-full max-w-2xl mx-auto min-h-64">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="space-y-4 py-6">
            {/* Input Field */}
            <div className="relative w-full">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.xlsx,.csv"
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
              >
                <Upload className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="absolute left-14 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-colors"
                title="Take photo"
              >
                <Camera className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How can FormAssist help you today?"
                className="w-full pl-28 pr-12 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
              {input && (
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <ArrowRight className="w-5 h-5 text-accent" />
                </button>
              )}
            </div>

            {/* Disclaimer */}
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
