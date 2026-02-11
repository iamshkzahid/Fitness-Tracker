
class AsyncStorageWrapper {
    constructor() {
        // Keys that must be encrypted if a session key is available
        this.encryptedKeys = [
            'profileData',
            'workouts',
            'bmiHistory',
            'plannerData',
            'exerciseData',
            'currentUser'
        ];
    }

    /**
     * Retrieve data from localStorage.
     * Auto-detects encryption (iv/cipher format).
     */
    async get(key, fallback = null) {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            return fallback;
        }

        // Check if the data has the signature of our encryption
        if (parsed && typeof parsed === 'object' && parsed.iv && parsed.cipher) {
            // Attempt decryption
            try {
                // Ensure session key is loaded
                const sessionKey = await window.Security.loadSessionKey();

                if (!sessionKey) {
                    console.warn(`[AsyncStorage] Found encrypted data for "${key}" but no session key is active.`);
                    return fallback;
                }

                const decrypted = await window.Security.decrypt(parsed, sessionKey);
                // If decryption returns null (failure), return fallback
                return decrypted !== null ? decrypted : fallback;

            } catch (e) {
                console.error(`[AsyncStorage] Decryption error for "${key}":`, e);
                return fallback;
            }
        }

        // Return plain data (legacy or non-sensitive)
        return parsed;
    }

    /**
     * Save data to localStorage.
     * Auto-encrypts if key is in the sensitive list and session key is active.
     */
    async set(key, value) {
        if (this.encryptedKeys.includes(key)) {
            const sessionKey = await window.Security.loadSessionKey();
            if (sessionKey) {
                try {
                    const encrypted = await window.Security.encrypt(value, sessionKey);
                    localStorage.setItem(key, JSON.stringify(encrypted));
                    return;
                } catch (e) {
                    console.error(`[AsyncStorage] Encryption failed for "${key}". Saving as plain text (fallback).`, e);
                }
            } else {
                console.warn(`[AsyncStorage] Saving sensitive key "${key}" as plain text because no session key is active.`);
            }
        }

        localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Helper to push to an array in storage
     */
    async push(key, item) {
        const current = await this.get(key);
        const arr = Array.isArray(current) ? current : [];
        arr.push(item);
        await this.set(key, arr);
    }

    /**
     * Remove item
     */
    async remove(key) {
        localStorage.removeItem(key);
    }
}

window.AsyncStorage = new AsyncStorageWrapper();
