'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Trash2, Search, Plus, Edit, Settings, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatSession {
  id: string
  title: string
  date: Date
  preview: string
}

interface ChatHistoryPanelProps {
  isOpen: boolean
  /** whether panel is collapsed into mini sidebar */
  isCollapsed: boolean
  onToggleCollapse: () => void
  onClose: () => void
  sessions: ChatSession[]
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  onDeleteSession: (sessionId: string) => void
  onOpenSettings: () => void
  onGoHome: () => void
  /** render style when part of chat view layout instead of fixed overlay */
  inChatView?: boolean
}

export function ChatHistoryPanel({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
  sessions,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenSettings,
  inChatView = false,
  onGoHome,
}: ChatHistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group sessions by date
  const groupedSessions = {
    today: filteredSessions.filter((s) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sessionDate = new Date(s.date)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate.getTime() === today.getTime()
    }),
    week: filteredSessions.filter((s) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      const sessionDate = new Date(s.date)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate.getTime() > weekAgo.getTime() && sessionDate.getTime() < today.getTime()
    }),
    older: filteredSessions.filter((s) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      weekAgo.setHours(0, 0, 0, 0)
      const sessionDate = new Date(s.date)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate.getTime() <= weekAgo.getTime()
    }),
  }

  return (
    <>
      {/* Panel (no longer fixed) */}
      <div
        className={`${inChatView ? 'relative' : 'fixed left-0 top-0 h-full'} bg-card border-r border-border flex flex-col transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isOpen ? (isCollapsed ? 'w-16' : 'w-64') : 'w-0'} overflow-hidden`}
      >
        {/* Collapsed toolbar */}
        {isCollapsed ? (
          <div className="flex flex-col items-center justify-between h-full py-4">
            {/* collapse/expand toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="hover:bg-secondary"
              title={isCollapsed ? 'Expand chats' : 'Collapse chats'}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>

            {/* action icons */}
            <div className="flex flex-col items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onGoHome}
                className="hover:bg-secondary"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewChat}
                className="hover:bg-secondary"
                title="New chat"
              >
                <Edit className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isCollapsed) onToggleCollapse()
                  // focus search after expansion
                  setTimeout(() => {
                    const input = document.querySelector<HTMLInputElement>('.chat-history-search')
                    input?.focus()
                  }, 100)
                }}
                className="hover:bg-secondary"
                title="Search chats"
              >
                <Search className="w-5 h-5" />
              </Button>
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

            {/* close button at bottom (optional) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-secondary"
              title="Close history"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Button>
          </div>
        ) : (
          // expanded content
          <>
            {/* Header */}
            <div className="p-4 border-b border-border space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">
                  Your chats
                </h2>
                <div className="flex items-center gap-1">
                  {/* collapse/expand button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="hover:bg-secondary"
                    title="Collapse panel"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  {/* home button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onGoHome}
                    className="hover:bg-secondary"
                    title="Home"
                  >
                    <Home className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="lg:hidden hover:bg-secondary"
                    title="Close history"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={onNewChat}
                className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="chat-history-search w-full pl-9 pr-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* rest of sessions list remains unchanged */}
          </>
        )}
        {/* Sessions List */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No chats found</p>
              </div>
            ) : (
              <div className="p-2 space-y-4">
                {/* Today */}
                {groupedSessions.today.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase px-3 py-2">
                      Today
                    </h3>
                    <div className="space-y-1">
                      {groupedSessions.today.map((session) => (
                        <SessionItem
                          key={session.id}
                          session={session}
                          onSelect={() => onSelectSession(session.id)}
                          onDelete={() => onDeleteSession(session.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* This Week */}
                {groupedSessions.week.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase px-3 py-2">
                      This Week
                    </h3>
                    <div className="space-y-1">
                      {groupedSessions.week.map((session) => (
                        <SessionItem
                          key={session.id}
                          session={session}
                          onSelect={() => onSelectSession(session.id)}
                          onDelete={() => onDeleteSession(session.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Older */}
                {groupedSessions.older.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase px-3 py-2">
                      Older
                    </h3>
                    <div className="space-y-1">
                      {groupedSessions.older.map((session) => (
                        <SessionItem
                          key={session.id}
                          session={session}
                          onSelect={() => onSelectSession(session.id)}
                          onDelete={() => onDeleteSession(session.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      </>
  )
}

interface SessionItemProps {
  session: ChatSession
  onSelect: () => void
  onDelete: () => void
}

function SessionItem({ session, onSelect, onDelete }: SessionItemProps) {
  const [hovering, setHovering] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group relative px-3 py-2 hover:bg-secondary rounded-lg cursor-pointer transition-colors"
      onClick={onSelect}
    >
      <div className="truncate">
        <p className="text-sm font-medium text-foreground truncate">{session.title}</p>
        <p className="text-xs text-muted-foreground truncate">{session.preview}</p>
      </div>
      {hovering && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-border rounded transition-colors"
        >
          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
        </button>
      )}
    </div>
  )
}
