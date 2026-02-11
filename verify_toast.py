import time
from playwright.sync_api import sync_playwright

def verify_toast():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Dashboard
        try:
            page.goto("http://localhost:8000/Dashboard.html")

            # 1. Trigger Error Toast (Empty Name)
            print("Clicking Add Workout (expecting error)...")
            page.click("#addWorkoutBtn")

            # Wait for toast to appear
            print("Waiting for .toast-error...")
            page.wait_for_selector(".toast-error", timeout=5000)
            time.sleep(1) # Wait for animation

            # Screenshot Error
            page.screenshot(path="screenshots/toast_error.png")
            print("Error toast screenshot taken: screenshots/toast_error.png")

            # Reload to clear
            page.reload()

            # 2. Trigger Success Toast
            print("Filling form...")
            page.fill("#workoutName", "Test Workout")
            page.fill("#workoutDuration", "30")
            page.fill("#workoutCalories", "300")

            print("Clicking Add Workout (expecting success)...")
            page.click("#addWorkoutBtn")

            # Wait for toast
            print("Waiting for .toast-success...")
            page.wait_for_selector(".toast-success", timeout=5000)
            time.sleep(1)

            # Screenshot Success
            page.screenshot(path="screenshots/toast_success.png")
            print("Success toast screenshot taken: screenshots/toast_success.png")

        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="screenshots/error_state.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_toast()
