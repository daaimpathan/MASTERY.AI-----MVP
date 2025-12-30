// MOCK FIREBASE IMPLEMENTATION (Local Storage)
// This replaces the real Firebase SDK to allow the app to function without API keys.
// It uses localStorage + window events to sync across tabs.

console.warn(" USING MOCK FIREBASE IMPLEMENTATION ");

class MockDatabase {
    private listeners: Map<string, Function[]> = new Map();

    constructor() {
        // Listen for storage events (other tabs changing data)
        window.addEventListener("storage", (e) => {
            if (e.key && e.key.startsWith("firebase_mock:")) {
                const path = e.key.replace("firebase_mock:", "");
                this.triggerListeners(path);
            }
        });
    }

    // Get reference (just returns the path string)
    ref(path: string) {
        return path;
    }

    // Write data
    async set(path: string, data: any) {
        const key = "firebase_mock:" + path;
        localStorage.setItem(key, JSON.stringify(data));
        // Dispatach local event for this tab
        this.triggerListeners(path);
        // Force storage event for other tabs (sometimes needed)
        window.dispatchEvent(new Event("storage"));
        return Promise.resolve();
    }

    // Push data (array-like)
    async push(path: string, data: any) {
        const key = "firebase_mock:" + path;
        const existingStr = localStorage.getItem(key);
        let current = existingStr ? JSON.parse(existingStr) : {};
        
        // If it is an array/object, add new key
        const newId = "id_" + Date.now() + Math.random().toString(36).substr(2, 9);
        current[newId] = data;
        
        localStorage.setItem(key, JSON.stringify(current));
        this.triggerListeners(path);
        return Promise.resolve({ key: newId });
    }

    // Remove data
    async remove(path: string) {
        const key = "firebase_mock:" + path;
        localStorage.removeItem(key);
        this.triggerListeners(path);
        return Promise.resolve();
    }

    // Listen for values
    onValue(path: string, callback: (snapshot: any) => void) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path)?.push(callback);

        // Initial call
        const key = "firebase_mock:" + path;
        const val = localStorage.getItem(key);
        const data = val ? JSON.parse(val) : null;
        
        callback({
            val: () => data,
            exists: () => !!data
        });

        // Return unsubscribe
        return () => {
            const list = this.listeners.get(path) || [];
            this.listeners.set(path, list.filter(cb => cb !== callback));
        };
    }

    private triggerListeners(path: string) {
        const list = this.listeners.get(path);
        if (list) {
            const key = "firebase_mock:" + path;
            const val = localStorage.getItem(key);
            const data = val ? JSON.parse(val) : null;
            const snapshot = {
                val: () => data,
                exists: () => !!data
            };
            list.forEach(cb => cb(snapshot));
        }
    }
}

export const db = new MockDatabase();

// Export standalone functions to match Firebase SDK signature
export const ref = (dbInstance: any, path: string) => dbInstance.ref(path);
export const set = (pathRef: string, data: any) => db.set(pathRef, data);
export const push = (pathRef: string, data: any) => db.push(pathRef, data);
export const remove = (pathRef: string) => db.remove(pathRef);
export const onValue = (pathRef: string, callback: (snapshot: any) => void) => db.onValue(pathRef, callback);
