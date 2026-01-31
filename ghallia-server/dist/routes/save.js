"use strict";
/**
 * Save Routes
 * Handles cloud save and load operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRouter = void 0;
const express_1 = require("express");
const storage_1 = require("../data/storage");
exports.saveRouter = (0, express_1.Router)();
/**
 * GET /api/save
 * Load the user's cloud save
 */
exports.saveRouter.get('/', (req, res) => {
    try {
        const userId = req.user.userId;
        const saveData = storage_1.saveStore.get(userId);
        if (!saveData) {
            return res.status(404).json({ error: 'No save found' });
        }
        res.json({
            gameState: saveData.gameState,
            savedAt: saveData.savedAt,
            version: saveData.version,
        });
    }
    catch (err) {
        console.error('Load save error:', err);
        res.status(500).json({ error: 'Failed to load save' });
    }
});
/**
 * POST /api/save
 * Save the user's game state to cloud
 */
exports.saveRouter.post('/', (req, res) => {
    try {
        const userId = req.user.userId;
        const { gameState } = req.body;
        if (!gameState) {
            return res.status(400).json({ error: 'Game state is required' });
        }
        const saveData = storage_1.saveStore.save(userId, gameState);
        res.json({
            message: 'Save successful',
            savedAt: saveData.savedAt,
            version: saveData.version,
        });
    }
    catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: 'Failed to save game' });
    }
});
/**
 * DELETE /api/save
 * Delete the user's cloud save
 */
exports.saveRouter.delete('/', (req, res) => {
    try {
        const userId = req.user.userId;
        const deleted = storage_1.saveStore.delete(userId);
        if (!deleted) {
            return res.status(404).json({ error: 'No save found to delete' });
        }
        res.json({ message: 'Save deleted successfully' });
    }
    catch (err) {
        console.error('Delete save error:', err);
        res.status(500).json({ error: 'Failed to delete save' });
    }
});
/**
 * GET /api/save/info
 * Get save metadata without the full game state
 */
exports.saveRouter.get('/info', (req, res) => {
    try {
        const userId = req.user.userId;
        const saveData = storage_1.saveStore.get(userId);
        if (!saveData) {
            return res.json({ hasSave: false });
        }
        res.json({
            hasSave: true,
            savedAt: saveData.savedAt,
            version: saveData.version,
        });
    }
    catch (err) {
        console.error('Save info error:', err);
        res.status(500).json({ error: 'Failed to get save info' });
    }
});
//# sourceMappingURL=save.js.map