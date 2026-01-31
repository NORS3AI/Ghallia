/**
 * Simple JSON File Storage
 * In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SAVES_FILE = path.join(DATA_DIR, 'saves.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  lastLogin: string;
}

// Save data interface
export interface SaveData {
  userId: string;
  gameState: any;
  savedAt: string;
  version: number;
}

// Load users from file
function loadUsers(): Record<string, User> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading users:', err);
  }
  return {};
}

// Save users to file
function saveUsers(users: Record<string, User>): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Load saves from file
function loadSaves(): Record<string, SaveData> {
  try {
    if (fs.existsSync(SAVES_FILE)) {
      const data = fs.readFileSync(SAVES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading saves:', err);
  }
  return {};
}

// Save saves to file
function saveSaves(saves: Record<string, SaveData>): void {
  fs.writeFileSync(SAVES_FILE, JSON.stringify(saves, null, 2));
}

// User operations
export const userStore = {
  getById(id: string): User | undefined {
    const users = loadUsers();
    return users[id];
  },

  getByUsername(username: string): User | undefined {
    const users = loadUsers();
    return Object.values(users).find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  getByEmail(email: string): User | undefined {
    const users = loadUsers();
    return Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  create(user: User): User {
    const users = loadUsers();
    users[user.id] = user;
    saveUsers(users);
    return user;
  },

  updateLastLogin(id: string): void {
    const users = loadUsers();
    if (users[id]) {
      users[id].lastLogin = new Date().toISOString();
      saveUsers(users);
    }
  },
};

// Save operations
export const saveStore = {
  get(userId: string): SaveData | undefined {
    const saves = loadSaves();
    return saves[userId];
  },

  save(userId: string, gameState: any): SaveData {
    const saves = loadSaves();
    const existing = saves[userId];
    const saveData: SaveData = {
      userId,
      gameState,
      savedAt: new Date().toISOString(),
      version: existing ? existing.version + 1 : 1,
    };
    saves[userId] = saveData;
    saveSaves(saves);
    return saveData;
  },

  delete(userId: string): boolean {
    const saves = loadSaves();
    if (saves[userId]) {
      delete saves[userId];
      saveSaves(saves);
      return true;
    }
    return false;
  },
};
