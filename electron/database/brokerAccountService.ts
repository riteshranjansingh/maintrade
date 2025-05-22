import { PrismaClient } from '@prisma/client'
import EncryptionService from '../utils/encryption'
import { BrokerType, BROKER_CONFIGS } from '../../src/types/broker'

class BrokerAccountService {
  private static instance: BrokerAccountService
  private prisma: PrismaClient

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  public static getInstance(prisma: PrismaClient): BrokerAccountService {
    if (!BrokerAccountService.instance) {
      BrokerAccountService.instance = new BrokerAccountService(prisma)
    }
    return BrokerAccountService.instance
  }

  // Helper to serialize broker account (convert dates to strings)
  private serializeBrokerAccount(account: any) {
    return {
      ...account,
      // Decrypt API credentials for frontend
      apiKey: account.apiKeyEncrypted ? EncryptionService.decrypt(account.apiKeyEncrypted) : '',
      apiSecret: account.apiSecretEncrypted ? EncryptionService.decrypt(account.apiSecretEncrypted) : '',
      // Remove encrypted fields from response
      apiKeyEncrypted: undefined,
      apiSecretEncrypted: undefined,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
      lastResetDate: account.lastResetDate.toISOString()
    }
  }

  // Get all broker accounts for a profile
  async getBrokerAccountsByProfile(profileId: number) {
    console.log(`📊 Fetching broker accounts for profile: ${profileId}`)
    try {
      const accounts = await this.prisma.brokerAccount.findMany({
        where: { profileId },
        orderBy: { createdAt: 'desc' }
      })
      
      const serializedAccounts = accounts.map(account => this.serializeBrokerAccount(account))
      console.log(`✅ Found ${accounts.length} broker accounts`)
      return serializedAccounts
    } catch (error) {
      console.error('❌ Failed to fetch broker accounts:', error)
      throw error
    }
  }

  // Create new broker account
  async createBrokerAccount(data: {
    profileId: number
    brokerName: BrokerType
    displayName: string
    accountId: string
    apiKey: string
    apiSecret: string
  }) {
    console.log(`📊 Creating broker account: ${data.displayName} (${data.brokerName})`)
    try {
      // Check if broker already exists for this profile
      const existingAccount = await this.prisma.brokerAccount.findUnique({
        where: {
          profileId_brokerName: {
            profileId: data.profileId,
            brokerName: data.brokerName
          }
        }
      })

      if (existingAccount) {
        throw new Error(`${BROKER_CONFIGS[data.brokerName].name} account already exists for this profile`)
      }

      // Encrypt API credentials
      const apiKeyEncrypted = EncryptionService.encrypt(data.apiKey)
      const apiSecretEncrypted = EncryptionService.encrypt(data.apiSecret)

      // Determine broker capabilities
      const brokerConfig = BROKER_CONFIGS[data.brokerName]
      const supportsData = ['fyers', 'upstox', 'shoonya', 'mstock'].includes(data.brokerName)
      
      // Create the account
      const account = await this.prisma.brokerAccount.create({
        data: {
          profileId: data.profileId,
          brokerName: data.brokerName,
          displayName: data.displayName,
          accountId: data.accountId,
          apiKeyEncrypted,
          apiSecretEncrypted,
          supportsTrading: true, // All brokers support trading
          supportsData,
          isActive: true,
          isSelectedForData: false // Will be set separately
        }
      })

      console.log(`✅ Broker account created with ID: ${account.id}`)
      return this.serializeBrokerAccount(account)
    } catch (error) {
      console.error('❌ Failed to create broker account:', error)
      throw error
    }
  }

