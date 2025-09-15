#!/usr/bin/env python3

"""
Quick Velocity Test - Focus on Visual Movement
Test direct velocity control vs forces
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
import time

def quick_velocity_test():
    """Quick test focusing on visual movement"""
    print("⚡ Quick Velocity Movement Test")
    print("🎯 Testing direct velocity vs forces")
    
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
        
        # Screenshot 1: Initial
        driver.save_screenshot('velocity_test_1_initial.png')
        print("📸 1. Initial position")
        
        # Test: Hold D key for 5 seconds
        canvas = driver.find_element(By.ID, 'gameCanvas')
        canvas.click()
        
        actions = ActionChains(driver)
        actions.key_down('d').perform()
        
        print("➡️ Holding D key for 5 seconds...")
        time.sleep(5)
        
        actions.key_up('d').perform()
        
        # Screenshot 2: After D key
        driver.save_screenshot('velocity_test_2_after_D.png')
        print("📸 2. After 5s D key")
        
        # Check console for sync debugging
        logs = driver.get_log('browser')
        sync_logs = [log['message'] for log in logs if 'syncing' in log['message'].lower() or 'mismatch' in log['message'].lower()]
        
        print(f"🔄 Sync-related logs: {len(sync_logs)}")
        for log in sync_logs[-3:]:
            print(f"🔧 {log}")
        
        print("\n🎯 VISUAL ANALYSIS NEEDED:")
        print("📸 Compare: velocity_test_1_initial.png vs velocity_test_2_after_D.png")
        print("👀 Look for character moving to different grid square")
        print("❓ If no movement: Physics/mesh sync broken")
        
        return True
        
    except Exception as e:
        print(f"❌ Quick test failed: {e}")
        return False
    finally:
        print("\n⏱️ 10 seconds for manual testing...")
        time.sleep(10)
        try:
            driver.quit()
        except:
            pass

if __name__ == "__main__":
    quick_velocity_test()