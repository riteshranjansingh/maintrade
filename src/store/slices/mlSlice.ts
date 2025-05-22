import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { MLModelType, MLModelConfig, MLTrainingData, MLMetrics } from '../../types/ml'

interface MLState {
  models: {
    [key: number]: {
      id: number
      name: string
      type: MLModelType
      status: 'READY' | 'TRAINING' | 'ERROR'
      metrics?: MLMetrics
    }
  }
  activeTrainingSessions: number[]
  error: string | null
  loading: boolean
}

const initialState: MLState = {
  models: {},
  activeTrainingSessions: [],
  error: null,
  loading: false
}

// Async thunks
export const createModel = createAsyncThunk(
  'ml/createModel',
  async (data: { name: string; type: MLModelType; config: MLModelConfig }) => {
    try {
      const response = await window.electron.invoke('ml:createModel', data)
      return response
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create model')
    }
  }
)

export const trainModel = createAsyncThunk(
  'ml/trainModel',
  async (data: { modelId: number; trainingData: MLTrainingData }) => {
    try {
      const response = await window.electron.invoke('ml:trainModel', data)
      return response
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to train model')
    }
  }
)

export const predictWithModel = createAsyncThunk(
  'ml/predict',
  async (data: { modelId: number; features: number[] }) => {
    try {
      const response = await window.electron.invoke('ml:predict', data)
      return response
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to make prediction')
    }
  }
)

const mlSlice = createSlice({
  name: 'ml',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateModelMetrics: (state, action: PayloadAction<{ modelId: number; metrics: MLMetrics }>) => {
      const { modelId, metrics } = action.payload
      if (state.models[modelId]) {
        state.models[modelId].metrics = metrics
      }
    }
  },
  extraReducers: (builder) => {
    // Create model
    builder.addCase(createModel.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createModel.fulfilled, (state, action) => {
      state.loading = false
      const model = action.payload
      state.models[model.id] = {
        id: model.id,
        name: model.name,
        type: model.type as MLModelType,
        status: 'READY'
      }
    })
    builder.addCase(createModel.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to create model'
    })

    // Train model
    builder.addCase(trainModel.pending, (state, action) => {
      state.loading = true
      state.error = null
      const modelId = action.meta.arg.modelId
      if (state.models[modelId]) {
        state.models[modelId].status = 'TRAINING'
        state.activeTrainingSessions.push(modelId)
      }
    })
    builder.addCase(trainModel.fulfilled, (state, action) => {
      state.loading = false
      const modelId = action.meta.arg.modelId
      if (state.models[modelId]) {
        state.models[modelId].status = 'READY'
        state.activeTrainingSessions = state.activeTrainingSessions.filter(id => id !== modelId)
      }
    })
    builder.addCase(trainModel.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to train model'
      const modelId = action.meta.arg.modelId
      if (state.models[modelId]) {
        state.models[modelId].status = 'ERROR'
        state.activeTrainingSessions = state.activeTrainingSessions.filter(id => id !== modelId)
      }
    })
  }
})

export const { clearError, updateModelMetrics } = mlSlice.actions
export default mlSlice.reducer 