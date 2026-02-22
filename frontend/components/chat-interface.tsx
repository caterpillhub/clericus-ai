'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  sessionId: string
  extractedText: string
  onOpenSettings: () => void
}

export function ChatInterface({
  sessionId,
  extractedText,
  onOpenSettings,
}: ChatInterfaceProps) {

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          extracted_text: extractedText,
        }),
      })

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No stream')

      const assistantId = `msg-${Date.now()}-assistant`

      setMessages(prev => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ])

      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        fullContent += chunk

        setMessages(prev => {
          const updated = [...prev]
          const index = updated.findIndex(m => m.id === assistantId)
          if (index !== -1) {
            updated[index] = {
              ...updated[index],
              content: fullContent,
            }
          }
          return updated
        })
      }

    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ])
    }

    setIsLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  // ---------------- UI ----------------
  return (
    <div className="flex h-screen bg-background">

      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="border-b border-border px-6 py-4 flex justify-between">
          <span className="font-semibold text-foreground">
            FormAssist
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

            {messages.length === 0 && (
              <div className="text-muted-foreground text-sm">
                Ask something about the uploaded form.
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xl px-6 py-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-card border border-border text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="text-sm text-muted-foreground">
                Thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border px-6 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something about this form..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Send className="w-5 h-5 text-accent" />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}