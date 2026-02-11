const FitnessUtils = require('../utils.js');

describe('FitnessUtils', () => {
    let mockTbody;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();

        // Create a fresh tbody
        mockTbody = document.createElement('tbody');
    });

    describe('renderRecentActivity', () => {
        test('renders "No workouts" message when no workouts exist', () => {
            FitnessUtils.renderRecentActivity(mockTbody);
            expect(mockTbody.innerHTML).toContain('No workouts logged yet');
        });

        test('renders rows when workouts exist', () => {
            const workouts = [
                { name: 'Morning Run', duration: 30, calories: 300, ts: Date.now() },
                { name: 'Evening Walk', duration: 45, calories: 200, ts: Date.now() - 10000 }
            ];
            localStorage.setItem('workouts', JSON.stringify(workouts));

            FitnessUtils.renderRecentActivity(mockTbody);

            const rows = mockTbody.querySelectorAll('tr');
            expect(rows.length).toBe(2);
            expect(mockTbody.innerHTML).toContain('Morning Run');
            expect(mockTbody.innerHTML).toContain('Evening Walk');
        });

        test('handles malformed data (non-array) gracefully', () => {
            // Should not throw, should render "No workouts" message
            localStorage.setItem('workouts', JSON.stringify({ some: "object" }));

            expect(() => {
                FitnessUtils.renderRecentActivity(mockTbody);
            }).not.toThrow();

            expect(mockTbody.innerHTML).toContain('No workouts logged yet');
        });
    });
});
