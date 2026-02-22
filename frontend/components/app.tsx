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
  sessionId: string
  extractedText: string
  messages: Array<{ role: string; content: string }>
}

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home')

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  const activeSession = sessions.find(s => s.id === activeSessionId) || null

  // 🔥 DOCUMENT PROCESSED (ENTRY POINT TO CHAT)
  const handleDocumentProcessed = (
    sessionId: string,
    extractedText: string,
    analysis: string
  ) => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: analysis?.substring(0, 40) || 'Form Session',
      date: new Date(),
      preview: analysis?.substring(0, 100) || '',
      sessionId,
      extractedText,
      messages: [],
    }

    setSessions(prev => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setCurrentView('chat')
    setIsHistoryOpen(true)
    setIsHistoryCollapsed(false)
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setIsHistoryOpen(false)
  }

  useEffect(() => {
    if (currentView === 'chat') {
      setIsHistoryOpen(true)
      setIsHistoryCollapsed(false)
    } else {
      setIsHistoryOpen(false)
    }
  }, [currentView])

  const handleNewChat = () => {
    setCurrentView('home')
    setActiveSessionId(null)
  }

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
    setCurrentView('chat')
    setIsHistoryOpen(true)
    setIsHistoryCollapsed(false)
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (activeSessionId === sessionId) {
      setCurrentView('home')
      setActiveSessionId(null)
    }
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
            onDocumentProcessed={handleDocumentProcessed}
            onOpenHistory={() => {
              setIsHistoryOpen(true)
              setIsHistoryCollapsed(false)
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <ChatHistoryPanel
            isOpen={isHistoryOpen}
            isCollapsed={isHistoryCollapsed}
            onToggleCollapse={() => setIsHistoryCollapsed(p => !p)}
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
            onToggleCollapse={() => setIsHistoryCollapsed(p => !p)}
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
            {activeSession && (
              <ChatInterface
                sessionId={activeSession.sessionId}
                extractedText={activeSession.extractedText}
              />
            )}
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