  // Update broker account
  async updateBrokerAccount(id: number, updates: {
    displayName?: string
    accountId?: string
    apiKey?: string
    apiSecret?: string
    isActive?: boolean
  }) {
    console.log(`📊 Updating broker account: ${id}`)
    try {
      // Prepare update data
      const updateData: any = {}
      
      if (updates.displayName) updateData.displayName = updates.displayName
      if (updates.accountId) updateData.accountId = updates.accountId
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive
      
      // Encrypt new API credentials if provided
      if (updates.apiKey) {
        updateData.apiKeyEncrypted = EncryptionService.encrypt(updates.apiKey)
      }
      if (updates.apiSecret) {
        updateData.apiSecretEncrypted = EncryptionService.encrypt(updates.apiSecret)
      }

      const account = await this.prisma.brokerAccount.update({
        where: { id },
        data: updateData
      })

      console.log(`✅ Broker account updated successfully`)
      return this.serializeBrokerAccount(account)
    } catch (error) {
      console.error('❌ Failed to update broker account:', error)
      throw error
    }
  }

  // Delete broker account
  async deleteBrokerAccount(id: number) {
    console.log(`📊 Deleting broker account: ${id}`)
    try {
      const account = await this.prisma.brokerAccount.delete({
        where: { id }
      })

      console.log(`✅ Broker account deleted successfully`)
      return this.serializeBrokerAccount(account)
    } catch (error) {
      console.error('❌ Failed to delete broker account:', error)
      throw error
    }
  }

  // Set data source (only one can be active at a time)
  async setDataSource(profileId: number, brokerAccountId: number) {
    console.log(`📊 Setting data source for profile ${profileId} to account ${brokerAccountId}`)
    try {
      // First, disable all data sources for this profile
      await this.prisma.brokerAccount.updateMany({
        where: { profileId },
        data: { isSelectedForData: false }
      })

      // Then enable the selected one (must support data)
      const account = await this.prisma.brokerAccount.update({
        where: { 
          id: brokerAccountId,
          supportsData: true // Only allow data-supporting brokers
        },
        data: { isSelectedForData: true }
      })

      console.log(`✅ Data source set to: ${account.displayName}`)
      return this.serializeBrokerAccount(account)
    } catch (error) {
      console.error('❌ Failed to set data source:', error)
      throw error
    }
  }

  // Get current data source for a profile
  async getCurrentDataSource(profileId: number) {
    console.log(`📊 Getting current data source for profile: ${profileId}`)
    try {
      const account = await this.prisma.brokerAccount.findFirst({
        where: { 
          profileId,
          isSelectedForData: true,
          isActive: true
        }
      })

      if (account) {
        console.log(`✅ Current data source: ${account.displayName}`)
        return this.serializeBrokerAccount(account)
      } else {
        console.log(`ℹ️ No data source selected for profile ${profileId}`)
        return null
      }
    } catch (error) {
      console.error('❌ Failed to get current data source:', error)
      throw error
    }
  }

  // Track API usage (for rate limiting)
  async trackApiUsage(brokerAccountId: number, requestCount = 1) {
    console.log(`📈 Tracking API usage for account: ${brokerAccountId}`)
    try {
      const account = await this.prisma.brokerAccount.findUnique({
        where: { id: brokerAccountId }
      })

      if (!account) {
        throw new Error('Broker account not found')
      }

      // Check if we need to reset counters (new day/month)
      const now = new Date()
      const lastReset = new Date(account.lastResetDate)
      const shouldResetDaily = now.toDateString() !== lastReset.toDateString()
      const shouldResetMonthly = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()

      const updateData: any = {
        dailyDataRequests: shouldResetDaily ? requestCount : account.dailyDataRequests + requestCount,
        monthlyDataRequests: shouldResetMonthly ? requestCount : account.monthlyDataRequests + requestCount
      }

      if (shouldResetDaily || shouldResetMonthly) {
        updateData.lastResetDate = now
      }

      const updatedAccount = await this.prisma.brokerAccount.update({
        where: { id: brokerAccountId },
        data: updateData
      })

      console.log(`✅ API usage tracked: Daily ${updatedAccount.dailyDataRequests}, Monthly ${updatedAccount.monthlyDataRequests}`)
      return this.serializeBrokerAccount(updatedAccount)
    } catch (error) {
      console.error('❌ Failed to track API usage:', error)
      throw error
    }
  }
}

export default BrokerAccountService