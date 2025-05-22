import { PrismaClient } from '@prisma/client'
import * as path from 'path'

// Create a singleton Prisma client for the main process
class DatabaseService {
  private static instance: DatabaseService
  private prisma: PrismaClient

  private constructor() {
    // Initialize Prisma client
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`
        }
      }
    })
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Helper function to serialize dates
  private serializeProfile(profile: any) {
    return {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    }
  }

  // Profile operations
  async getAllProfiles() {
    console.log('📊 Fetching all profiles from database...')
    try {
      const profiles = await this.prisma.profile.findMany({
        orderBy: { createdAt: 'desc' }
      })
      
      // Convert dates to strings for Redux serialization
      const serializedProfiles = profiles.map(profile => this.serializeProfile(profile))
      
      console.log(`✅ Found ${profiles.length} profiles in database`)
      return serializedProfiles
    } catch (error) {
      console.error('❌ Failed to fetch profiles:', error)
      throw error
    }
  }

  async getProfileById(id: number) {
    console.log(`📊 Fetching profile with ID: ${id}`)
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { id },
        include: {
          brokerAccounts: true // Include broker accounts when we add them
        }
      })
      
      if (!profile) {
        console.log('❌ Profile not found')
        return null
      }
      
      const serializedProfile = this.serializeProfile(profile)
      console.log(`✅ Profile found:`, profile.name)
      return serializedProfile
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error)
      throw error
    }
  }

  async createProfile(name: string) {
    console.log(`📊 Creating new profile: ${name}`)
    try {
      const profile = await this.prisma.profile.create({
        data: { name }
      })
      
      const serializedProfile = this.serializeProfile(profile)
      console.log(`✅ Profile created with ID: ${profile.id}`)
      return serializedProfile
    } catch (error) {
      console.error('❌ Failed to create profile:', error)
      throw error
    }
  }

  async updateProfile(id: number, name: string) {
    console.log(`📊 Updating profile ${id} with name: ${name}`)
    try {
      const profile = await this.prisma.profile.update({
        where: { id },
        data: { name }
      })
      
      const serializedProfile = this.serializeProfile(profile)
      console.log(`✅ Profile updated successfully`)
      return serializedProfile
    } catch (error) {
      console.error('❌ Failed to update profile:', error)
      throw error
    }
  }

  async deleteProfile(id: number) {
    console.log(`📊 Deleting profile with ID: ${id}`)
    try {
      const profile = await this.prisma.profile.delete({
        where: { id }
      })
      
      const serializedProfile = this.serializeProfile(profile)
      console.log(`✅ Profile deleted successfully`)
      return serializedProfile
    } catch (error) {
      console.error('❌ Failed to delete profile:', error)
      throw error
    }
  }

  // Cleanup method
  async disconnect() {
    console.log('🔌 Disconnecting from database...')
    await this.prisma.$disconnect()
  }
}

export default DatabaseService