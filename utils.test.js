const { escapeHtml } = require('./utils');

describe('escapeHtml', () => {
    test('should escape HTML special characters', () => {
        expect(escapeHtml('&')).toBe('&amp;');
        expect(escapeHtml('<')).toBe('&lt;');
        expect(escapeHtml('>')).toBe('&gt;');
        expect(escapeHtml('"')).toBe('&quot;');
        expect(escapeHtml("'")).toBe('&#039;');
    });

    test('should return empty string for null or undefined', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
    });

    test('should return empty string for empty string input', () => {
        expect(escapeHtml('')).toBe('');
    });

    test('should handle normal strings without special characters', () => {
        expect(escapeHtml('Hello World')).toBe('Hello World');
        expect(escapeHtml('12345')).toBe('12345');
    });

    test('should convert non-string inputs to string and escape them', () => {
        expect(escapeHtml(123)).toBe('123');
        expect(escapeHtml(true)).toBe('true');
    });

    test('should escape mixed content correctly', () => {
        const input = '<b>"Me & You"</b>';
        const expected = '&lt;b&gt;&quot;Me &amp; You&quot;&lt;/b&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

    test('should escape multiple occurrences of the same character', () => {
        expect(escapeHtml('&&')).toBe('&amp;&amp;');
        expect(escapeHtml('<<')).toBe('&lt;&lt;');
    });
});
