export type MLModelType = 'STRATEGY' | 'BEHAVIOR' | 'ANOMALY' | 'RISK' | 'PATTERN'

export interface MLModelConfig {
  inputFeatures: number
  outputFeatures: number
  sequenceLength?: number
  epochs?: number
  optimizer?: string
  loss?: string
  layers?: {
    type: string
    units: number
    activation?: string
  }[]
}

export interface MLPredictionInput {
  features: number[]
  journalId?: number
  metadata?: Record<string, any>
}

export interface MLTrainingData {
  features: number[][]
  labels: number[][]
  metadata?: Record<string, any>
}

export interface MLMetrics {
  loss: number
  accuracy: number
  validationLoss?: number
  validationAccuracy?: number
}

export interface MLPredictionResult {
  prediction: number[]
  confidence: number
  metadata?: Record<string, any>
} 