"use strict";
/**
 * Simple JSON File Storage
 * In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveStore = exports.userStore = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, '../../data');
const USERS_FILE = path_1.default.join(DATA_DIR, 'users.json');
const SAVES_FILE = path_1.default.join(DATA_DIR, 'saves.json');
// Ensure data directory exists
if (!fs_1.default.existsSync(DATA_DIR)) {
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
}
// Load users from file
function loadUsers() {
    try {
        if (fs_1.default.existsSync(USERS_FILE)) {
            const data = fs_1.default.readFileSync(USERS_FILE, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (err) {
        console.error('Error loading users:', err);
    }
    return {};
}
// Save users to file
function saveUsers(users) {
    fs_1.default.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
// Load saves from file
function loadSaves() {
    try {
        if (fs_1.default.existsSync(SAVES_FILE)) {
            const data = fs_1.default.readFileSync(SAVES_FILE, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (err) {
        console.error('Error loading saves:', err);
    }
    return {};
}
// Save saves to file
function saveSaves(saves) {
    fs_1.default.writeFileSync(SAVES_FILE, JSON.stringify(saves, null, 2));
}
// User operations
exports.userStore = {
    getById(id) {
        const users = loadUsers();
        return users[id];
    },
    getByUsername(username) {
        const users = loadUsers();
        return Object.values(users).find(u => u.username.toLowerCase() === username.toLowerCase());
    },
    getByEmail(email) {
        const users = loadUsers();
        return Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
    },
    create(user) {
        const users = loadUsers();
        users[user.id] = user;
        saveUsers(users);
        return user;
    },
    updateLastLogin(id) {
        const users = loadUsers();
        if (users[id]) {
            users[id].lastLogin = new Date().toISOString();
            saveUsers(users);
        }
    },
};
// Save operations
exports.saveStore = {
    get(userId) {
        const saves = loadSaves();
        return saves[userId];
    },
    save(userId, gameState) {
        const saves = loadSaves();
        const existing = saves[userId];
        const saveData = {
            userId,
            gameState,
            savedAt: new Date().toISOString(),
            version: existing ? existing.version + 1 : 1,
        };
        saves[userId] = saveData;
        saveSaves(saves);
        return saveData;
    },
    delete(userId) {
        const saves = loadSaves();
        if (saves[userId]) {
            delete saves[userId];
            saveSaves(saves);
            return true;
        }
        return false;
    },
};
//# sourceMappingURL=storage.js.map