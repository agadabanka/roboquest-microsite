#!/usr/bin/env python3

"""
Test simple movement controls separately
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

def test_simple_movement():
    """Test basic movement controls in isolation"""
    print("🧪 Testing Simple Movement Controls")
    print("=" * 35)
    
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_window_size(1000, 700)
        
        # Load simple test
        driver.get('http://localhost:8000/game/test-movement.html')
        time.sleep(2)
        
        print("🎮 Testing basic WASD movement...")
        
        # Get initial position
        initial_pos = driver.execute_script("return {x: player.position.x, y: player.position.y, z: player.position.z};")
        print(f"📍 Initial position: {initial_pos}")
        
        # Test D key (move right)
        body = driver.find_element(By.TAG_NAME, 'body')
        body.send_keys('d')
        time.sleep(0.5)
        
        # Check logs for key events
        logs = driver.get_log('browser')
        key_events = [log['message'] for log in logs if 'Key' in log['message'] or 'moved' in log['message']]
        
        for event in key_events[-5:]:  # Show last 5 events
            print(f"🎮 {event}")
        
        # Get new position
        new_pos = driver.execute_script("return {x: player.position.x, y: player.position.y, z: player.position.z};")
        print(f"📍 After 'D' key: {new_pos}")
        
        # Check if movement occurred
        moved = abs(new_pos['x'] - initial_pos['x']) > 0.01
        print(f"🏃 Movement result: {'✅ SUCCESS' if moved else '❌ FAILED'}")
        
        if moved:
            print("✅ Basic movement controls working!")
        else:
            print("❌ Movement controls not working - debugging needed")
        
        # Take screenshot
        driver.save_screenshot('movement-test-screenshot.png')
        print("📸 Screenshot saved: movement-test-screenshot.png")
        
        return moved
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        try:
            driver.quit()
        except:
            pass

if __name__ == "__main__":
    success = test_simple_movement()
    print(f"\n🎯 Movement test: {'PASSED' if success else 'FAILED'}")
    
    if not success:
        print("🔧 Need to fix basic input handling before adding physics")