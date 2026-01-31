/**
 * Save Routes
 * Handles cloud save and load operations
 */

import { Router, Request, Response } from 'express';
import { saveStore } from '../data/storage';

export const saveRouter = Router();

/**
 * GET /api/save
 * Load the user's cloud save
 */
saveRouter.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const saveData = saveStore.get(userId);

    if (!saveData) {
      return res.status(404).json({ error: 'No save found' });
    }

    res.json({
      gameState: saveData.gameState,
      savedAt: saveData.savedAt,
      version: saveData.version,
    });
  } catch (err) {
    console.error('Load save error:', err);
    res.status(500).json({ error: 'Failed to load save' });
  }
});

/**
 * POST /api/save
 * Save the user's game state to cloud
 */
saveRouter.post('/', (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { gameState } = req.body;

    if (!gameState) {
      return res.status(400).json({ error: 'Game state is required' });
    }

    const saveData = saveStore.save(userId, gameState);

    res.json({
      message: 'Save successful',
      savedAt: saveData.savedAt,
      version: saveData.version,
    });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

/**
 * DELETE /api/save
 * Delete the user's cloud save
 */
saveRouter.delete('/', (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const deleted = saveStore.delete(userId);

    if (!deleted) {
      return res.status(404).json({ error: 'No save found to delete' });
    }

    res.json({ message: 'Save deleted successfully' });
  } catch (err) {
    console.error('Delete save error:', err);
    res.status(500).json({ error: 'Failed to delete save' });
  }
});

/**
 * GET /api/save/info
 * Get save metadata without the full game state
 */
saveRouter.get('/info', (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const saveData = saveStore.get(userId);

    if (!saveData) {
      return res.json({ hasSave: false });
    }

    res.json({
      hasSave: true,
      savedAt: saveData.savedAt,
      version: saveData.version,
    });
  } catch (err) {
    console.error('Save info error:', err);
    res.status(500).json({ error: 'Failed to get save info' });
  }
});
