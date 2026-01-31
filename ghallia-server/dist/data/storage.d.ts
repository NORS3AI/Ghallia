/**
 * Simple JSON File Storage
 * In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
 */
export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    lastLogin: string;
}
export interface SaveData {
    userId: string;
    gameState: any;
    savedAt: string;
    version: number;
}
export declare const userStore: {
    getById(id: string): User | undefined;
    getByUsername(username: string): User | undefined;
    getByEmail(email: string): User | undefined;
    create(user: User): User;
    updateLastLogin(id: string): void;
};
export declare const saveStore: {
    get(userId: string): SaveData | undefined;
    save(userId: string, gameState: any): SaveData;
    delete(userId: string): boolean;
};
//# sourceMappingURL=storage.d.ts.map