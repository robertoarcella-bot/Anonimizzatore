import { create } from 'zustand'
import { AppScreen, Entity, DocumentInfo, ProcessingProgress } from '../../../shared/types'

interface AppState {
  // Navigation
  screen: AppScreen
  setScreen: (screen: AppScreen) => void

  // Document
  document: DocumentInfo | null
  setDocument: (doc: DocumentInfo | null) => void

  // Entities
  entities: Entity[]
  setEntities: (entities: Entity[]) => void
  updateEntity: (id: string, updates: Partial<Entity>) => void
  removeEntity: (id: string) => void
  addEntity: (entity: Entity) => void

  // Dictionary
  dictionary: Record<string, string>
  setDictionary: (dict: Record<string, string>) => void

  // Progress
  progress: ProcessingProgress | null
  setProgress: (progress: ProcessingProgress | null) => void

  // Output
  outputDir: string | null
  setOutputDir: (dir: string | null) => void
  outputPath: string | null
  setOutputPath: (path: string | null) => void

  // Stats
  replacementCount: number
  setReplacementCount: (count: number) => void

  // Error
  error: string | null
  setError: (error: string | null) => void

  // Model
  modelReady: boolean
  setModelReady: (ready: boolean) => void
  modelLoading: boolean
  setModelLoading: (loading: boolean) => void
  modelProgress: number
  setModelProgress: (percent: number) => void
  modelError: string | null
  setModelError: (error: string | null) => void

  // Reset
  reset: () => void
}

export const useStore = create<AppState>((set) => ({
  screen: 'welcome',
  setScreen: (screen) => set({ screen }),

  document: null,
  setDocument: (document) => set({ document }),

  entities: [],
  setEntities: (entities) => set({ entities }),
  updateEntity: (id, updates) =>
    set((state) => ({
      entities: state.entities.map((e) => (e.id === id ? { ...e, ...updates } : e))
    })),
  removeEntity: (id) =>
    set((state) => ({
      entities: state.entities.filter((e) => e.id !== id)
    })),
  addEntity: (entity) =>
    set((state) => ({
      entities: [...state.entities, entity]
    })),

  dictionary: {},
  setDictionary: (dictionary) => set({ dictionary }),

  progress: null,
  setProgress: (progress) => set({ progress }),

  outputDir: null,
  setOutputDir: (outputDir) => set({ outputDir }),
  outputPath: null,
  setOutputPath: (outputPath) => set({ outputPath }),

  replacementCount: 0,
  setReplacementCount: (replacementCount) => set({ replacementCount }),

  error: null,
  setError: (error) => set({ error }),

  modelReady: false,
  setModelReady: (modelReady) => set({ modelReady }),
  modelLoading: true,
  setModelLoading: (modelLoading) => set({ modelLoading }),
  modelProgress: 0,
  setModelProgress: (modelProgress) => set({ modelProgress }),
  modelError: null,
  setModelError: (modelError) => set({ modelError }),

  reset: () =>
    set({
      document: null,
      entities: [],
      progress: null,
      outputDir: null,
      outputPath: null,
      replacementCount: 0,
      error: null
    })
}))
