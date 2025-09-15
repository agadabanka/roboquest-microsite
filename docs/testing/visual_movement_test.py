#!/usr/bin/env python3

"""
Visual Movement Verification Test
Focus on actual visual movement across grid squares, not just coordinates
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import time

def visual_movement_verification():
    """Test focusing on visual movement across grid squares"""
    print("👁️ Visual Movement Verification Test")
    print("=" * 40)
    print("🎯 Focus: Visual movement across grid squares")
    print("📸 Method: Before/after screenshot comparison")
    
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_window_size(1280, 720)
        
        print("🌐 Loading game with debug grid...")
        driver.get('http://localhost:8000/game/index.html')
        time.sleep(5)  # Full initialization
        
        # Take BEFORE screenshot
        driver.save_screenshot('BEFORE_movement.png')
        print("📸 BEFORE screenshot taken")
        
        # Test 1: Click Debug Forces button for immediate effect
        print("\n🔧 TEST 1: Debug Forces button...")
        try:
            debug_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Debug Forces')]")
            debug_button.click()
            time.sleep(2)
            
            driver.save_screenshot('AFTER_debug_forces.png')
            print("📸 AFTER Debug Forces screenshot")
            
        except Exception as e:
            print(f"❌ Debug Forces button failed: {e}")
        
        # Test 2: Click Test Movement button for position jump
        print("\n🧪 TEST 2: Test Movement button...")
        try:
            test_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Test Movement')]")
            test_button.click()
            time.sleep(2)
            
            driver.save_screenshot('AFTER_test_movement.png')
            print("📸 AFTER Test Movement screenshot")
            
        except Exception as e:
            print(f"❌ Test Movement button failed: {e}")
        
        # Test 3: Extremely sustained D key test (10 seconds)
        print("\n➡️ TEST 3: 10-second sustained D key...")
        
        # Focus on canvas
        canvas = driver.find_element(By.ID, 'gameCanvas')
        canvas.click()
        
        driver.save_screenshot('BEFORE_sustained_D.png')
        print("📸 BEFORE sustained D screenshot")
        
        # Hold D key for 10 seconds with ActionChains
        actions = ActionChains(driver)
        actions.key_down('d').perform()
        
        print("   ⏱️ Holding D key for 10 seconds...")
        for i in range(10):
            time.sleep(1)
            print(f"   {i+1}/10 seconds...")
        
        actions.key_up('d').perform()
        
        driver.save_screenshot('AFTER_sustained_D.png')
        print("📸 AFTER sustained D screenshot")
        
        # Test 4: Extreme force test via console
        print("\n🚀 TEST 4: Extreme force application...")
        driver.execute_script("""
            if (window.gameLogic && window.gameLogic.player && window.gameLogic.player.physicsBody) {
                console.log('🚀 EXTREME FORCE TEST: Applying massive horizontal force');
                window.gameLogic.player.physicsBody.force.x += 1000;
                window.gameLogic.player.physicsBody.force.z += 1000;
                console.log('Applied 1000 unit force in X and Z directions');
            }
        """)
        
        time.sleep(3)
        driver.save_screenshot('AFTER_extreme_force.png')
        print("📸 AFTER extreme force screenshot")
        
        # Analyze all console messages
        print("\n📋 DETAILED CONSOLE ANALYSIS:")
        logs = driver.get_log('browser')
        
        force_logs = [log['message'] for log in logs if 'force' in log['message'].lower()]
        debug_logs = [log['message'] for log in logs if 'debug' in log['message'].lower()]
        step_logs = [log['message'] for log in logs if 'step' in log['message'].lower()]
        
        print(f"🚀 Force-related logs: {len(force_logs)}")
        print(f"🔧 Debug logs: {len(debug_logs)}")
        print(f"📋 Step logs: {len(step_logs)}")
        
        # Show most relevant logs
        for log in force_logs[-3:]:
            print(f"🚀 {log}")
        
        print(f"\n📊 VISUAL VERIFICATION SUMMARY:")
        print(f"📸 Screenshots taken:")
        print(f"   - BEFORE_movement.png (initial state)")
        print(f"   - AFTER_debug_forces.png (after debug button)")
        print(f"   - AFTER_test_movement.png (after test button)")
        print(f"   - BEFORE_sustained_D.png (before 10s D key)")
        print(f"   - AFTER_sustained_D.png (after 10s D key)")
        print(f"   - AFTER_extreme_force.png (after extreme force)")
        
        print(f"\n🎯 COMPARE THESE SCREENSHOTS:")
        print(f"   1. BEFORE vs AFTER sustained D - Should show grid movement")
        print(f"   2. BEFORE vs AFTER extreme force - Should show major position change")
        print(f"   3. Look for character moving between grid squares")
        
        return True
        
    except Exception as e:
        print(f"❌ Visual verification test failed: {e}")
        return False
    finally:
        print(f"\n📋 Extended browser open time for manual WASD testing...")
        print(f"🎮 Try WASD keys manually and observe grid movement...")
        time.sleep(15)  # Extra time for manual testing
        try:
            driver.quit()
            print("🧹 Browser closed")
        except:
            pass

if __name__ == "__main__":
    print("👁️ VISUAL MOVEMENT VERIFICATION")
    print("🎯 Testing actual visual movement across debug grid")
    print("📸 Multiple before/after screenshot comparisons")
    print("⏱️ Extended manual testing time")
    print("")
    
    visual_movement_verification()
    
    print("\n🔍 NEXT STEPS:")
    print("1. Compare before/after screenshots")
    print("2. Look for character moving between grid squares")
    print("3. If no visual movement, investigate physics/rendering sync")
    print("4. Focus on making character visibly cross grid lines")