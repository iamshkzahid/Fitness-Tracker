(function(exports) {

    function safeParse(s, fallback) {
        try {
            return JSON.parse(s);
        } catch (e) {
            return fallback;
        }
    }

    const storage = {
        get(key, fallback) {
             const raw = localStorage.getItem(key);
             if (!raw) return fallback;
             return safeParse(raw, fallback);
        },
        set(key, val) {
             localStorage.setItem(key, JSON.stringify(val));
        },
        push(key, item) {
             const arr = storage.get(key, []);
             arr.push(item);
             storage.set(key, arr);
        }
    };

    exports.storage = storage;
    exports.safeParse = safeParse;

})(typeof module !== 'undefined' && module.exports ? module.exports : (typeof window !== 'undefined' ? window : this));
