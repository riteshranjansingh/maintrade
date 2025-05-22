import { PrismaClient } from '@prisma/client'
import * as tf from '@tensorflow/tfjs'
import { MLModelType, MLModelConfig, MLPredictionInput } from '../../types/ml'

export class MLService {
  private static instance: MLService
  private prisma: PrismaClient
  private models: Map<number, tf.LayersModel>

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.models = new Map()
  }

  public static getInstance(prisma: PrismaClient): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService(prisma)
    }
    return MLService.instance
  }

  async createModel(name: string, type: MLModelType, config: MLModelConfig) {
    try {
      const model = await this.prisma.mLModel.create({
        data: {
          name,
          type,
          config: JSON.stringify(config),
          status: 'READY'
        }
      })
      return model
    } catch (error) {
      console.error('Failed to create ML model:', error)
      throw error
    }
  }

  async trainModel(modelId: number, trainingData: any[]) {
    try {
      // Start training session
      const session = await this.prisma.mLTrainingSession.create({
        data: {
          modelId,
          status: 'RUNNING'
        }
      })

      // Get model configuration
      const model = await this.prisma.mLModel.findUnique({
        where: { id: modelId }
      })

      if (!model) {
        throw new Error('Model not found')
      }

      const config = JSON.parse(model.config)
      
      // Create and train TensorFlow model based on type
      const tfModel = await this.createTFModel(model.type, config)
      const { trainX, trainY } = this.prepareTrainingData(trainingData, model.type)
      
      await tfModel.fit(trainX, trainY, {
        epochs: config.epochs || 10,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss}`)
          }
        }
      })

      // Save trained model
      this.models.set(modelId, tfModel)

      // Update training session
      await this.prisma.mLTrainingSession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          endTime: new Date(),
          metrics: JSON.stringify({ loss: tfModel.history })
        }
      })

      return session
    } catch (error) {
      console.error('Failed to train model:', error)
      throw error
    }
  }

  async predict(modelId: number, input: MLPredictionInput) {
    try {
      let tfModel = this.models.get(modelId)
      
      if (!tfModel) {
        // Load model if not in memory
        const model = await this.prisma.mLModel.findUnique({
          where: { id: modelId }
        })
        
        if (!model) {
          throw new Error('Model not found')
        }
        
        const config = JSON.parse(model.config)
        tfModel = await this.createTFModel(model.type, config)
        this.models.set(modelId, tfModel)
      }

      // Prepare input data
      const tensorInput = this.prepareInputData(input, modelId)
      
      // Make prediction
      const prediction = await tfModel.predict(tensorInput)
      const predictionData = Array.isArray(prediction) 
        ? prediction.map(p => p.dataSync())
        : prediction.dataSync()

      // Save prediction
      const savedPrediction = await this.prisma.mLPrediction.create({
        data: {
          modelId,
          input: JSON.stringify(input),
          prediction: JSON.stringify(predictionData),
          confidence: this.calculateConfidence(predictionData),
          journalId: input.journalId
        }
      })

      return savedPrediction
    } catch (error) {
      console.error('Failed to make prediction:', error)
      throw error
    }
  }

  private async createTFModel(type: string, config: MLModelConfig): Promise<tf.LayersModel> {
    const model = tf.sequential()
    
    // Add layers based on model type and config
    switch (type) {
      case 'STRATEGY':
        model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [config.inputFeatures] }))
        model.add(tf.layers.dense({ units: 32, activation: 'relu' }))
        model.add(tf.layers.dense({ units: config.outputFeatures, activation: 'softmax' }))
        break
      case 'BEHAVIOR':
        model.add(tf.layers.lstm({ units: 32, inputShape: [config.sequenceLength, config.inputFeatures] }))
        model.add(tf.layers.dense({ units: config.outputFeatures, activation: 'sigmoid' }))
        break
      // Add more model architectures as needed
    }

    model.compile({
      optimizer: config.optimizer || 'adam',
      loss: config.loss || 'categoricalCrossentropy',
      metrics: ['accuracy']
    })

    return model
  }

  private prepareTrainingData(data: any[], type: string) {
    // Implement data preparation logic based on model type
    // Return { trainX, trainY }
    throw new Error('Not implemented')
  }

  private prepareInputData(input: MLPredictionInput, modelId: number) {
    // Implement input preparation logic
    // Return tensor
    throw new Error('Not implemented')
  }

  private calculateConfidence(predictionData: number[] | Float32Array): number {
    // Implement confidence calculation logic
    return Math.max(...Array.from(predictionData))
  }
} 