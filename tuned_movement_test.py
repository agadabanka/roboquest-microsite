#!/usr/bin/env python3

"""
Tuned Movement Test - Industry Standard Values + Mouse Controls
Test 20 units/second movement and mouse camera orbit
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
import time

def test_tuned_movement():
    """Test properly tuned movement values with mouse controls"""
    print("🎮 Tuned Movement Test - Industry Standard Values")
    print("=" * 50)
    print("🎯 Testing 20 units/second movement + mouse camera")
    
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_window_size(1280, 720)
        
        print("🌐 Loading game...")
        driver.get('http://localhost:8000/game/index.html')
        time.sleep(4)
        
        # Test Plan: Moderate movement across grid
        test_plan = [
            ("Initial State", None, 0),
            ("Move Right (D) - 2 seconds", "d", 2),
            ("Move Forward (W) - 2 seconds", "w", 2), 
            ("Move Left (A) - 2 seconds", "a", 2),
            ("Move Back (S) - 2 seconds", "s", 2),
            ("Jump Test", "space", 1),
            ("Mouse Camera Test", "mouse", 3)
        ]
        
        canvas = driver.find_element(By.ID, 'gameCanvas')
        canvas.click()  # Focus for input
        
        for i, (description, key, duration) in enumerate(test_plan):
            print(f"\n🎯 Test {i+1}: {description}")
            
            # Take screenshot before action
            driver.save_screenshot(f'tuned_test_{i+1}_before_{key or "initial"}.png')
            
            if key == "mouse":
                # Test mouse camera control
                print("   🖱️ Testing mouse camera orbit...")
                actions = ActionChains(driver)
                
                # Simulate mouse movement with click
                actions.click_and_hold(canvas).perform()
                time.sleep(0.5)
                
                # Move mouse in circle pattern
                for angle in range(0, 360, 30):
                    x_offset = int(50 * (angle / 360.0))
                    y_offset = int(30 * (angle / 360.0))
                    actions.move_by_offset(x_offset - (50 if angle > 0 else 0), y_offset - (30 if angle > 0 else 0))
                    time.sleep(0.1)
                
                actions.release().perform()
                
            elif key and key != "space":
                # Standard movement keys
                actions = ActionChains(driver)
                actions.key_down(key).perform()
                
                print(f"   ⏱️ Holding {key.upper()} for {duration} seconds...")
                time.sleep(duration)
                
                actions.key_up(key).perform()
                
            elif key == "space":
                # Jump test
                actions = ActionChains(driver)
                actions.key_down(' ').perform()
                time.sleep(0.2)
                actions.key_up(' ').perform()
                time.sleep(duration)
            
            # Take screenshot after action
            driver.save_screenshot(f'tuned_test_{i+1}_after_{key or "initial"}.png')
            print(f"   📸 Before/After screenshots saved")
            
            # Get position for analysis
            if i > 0:  # Skip initial state
                pos = driver.execute_script("""
                    return window.gameLogic?.player?.mesh?.position ? {
                        x: Math.round(window.gameLogic.player.mesh.position.x * 10) / 10,
                        y: Math.round(window.gameLogic.player.mesh.position.y * 10) / 10,
                        z: Math.round(window.gameLogic.player.mesh.position.z * 10) / 10
                    } : null;
                """)
                if pos:
                    print(f"   📍 Position: x={pos['x']}, y={pos['y']}, z={pos['z']}")
        
        # Final analysis
        print(f"\n📊 TUNED MOVEMENT TEST COMPLETE!")
        print(f"📸 Screenshots saved: tuned_test_1_before_initial.png through tuned_test_7_after_mouse.png")
        print(f"🎯 Visual Analysis:")
        print(f"   - Check if movement is more reasonable (less aggressive)")
        print(f"   - Verify character moves 1-2 grid squares per 2-second input")
        print(f"   - Confirm mouse camera orbit working")
        print(f"   - Ensure jump height remains good")
        
        # Check console for mouse control logs
        logs = driver.get_log('browser')
        mouse_logs = [log['message'] for log in logs if 'mouse' in log['message'].lower()]
        
        print(f"\n🖱️ Mouse control logs: {len(mouse_logs)}")
        for log in mouse_logs[-3:]:
            print(f"🖱️ {log}")
        
        return True
        
    except Exception as e:
        print(f"❌ Tuned movement test failed: {e}")
        return False
    finally:
        print(f"\n⏱️ Extended time for manual WASD + mouse testing...")
        time.sleep(15)  # Extra time for manual verification
        try:
            driver.quit()
            print("🧹 Browser closed")
        except:
            pass

if __name__ == "__main__":
    test_tuned_movement()