import * as tf from '@tensorflow/tfjs'
import { MLModelConfig, MLTrainingData } from '../../../types/ml'

export class BehaviorModel {
  private model: tf.LayersModel | null = null
  private config: MLModelConfig

  constructor(config: MLModelConfig) {
    this.config = config
  }

  async build(): Promise<void> {
    const model = tf.sequential()
    
    // LSTM layer for sequence processing
    model.add(tf.layers.lstm({
      units: 32,
      returnSequences: false,
      inputShape: [this.config.sequenceLength || 10, this.config.inputFeatures]
    }))

    // Dense layers for pattern recognition
    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu'
    }))

    // Output layer
    model.add(tf.layers.dense({
      units: this.config.outputFeatures,
      activation: 'sigmoid'
    }))

    model.compile({
      optimizer: this.config.optimizer || 'adam',
      loss: this.config.loss || 'binaryCrossentropy',
      metrics: ['accuracy']
    })

    this.model = model
  }

  async train(data: MLTrainingData, epochs: number = 10): Promise<tf.History> {
    if (!this.model) {
      await this.build()
    }

    // Reshape input data for LSTM [samples, time steps, features]
    const xs = tf.tensor3d(this.reshapeFeatures(data.features, this.config.sequenceLength || 10))
    const ys = tf.tensor2d(data.labels)

    const history = await this.model!.fit(xs, ys, {
      epochs,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch: number, logs: tf.Logs | undefined) => {
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

    // Reshape input for LSTM
    const reshapedFeatures = this.reshapeFeatures([features], this.config.sequenceLength || 10)
    const input = tf.tensor3d(reshapedFeatures)
    const prediction = this.model.predict(input) as tf.Tensor

    const result = Array.from(prediction.dataSync()) as number[]

    // Clean up tensors
    input.dispose()
    prediction.dispose()

    return result
  }

  private reshapeFeatures(features: number[][], sequenceLength: number): number[][][] {
    const samples: number[][][] = []
    
    for (let i = 0; i <= features.length - sequenceLength; i++) {
      const sequence = features.slice(i, i + sequenceLength)
      samples.push(sequence)
    }

    return samples
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
      loss: this.config.loss || 'binaryCrossentropy',
      metrics: ['accuracy']
    })
  }
} 