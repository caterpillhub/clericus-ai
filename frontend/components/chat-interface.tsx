'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Upload, Camera, History, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// track initial messages that have already been sent (module-scoped so it survives
// React Strict Mode mount/unmount cycles during development)
const sentInitialMessages = new Set<string>()
import { ChatHistoryPanel } from './chat-history-panel'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  onBack: () => void
  initialMessage: string
  /** whether history panel is open */
  isHistoryOpen: boolean
  /** whether history panel is collapsed to mini sidebar */
  isHistoryCollapsed: boolean
  /** toggle collapse state (expand/minimize) */
  onToggleHistoryCollapse: () => void
  /** toggle open/close when panel is closed */
  onToggleHistoryOpen: () => void
  onOpenSettings: () => void
  sessions: Array<{ id: string; title: string; date: Date; preview: string; messages: Array<{ role: string; content: string }> }>
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  onDeleteSession: (sessionId: string) => void
}

export function ChatInterface({ onBack, initialMessage, isHistoryOpen, isHistoryCollapsed, onToggleHistoryCollapse, onToggleHistoryOpen, onOpenSettings, sessions = [], onSelectSession = () => {}, onNewChat = () => {}, onDeleteSession = () => {} }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [initialMessageSent, setInitialMessageSent] = useState(false)

  useEffect(() => {
    // Add initial message if provided and not already sent. We use a module-scope
    // Set so that React Strict Mode's double-mount does not trigger the call twice.
    if (
      initialMessage &&
      messages.length === 0 &&
      !initialMessageSent &&
      !sentInitialMessages.has(initialMessage)
    ) {
      setInitialMessageSent(true)
      sentInitialMessages.add(initialMessage)

      const userMessage: Message = {
        id: `msg-${Date.now()}-0`,
        role: 'user',
        content: initialMessage,
        timestamp: new Date(),
      }
      setMessages([userMessage])
      setIsLoading(true)

      // perform fetch immediately (no timeout)
      const doFetch = async () => {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [userMessage],
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to get response')
          }

          const reader = response.body?.getReader()
          if (!reader) return

          let fullContent = ''
          const assistantId = `msg-${Date.now()}-1`
          const assistantMessage: Message = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, assistantMessage])

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const text = new TextDecoder().decode(value)
            fullContent += text

            setMessages((prev) => {
              const updated = [...prev]
              const msgIndex = updated.findIndex((m) => m.id === assistantId)
              if (msgIndex >= 0) {
                updated[msgIndex] = { ...updated[msgIndex], content: fullContent }
              }
              return updated
            })
          }

          setIsLoading(false)
        } catch (error) {
          console.error('Chat error:', error)
          setMessages((prev) => [...prev, {
            id: `msg-${Date.now()}-error`,
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date(),
          }])
          setIsLoading(false)
        }
      }

      doFetch()
    }
    // we intentionally omit `messages` from deps; we only want to fire when
    // `initialMessage` itself changes
  }, [initialMessage])

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content?: string) => {
    const messageContent = content || input
    if (!messageContent.trim()) return

    setInput('')
    setIsLoading(true)

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    }

    // append user message immediately
    setMessages((prev) => [...prev, userMessage])

    // perform network request outside of state updater to avoid double-execution
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) return

      let fullContent = ''
      const assistantId = `msg-${Date.now()}-assistant`

      // Add empty assistant message first
      setMessages((prev) => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        fullContent += text

        setMessages((prev) => {
          const updated = [...prev]
          const msgIndex = updated.findIndex((m) => m.id === assistantId)
          if (msgIndex >= 0) {
            updated[msgIndex] = { ...updated[msgIndex], content: fullContent }
          }
          return updated
        })
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }])
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = `[File uploaded: ${file.name}]\n\nPlease help me with this file.`
      sendMessage(content)
    }
    reader.readAsText(file)
  }

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = `[Photo captured]\n\nPlease help me with this photo.`
      sendMessage(content)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoading) {
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-background">

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">FormAssist</span>
            </div>

            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onOpenSettings}
                className="hover:bg-secondary"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent via-accent/60 to-accent/30 mb-6 shadow-lg shadow-accent/20" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Start a Conversation
                </h2>
                <p className="text-muted-foreground">
                  Ask me anything about form assistance
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xl px-6 py-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-accent text-accent-foreground rounded-br-none'
                          : 'bg-card border border-border text-foreground rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-2xl rounded-bl-none px-6 py-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border px-6 py-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-3">
            <div className="relative flex items-center gap-2">
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
                disabled={isLoading}
                className="p-2 hover:bg-secondary disabled:opacity-50 rounded-lg transition-colors"
                title="Upload file"
              >
                <Upload className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 hover:bg-secondary disabled:opacity-50 rounded-lg transition-colors"
                title="Take photo"
              >
                <Camera className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-6 py-4 bg-card border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 hover:bg-secondary disabled:opacity-50 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5 text-accent" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
