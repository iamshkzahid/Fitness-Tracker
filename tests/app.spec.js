// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Fitness Tracker App', () => {

  test('Dashboard loads correctly', async ({ page }) => {
    await page.goto('/Dashboard.html');
    await expect(page).toHaveTitle(/FitTrack - Dashboard/);
    await expect(page.locator('#dashboard-username')).toBeVisible();
  });

  test('Add Workout functionality on Dashboard', async ({ page }) => {
    await page.goto('/Dashboard.html');

    // Fill out the workout form
    await page.fill('#workoutName', 'Playwright Test Workout');
    await page.fill('#workoutDuration', '30');
    await page.fill('#workoutCalories', '200');

    // Handle alert
    page.on('dialog', async dialog => {
      // console.log(`Dialog message: ${dialog.message()}`);
      await dialog.dismiss();
    });

    // Click Add Workout
    await page.click('#addWorkoutBtn');

    // Verify it appears in the table
    const table = page.locator('.activity-table');
    await expect(table).toContainText('Playwright Test Workout');
    await expect(table).toContainText('30 min');
    await expect(table).toContainText('200 kcal');
  });

  test('BMI Calculator functionality on Dashboard', async ({ page }) => {
    await page.goto('/Dashboard.html');

    // Fill out BMI form (Height in cm, Weight in kg)
    // The inputs might have default values, clear them or just type
    await page.fill('#height', '180');
    await page.fill('#weight', '80');

    // Handle alert
    page.on('dialog', async dialog => {
      await dialog.dismiss();
    });

    // Click Calculate
    await page.click('#calcBMI');

    // Verify result
    // 80 / (1.8 * 1.8) = 24.69... -> 24.7
    await expect(page.locator('#bmiResult')).toHaveText('24.7');
    await expect(page.locator('#bmiCategory')).toHaveText('Normal');
  });

  test('BMI Page specific functionality', async ({ page }) => {
    await page.goto('/BMI.html');

    await page.fill('#bmi-height', '160');
    await page.fill('#bmi-weight', '50'); // BMI = 50 / (1.6*1.6) = 19.53... -> 19.5

    await page.click('#bmi-calc-trigger');

    await expect(page.locator('#bmi-score-text')).toHaveText('19.5');
    await expect(page.locator('#bmi-category-label')).toHaveText('Normal Weight');
  });

  test('Navigation links work', async ({ page }) => {
    await page.goto('/Dashboard.html');

    // Click on BMI Calculator link in sidebar
    await page.click('#nav-bmi');
    await expect(page).toHaveURL(/BMI.html/);

    // Go back
    await page.goto('/Dashboard.html');

    // Click on Workout Planner link
    await page.click('#nav-planner');
    await expect(page).toHaveURL(/Workout_Planner.html/);
  });

  test('Data persistence (LocalStorage)', async ({ page }) => {
    await page.goto('/Dashboard.html');

    // Add a workout
    await page.fill('#workoutName', 'Persistent Workout');
    await page.fill('#workoutDuration', '45');
    await page.fill('#workoutCalories', '300');

    page.on('dialog', dialog => dialog.dismiss());
    await page.click('#addWorkoutBtn');

    // Reload page
    await page.reload();

    // Verify workout is still there
    const table = page.locator('.activity-table');
    await expect(table).toContainText('Persistent Workout');
  });

});
