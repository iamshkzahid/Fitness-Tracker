/**
 * Escapes HTML special characters in a string.
 * @param {string} unsafe The string to escape.
 * @returns {string} The escaped string.
 */
function escapeHtml(unsafe) {
     if (unsafe === null || unsafe === undefined) return '';
     return String(unsafe)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
}

// Export for Node.js environments (like Jest)
if (typeof module !== 'undefined' && module.exports) {
     module.exports = { escapeHtml };
}
