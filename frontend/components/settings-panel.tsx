'use client'

import { useState } from 'react'
import { X, Moon, Sun, Settings as SettingsIcon, User, Database, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SettingsTab = 'general' | 'profile' | 'data' | 'about'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export function SettingsPanel({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [settings, setSettings] = useState({
    model: 'openai/gpt-4o-mini',
    temperature: 0.7,
    responseLength: 'balanced',
    codeFormatting: true,
    autoSave: true,
  })

  const [profile, setProfile] = useState({
    name: 'User',
    email: 'user@example.com',
    displayName: 'Assistant User',
  })

  const [language, setLanguage] = useState('English')
  const [themeMode, setThemeMode] = useState(isDarkMode ? 'dark' : 'light')

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleProfileChange = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Centered Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[85vh] flex">
          {/* Left Sidebar */}
          <div className="w-48 bg-secondary border-r border-border flex flex-col p-4 rounded-l-2xl">
          {/* Sidebar Tabs */}
          <div className="space-y-2">
            {[
              { id: 'general', label: 'General', icon: SettingsIcon },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'data', label: 'Data', icon: Database },
              { id: 'about', label: 'About', icon: Info },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-background text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Settings</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-secondary rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Sun },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => {
                          setThemeMode(id)
                          if (id !== 'system') {
                            const isLight = id === 'light'
                            if (isDarkMode === isLight) {
                              onToggleDarkMode()
                            }
                          }
                        }}
                        className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                          themeMode === id
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-secondary hover:bg-border text-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Language</h3>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Chinese</option>
                  </select>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Display Name</label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => handleProfileChange('displayName', e.target.value)}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Manage your chat history and data preferences.</p>
                <button className="w-full px-4 py-2 bg-secondary hover:bg-border rounded-lg text-sm text-foreground transition-colors">
                  Export Chats
                </button>
                <button className="w-full px-4 py-2 bg-destructive hover:bg-destructive/90 rounded-lg text-sm text-destructive-foreground transition-colors">
                  Clear All Data
                </button>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Version</p>
                  <p className="text-sm text-foreground font-medium">FormAssist v1.0</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">About</p>
                  <p className="text-sm text-foreground">AI-powered form assistance at your fingertips</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Copyright</p>
                  <p className="text-xs text-foreground">© 2024 FormAssist. All rights reserved.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
