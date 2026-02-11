
class SecurityManager {
    constructor() {
        this.sessionKey = null;
        this.ALGO_NAME = 'AES-GCM';
        this.HASH_ALGO = 'SHA-256';
        this.PBKDF2_ITERATIONS = 100000;
        this.SALT_LEN = 16;
        this.IV_LEN = 12;
    }

    // --- Helpers ---

    // Convert ArrayBuffer to Hex String
    bufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Convert Hex String to Uint8Array
    hexToBuffer(hex) {
        const tokens = hex.match(/.{1,2}/g);
        if (!tokens) return new Uint8Array();
        return new Uint8Array(tokens.map(byte => parseInt(byte, 16)));
    }

    generateSalt() {
        return this.bufferToHex(window.crypto.getRandomValues(new Uint8Array(this.SALT_LEN)));
    }

    // --- Core Crypto ---

    async hashPassword(password, saltHex) {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );

        const salt = this.hexToBuffer(saltHex);

        // We derive a key for hashing (verification)
        const key = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: this.PBKDF2_ITERATIONS,
                hash: this.HASH_ALGO
            },
            keyMaterial,
            { name: "HMAC", hash: this.HASH_ALGO, length: 256 },
            true,
            ["sign"]
        );

        // Export the key as raw bytes to store as the "hash"
        const exported = await window.crypto.subtle.exportKey("raw", key);
        return this.bufferToHex(exported);
    }

    async deriveKey(password, saltHex) {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );

        const salt = this.hexToBuffer(saltHex);

        // Derive the AES-GCM key for encryption
        return await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: this.PBKDF2_ITERATIONS,
                hash: this.HASH_ALGO
            },
            keyMaterial,
            { name: this.ALGO_NAME, length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    async exportKey(key) {
        return await window.crypto.subtle.exportKey("jwk", key);
    }

    async importKey(jwk) {
        return await window.crypto.subtle.importKey(
            "jwk",
            jwk,
            { name: this.ALGO_NAME },
            true,
            ["encrypt", "decrypt"]
        );
    }

    async encrypt(data, key) {
        if (!key) throw new Error("No encryption key provided");
        const enc = new TextEncoder();
        const encoded = enc.encode(JSON.stringify(data));
        const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LEN));

        const cipher = await window.crypto.subtle.encrypt(
            { name: this.ALGO_NAME, iv: iv },
            key,
            encoded
        );

        return {
            iv: this.bufferToHex(iv),
            cipher: this.bufferToHex(cipher)
        };
    }

    async decrypt(encryptedObj, key) {
        if (!key) throw new Error("No decryption key provided");
        if (!encryptedObj.iv || !encryptedObj.cipher) throw new Error("Invalid encrypted object");

        const iv = this.hexToBuffer(encryptedObj.iv);
        const cipher = this.hexToBuffer(encryptedObj.cipher);

        try {
            const decrypted = await window.crypto.subtle.decrypt(
                { name: this.ALGO_NAME, iv: iv },
                key,
                cipher
            );
            const dec = new TextDecoder();
            return JSON.parse(dec.decode(decrypted));
        } catch (e) {
            console.error("Decryption failed:", e);
            return null;
        }
    }

    // --- Session Management ---

    async setSessionKey(key) {
        this.sessionKey = key;
        const jwk = await this.exportKey(key);
        sessionStorage.setItem('session_key', JSON.stringify(jwk));
    }

    async loadSessionKey() {
        if (this.sessionKey) return this.sessionKey;
        const raw = sessionStorage.getItem('session_key');
        if (!raw) return null;
        try {
            const jwk = JSON.parse(raw);
            this.sessionKey = await this.importKey(jwk);
            return this.sessionKey;
        } catch (e) {
            console.error("Failed to load session key", e);
            return null;
        }
    }

    clearSession() {
        this.sessionKey = null;
        sessionStorage.removeItem('session_key');
    }
}

// Global Instance
window.Security = new SecurityManager();
