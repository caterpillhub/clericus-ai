'use client'

import { useState, useEffect } from 'react'
import { Homepage } from './homepage'
import { ChatInterface } from './chat-interface'
import { ChatHistoryPanel } from './chat-history-panel'
import { SettingsPanel } from './settings-panel'

interface ChatSession {
  id: string
  title: string
  date: Date
  preview: string
  messages: Array<{ role: string; content: string }>
}

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home')
  const [initialMessage, setInitialMessage] = useState('')
  // history panel open state; start closed to avoid flash on reload
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  // collapse state (mini sidebar) controlled by UI toggle
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [sessions, setSessions] = useState<ChatSession[]>([])

  const handleStartChat = (message: string) => {
    // when starting chat, switch to chat view and open history
    setCurrentView('chat')
    setIsHistoryOpen(true)
    setIsHistoryCollapsed(false)
    // Create a new session
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: message.substring(0, 50) || 'New Chat',
      date: new Date(),
      preview: message.substring(0, 100),
      messages: [{ role: 'user', content: message }],
    }
    
    setSessions((prev) => [newSession, ...prev])
    setInitialMessage(message)
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setInitialMessage('')
    // hide history when returning home
    setIsHistoryOpen(false)
  }

  // ensure panel only opens automatically on chat view
  useEffect(() => {
    if (currentView === 'chat') {
      setIsHistoryOpen(true)
      setIsHistoryCollapsed(false)
    } else {
      setIsHistoryOpen(false)
    }
  }, [currentView])

  // when panel re‑opens ensure it's expanded (still useful for manual reopen)
  useEffect(() => {
    if (isHistoryOpen && isHistoryCollapsed) {
      setIsHistoryCollapsed(false)
    }
  }, [isHistoryOpen])

  const handleNewChat = () => {
    setCurrentView('home')
    setInitialMessage('')
    setIsHistoryOpen(false)
  }

  const handleSelectSession = (sessionId: string) => {
    // ensure we are on chat view and panel visible
    setCurrentView('chat')
    setIsHistoryOpen(true)
    setIsHistoryCollapsed(false)

    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setInitialMessage(session.messages[0]?.content || '')
    }
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId))
  }

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (typeof document !== 'undefined') {
      const html = document.documentElement
      if (isDarkMode) {
        html.classList.remove('dark')
      } else {
        html.classList.add('dark')
      }
    }
  }

  return (
    <>
      {currentView === 'home' ? (
        <>
          <Homepage 
            onStartChat={handleStartChat}
            onOpenHistory={() => {
              setIsHistoryOpen(true)
              setIsHistoryCollapsed(false)
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          {/* overlay panel on homepage, fixed positioning handled by component */}
          <ChatHistoryPanel
            isOpen={isHistoryOpen}
            isCollapsed={isHistoryCollapsed}
            onToggleCollapse={() => setIsHistoryCollapsed((p) => !p)}
            onClose={() => setIsHistoryOpen(false)}
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onGoHome={handleBackToHome}
            inChatView={false}
          />
        </>
      ) : (
        <div className="flex h-full">
          <ChatHistoryPanel
            isOpen={isHistoryOpen}
            isCollapsed={isHistoryCollapsed}
            onToggleCollapse={() => setIsHistoryCollapsed((p) => !p)}
            onClose={() => setIsHistoryOpen(false)}
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onGoHome={handleBackToHome}
            inChatView={true}
          />
          <div className="flex-1">
            <ChatInterface 
              onBack={handleBackToHome} 
              initialMessage={initialMessage}
              isHistoryOpen={isHistoryOpen}
              isHistoryCollapsed={isHistoryCollapsed}
              onToggleHistoryCollapse={() => setIsHistoryCollapsed((p) => !p)}
              onToggleHistoryOpen={() => setIsHistoryOpen((p) => !p)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              sessions={sessions}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
            />
          </div>
        </div>
      )}

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    </>
  )
}
