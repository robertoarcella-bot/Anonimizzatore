import React, { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import WelcomeScreen from './components/WelcomeScreen'
import DropZone from './components/DropZone'
import ProcessingScreen from './components/ProcessingScreen'
import EntityReview from './components/EntityReview'
import SuccessScreen from './components/SuccessScreen'
import ErrorOverlay from './components/ErrorOverlay'
import ModelStatusBadge from './components/ModelStatusBadge'
import GuideModal from './components/GuideModal'

export default function App() {
  const {
    screen, setProgress, error,
    setModelReady, setModelLoading, setModelProgress, setModelError
  } = useStore()
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const cleanupProgress = window.api.onProgress((progress) => {
      setProgress({ stage: 'ner', percent: progress.percent, message: progress.message })
    })

    const cleanupModel = window.api.onModelStatus((status) => {
      if (status.percent === 100 && status.message === 'ready') {
        setModelReady(true)
        setModelLoading(false)
        setModelProgress(100)
      } else if (status.percent === -1) {
        setModelLoading(false)
        setModelError(status.message)
      } else {
        setModelProgress(status.percent)
      }
    })

    const cleanupGuide = window.api.onShowGuide(() => setShowGuide(true))

    return () => { cleanupProgress(); cleanupModel(); cleanupGuide() }
  }, [setProgress, setModelReady, setModelLoading, setModelProgress, setModelError])

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen />
      case 'dropzone':
        return <DropZone />
      case 'processing':
      case 'anonymizing':
        return <ProcessingScreen />
      case 'entity-review':
        return <EntityReview />
      case 'success':
        return <SuccessScreen />
      default:
        return <DropZone />
    }
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <header className="bg-navy-900/80 backdrop-blur-md border-b border-navy-700/50 px-6 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center shadow-lg shadow-accent-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-navy-100 tracking-tight">Anonimizzatore</h1>
          </div>
          <div className="flex items-center gap-4">
            <ModelStatusBadge />
            <span className="text-xs text-navy-500 font-mono">v1.1.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {renderScreen()}
      </main>

      {error && <ErrorOverlay />}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  )
}
