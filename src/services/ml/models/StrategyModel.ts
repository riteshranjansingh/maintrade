import * as tf from '@tensorflow/tfjs'
import { MLModelConfig, MLTrainingData } from '../../../types/ml'

export class StrategyModel {
  private model: tf.LayersModel | null = null
  private config: MLModelConfig

  constructor(config: MLModelConfig) {
    this.config = config
  }

  async build(): Promise<void> {
    const model = tf.sequential()
    
    // Input layer
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [this.config.inputFeatures]
    }))

    // Hidden layers
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }))

    // Output layer
    model.add(tf.layers.dense({
      units: this.config.outputFeatures,
      activation: 'softmax'
    }))

    model.compile({
      optimizer: this.config.optimizer || 'adam',
      loss: this.config.loss || 'categoricalCrossentropy',
      metrics: ['accuracy']
    })

    this.model = model
  }

  async train(data: MLTrainingData, epochs: number = 10): Promise<tf.History> {
    if (!this.model) {
      await this.build()
    }

    const xs = tf.tensor2d(data.features)
    const ys = tf.tensor2d(data.labels)

    const history = await this.model!.fit(xs, ys, {
      epochs,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`)
        }
      }
    })

    // Clean up tensors
    xs.dispose()
    ys.dispose()

    return history
  }

  async predict(features: number[]): Promise<number[]> {
    if (!this.model) {
      throw new Error('Model not built or trained')
    }

    const input = tf.tensor2d([features])
    const prediction = this.model.predict(input) as tf.Tensor

    const result = Array.from(prediction.dataSync())

    // Clean up tensors
    input.dispose()
    prediction.dispose()

    return result
  }

  async save(path: string): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save')
    }
    await this.model.save(`file://${path}`)
  }

  async load(path: string): Promise<void> {
    this.model = await tf.loadLayersModel(`file://${path}`)
    this.model.compile({
      optimizer: this.config.optimizer || 'adam',
      loss: this.config.loss || 'categoricalCrossentropy',
      metrics: ['accuracy']
    })
  }
} 