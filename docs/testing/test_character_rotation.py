#!/usr/bin/env python3

"""
Character Rotation Test

Goal: Verify that moving the mouse (without clicking) rotates the character in place
so the mesh faces the aim direction. Captures before/after screenshots and reports yaw delta.

Usage:
  python test_character_rotation.py            # default controller (Egloff)
  python test_character_rotation.py legacy     # legacy controller
"""

import time
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains


def game_ready(driver):
    return driver.execute_script(
        "return !!(window.gameLogic && window.gameLogic.player && window.gameLogic.player.mesh);"
    )


def get_player_yaw(driver):
    return driver.execute_script(
        "return window.gameLogic ? window.gameLogic.player.mesh.rotation.y : null;"
    )


def run():
    controller = sys.argv[1] if len(sys.argv) > 1 else None
    qp = f"?controller={controller}" if controller else ""

    # Set up Chrome with console logging
    opts = Options()
    opts.add_argument('--no-sandbox')
    opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    driver = webdriver.Chrome(options=opts)
    driver.set_window_size(1280, 720)

    try:
        driver.get('http://localhost:8000/game/index.html' + qp)

        # Wait for game to initialize
        for _ in range(50):
            if game_ready(driver):
                break
            time.sleep(0.1)

        assert game_ready(driver), "Game did not initialize"

        canvas = driver.find_element(By.ID, 'gameCanvas')
        actions = ActionChains(driver)

        # Move mouse into canvas to establish origin
        actions.move_to_element_with_offset(canvas, 50, 50).perform()
        time.sleep(0.2)

        # Capture initial yaw and screenshot
        yaw_before = get_player_yaw(driver)
        driver.save_screenshot('character_rotation_before.png')

        # Free-yaw rotation: small horizontal moves without clicking
        for _ in range(5):
            actions.move_by_offset(40, 0).perform()
            time.sleep(0.05)

        time.sleep(0.2)

        yaw_mid = get_player_yaw(driver)

        # Reverse direction to ensure bidirectional response
        for _ in range(5):
            actions.move_by_offset(-40, 0).perform()
            time.sleep(0.05)

        time.sleep(0.2)

        yaw_after = get_player_yaw(driver)
        driver.save_screenshot('character_rotation_after.png')

        # Compute deltas
        import math
        def ang_diff(a, b):
            d = (b - a + math.pi) % (2*math.pi) - math.pi
            return abs(d)

        delta1 = ang_diff(yaw_before, yaw_mid)
        delta2 = ang_diff(yaw_mid, yaw_after)
        delta_total = ang_diff(yaw_before, yaw_after)

        # Report
        print(f"Yaw before: {yaw_before}")
        print(f"Yaw mid:    {yaw_mid}")
        print(f"Yaw after:  {yaw_after}")
        print(f"Δ1 (before→mid):  {delta1:.4f} rad")
        print(f"Δ2 (mid→after):   {delta2:.4f} rad")
        print(f"ΔT (before→after): {delta_total:.4f} rad")

        # Simple expectation: each segment should show a non-trivial yaw change
        passed = (delta1 > 0.02) and (delta2 > 0.02)
        print(f"Rotation test {'PASSED' if passed else 'FAILED'}")

        # Dump last few console errors (if any)
        logs = driver.get_log('browser')
        errs = [L for L in logs if L['level'] in ('SEVERE','ERROR')]
        print(f"Console errors: {len(errs)}")
        for L in errs[-5:]:
            print('ERR:', L['message'])

        return passed
    finally:
        try:
            driver.quit()
        except Exception:
            pass


if __name__ == '__main__':
    run()

