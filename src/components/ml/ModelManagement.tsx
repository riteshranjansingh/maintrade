import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MLModelType, MLModelConfig } from '../../types/ml'
import { createModel, trainModel, predictWithModel } from '../../store/slices/mlSlice'
import { RootState } from '../../store/store'

const ModelManagement: React.FC = () => {
  const dispatch = useDispatch()
  const { models, loading, error } = useSelector((state: RootState) => state.ml)
  
  const [newModel, setNewModel] = useState({
    name: '',
    type: 'STRATEGY' as MLModelType,
    config: {
      inputFeatures: 10,
      outputFeatures: 2,
      sequenceLength: 10,
      epochs: 50
    } as MLModelConfig
  })

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(createModel(newModel)).unwrap()
      setNewModel({
        name: '',
        type: 'STRATEGY',
        config: {
          inputFeatures: 10,
          outputFeatures: 2,
          sequenceLength: 10,
          epochs: 50
        }
      })
    } catch (error) {
      console.error('Failed to create model:', error)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">ML Model Management</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create Model Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Create New Model</h3>
        <form onSubmit={handleCreateModel} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Name
            </label>
            <input
              type="text"
              value={newModel.name}
              onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Type
            </label>
            <select
              value={newModel.type}
              onChange={(e) => setNewModel({ ...newModel, type: e.target.value as MLModelType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="STRATEGY">Trading Strategy</option>
              <option value="BEHAVIOR">Trading Behavior</option>
              <option value="ANOMALY">Market Anomaly</option>
              <option value="RISK">Risk Assessment</option>
              <option value="PATTERN">Pattern Recognition</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Features
              </label>
              <input
                type="number"
                value={newModel.config.inputFeatures}
                onChange={(e) => setNewModel({
                  ...newModel,
                  config: { ...newModel.config, inputFeatures: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Features
              </label>
              <input
                type="number"
                value={newModel.config.outputFeatures}
                onChange={(e) => setNewModel({
                  ...newModel,
                  config: { ...newModel.config, outputFeatures: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating...' : 'Create Model'}
          </button>
        </form>
      </div>

      {/* Model List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Existing Models</h3>
        <div className="space-y-4">
          {Object.values(models).map((model) => (
            <div
              key={model.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium">{model.name}</h4>
                <span
                  className={`px-2 py-1 text-sm rounded-full ${
                    model.status === 'READY'
                      ? 'bg-green-100 text-green-800'
                      : model.status === 'TRAINING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {model.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Type: {model.type}</p>
              {model.metrics && (
                <div className="text-sm text-gray-600">
                  <p>Accuracy: {(model.metrics.accuracy * 100).toFixed(2)}%</p>
                  <p>Loss: {model.metrics.loss.toFixed(4)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModelManagement 