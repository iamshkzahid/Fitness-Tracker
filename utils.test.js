/**
 * @jest-environment jsdom
 */

const { storage, safeParse } = require('./utils.js');

describe('Storage Helpers', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('safeParse', () => {
        test('should parse valid JSON', () => {
            expect(safeParse('{"a":1}', {})).toEqual({a: 1});
        });

        test('should return fallback on invalid JSON', () => {
            expect(safeParse('invalid', 'fallback')).toBe('fallback');
        });
    });

    describe('storage.get', () => {
        test('should return fallback if key does not exist', () => {
            const result = storage.get('nonexistent', 'default');
            expect(result).toBe('default');
        });

        test('should return parsed value if key exists', () => {
            localStorage.setItem('testKey', JSON.stringify({ a: 1 }));
            const result = storage.get('testKey', {});
            expect(result).toEqual({ a: 1 });
        });

        test('should return fallback if parsing fails', () => {
            localStorage.setItem('badKey', 'invalid-json');
            const result = storage.get('badKey', 'fallback');
            expect(result).toBe('fallback');
        });
    });

    describe('storage.set', () => {
        test('should save stringified value to localStorage', () => {
            storage.set('key', { foo: 'bar' });
            expect(localStorage.getItem('key')).toBe(JSON.stringify({ foo: 'bar' }));
        });
    });

    describe('storage.push', () => {
        test('should initialize array if key does not exist', () => {
            storage.push('list', 'item1');
            const stored = JSON.parse(localStorage.getItem('list'));
            expect(stored).toEqual(['item1']);
        });

        test('should append to existing array', () => {
            localStorage.setItem('list', JSON.stringify(['item1']));
            storage.push('list', 'item2');
            const stored = JSON.parse(localStorage.getItem('list'));
            expect(stored).toEqual(['item1', 'item2']);
        });
    });
});
