import { ipcMain } from 'electron';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Register IPC handlers for profile-related operations
 */
export const registerProfileHandlers = () => {
  console.log('Registering profile handlers');
  
  // Get all profiles
  ipcMain.handle('profiles:getAll', async () => {
    console.log('IPC: profiles:getAll called');
    try {
      const profiles = await prisma.profile.findMany();
      console.log('Found profiles:', profiles);
      return { success: true, data: profiles };
    } catch (error) {
      console.error('Failed to get profiles:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Get profile by ID
  ipcMain.handle('profiles:getById', async (_event, id: number) => {
    console.log(`IPC: profiles:getById called with id: ${id}`);
    try {
      const profile = await prisma.profile.findUnique({
        where: { id },
      });
      return { success: true, data: profile };
    } catch (error) {
      console.error(`Failed to get profile with ID ${id}:`, error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Create a new profile
  ipcMain.handle('profiles:create', async (_event, name: string) => {
    console.log(`IPC: profiles:create called with name: ${name}`);
    try {
      const profile = await prisma.profile.create({
        data: { name },
      });
      return { success: true, data: profile };
    } catch (error) {
      console.error('Failed to create profile:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Update a profile
  ipcMain.handle('profiles:update', async (_event, id: number, name: string) => {
    console.log(`IPC: profiles:update called with id: ${id}, name: ${name}`);
    try {
      const profile = await prisma.profile.update({
        where: { id },
        data: { name },
      });
      return { success: true, data: profile };
    } catch (error) {
      console.error(`Failed to update profile with ID ${id}:`, error);
      return { success: false, error: (error as Error).message };
    }
  });

  // Delete a profile
  ipcMain.handle('profiles:delete', async (_event, id: number) => {
    console.log(`IPC: profiles:delete called with id: ${id}`);
    try {
      const profile = await prisma.profile.delete({
        where: { id },
      });
      return { success: true, data: profile };
    } catch (error) {
      console.error(`Failed to delete profile with ID ${id}:`, error);
      return { success: false, error: (error as Error).message };
    }
  });
};