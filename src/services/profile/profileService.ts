import prisma from '../db/prismaClient';
import { Profile } from '@prisma/client';

/**
 * Service for managing user profiles
 */
export const profileService = {
  /**
   * Get all profiles
   */
  getAllProfiles: async (): Promise<Profile[]> => {
    return prisma.profile.findMany();
  },

  /**
   * Get a profile by ID
   */
  getProfileById: async (id: number): Promise<Profile | null> => {
    return prisma.profile.findUnique({
      where: { id },
    });
  },

  /**
   * Create a new profile
   */
  createProfile: async (name: string): Promise<Profile> => {
    return prisma.profile.create({
      data: { name },
    });
  },

  /**
   * Update a profile
   */
  updateProfile: async (id: number, name: string): Promise<Profile> => {
    return prisma.profile.update({
      where: { id },
      data: { name },
    });
  },

  /**
   * Delete a profile
   */
  deleteProfile: async (id: number): Promise<Profile> => {
    return prisma.profile.delete({
      where: { id },
    });
  },
};