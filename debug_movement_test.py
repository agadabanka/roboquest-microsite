#!/usr/bin/env python3

"""
Debug Movement Issue with Button Testing
Comprehensive analysis of why WASD movement isn't working
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import time

def debug_movement_thoroughly():
    """Thorough debugging of movement issues with button testing"""
    print("🔧 Debug RoboQuest Movement Issues")
    print("=" * 40)
    
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_window_size(1280, 720)
        
        print("🌐 Loading game...")
        driver.get('http://localhost:8000/game/index.html')
        time.sleep(4)  # Wait for full initialization
        
        # Initial screenshot with debug grid
        driver.save_screenshot('debug_initial_with_grid.png')
        print("📸 Initial screenshot with debug grid")
        
        # Check initial state
        initial_state = driver.execute_script("""
            return {
                playerPos: window.gameLogic?.player?.mesh?.position ? {
                    x: window.gameLogic.player.mesh.position.x,
                    y: window.gameLogic.player.mesh.position.y,
                    z: window.gameLogic.player.mesh.position.z
                } : null,
                physicsPos: window.gameLogic?.player?.physicsBody?.position ? {
                    x: window.gameLogic.player.physicsBody.position.x,
                    y: window.gameLogic.player.physicsBody.position.y,
                    z: window.gameLogic.player.physicsBody.position.z
                } : null,
                velocity: window.gameLogic?.player?.physicsBody?.velocity ? {
                    x: window.gameLogic.player.physicsBody.velocity.x,
                    y: window.gameLogic.player.physicsBody.velocity.y,
                    z: window.gameLogic.player.physicsBody.velocity.z
                } : null
            };
        """)
        
        print(f"📍 Initial mesh position: {initial_state['playerPos']}")
        print(f"🔧 Initial physics position: {initial_state['physicsPos']}")
        print(f"🏎️ Initial velocity: {initial_state['velocity']}")
        
        # Test 1: Click Debug Forces button
        print("\n🔧 TEST 1: Clicking Debug Forces button...")
        try:
            debug_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Debug Forces')]")
            debug_button.click()
            time.sleep(2)
            print("✅ Debug Forces button clicked successfully")
        except Exception as e:
            print(f"❌ Debug button click failed: {e}")
        
        # Test 2: Click Test Movement button  
        print("\n🧪 TEST 2: Clicking Test Movement button...")
        try:
            test_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Test Movement')]")
            test_button.click()
            time.sleep(2)
            print("✅ Test Movement button clicked successfully")
        except Exception as e:
            print(f"❌ Test Movement button click failed: {e}")
        
        # Test 3: Sustained WASD testing (hold keys longer)
        print("\n🎮 TEST 3: Sustained WASD testing...")
        
        canvas = driver.find_element(By.ID, 'gameCanvas')
        canvas.click()  # Focus on canvas
        
        # Test sustained D key (right movement)
        print("   ➡️ Testing sustained D key for 5 seconds...")
        actions = ActionChains(driver)
        actions.key_down('d').perform()
        
        # Monitor position every second
        for i in range(5):
            time.sleep(1)
            current_pos = driver.execute_script("""
                return {
                    mesh: window.gameLogic?.player?.mesh?.position ? {
                        x: Math.round(window.gameLogic.player.mesh.position.x * 100) / 100,
                        z: Math.round(window.gameLogic.player.mesh.position.z * 100) / 100
                    } : null,
                    physics: window.gameLogic?.player?.physicsBody?.position ? {
                        x: Math.round(window.gameLogic.player.physicsBody.position.x * 100) / 100,
                        z: Math.round(window.gameLogic.player.physicsBody.position.z * 100) / 100
                    } : null,
                    velocity: window.gameLogic?.player?.physicsBody?.velocity ? {
                        x: Math.round(window.gameLogic.player.physicsBody.velocity.x * 100) / 100,
                        z: Math.round(window.gameLogic.player.physicsBody.velocity.z * 100) / 100
                    } : null
                };
            """)
            print(f"   {i+1}s: Mesh({current_pos['mesh']['x']},{current_pos['mesh']['z']}) Physics({current_pos['physics']['x']},{current_pos['physics']['z']}) Vel({current_pos['velocity']['x']},{current_pos['velocity']['z']})")
        
        actions.key_up('d').perform()
        print("   Released D key")
        
        # Final screenshot
        driver.save_screenshot('debug_after_sustained_movement.png')
        print("📸 Screenshot after sustained movement")
        
        # Check console for detailed force/movement logs
        print("\n📋 CONSOLE ANALYSIS:")
        logs = driver.get_log('browser')
        
        movement_logs = [log['message'] for log in logs if any(keyword in log['message'].lower() 
                        for keyword in ['movement debug', 'applying physics force', 'step', 'debug forces'])]
        
        print(f"📊 Movement-related console messages: {len(movement_logs)}")
        for log in movement_logs[-10:]:  # Last 10 movement logs
            print(f"🎮 {log}")
        
        # Final position analysis
        final_state = driver.execute_script("""
            return {
                playerPos: window.gameLogic?.player?.mesh?.position ? {
                    x: window.gameLogic.player.mesh.position.x,
                    y: window.gameLogic.player.mesh.position.y,
                    z: window.gameLogic.player.mesh.position.z
                } : null
            };
        """)
        
        if initial_state['playerPos'] and final_state['playerPos']:
            total_movement = ((final_state['playerPos']['x'] - initial_state['playerPos']['x'])**2 + 
                            (final_state['playerPos']['z'] - initial_state['playerPos']['z'])**2)**0.5
            
            print(f"\n📊 FINAL ANALYSIS:")
            print(f"📍 Total movement distance: {total_movement:.2f} units")
            print(f"🎯 Movement working: {'✅ YES' if total_movement > 2.0 else '❌ NO'}")
            
            if total_movement < 2.0:
                print("🔧 DIAGNOSIS: Movement forces too weak or physics friction too high")
                print("💡 Suggestions: Increase moveSpeed further or reduce friction more")
            
            return total_movement > 2.0
        
        return False
        
    except Exception as e:
        print(f"❌ Debug test failed: {e}")
        return False
    finally:
        print(f"\n📋 Keeping browser open for 10 seconds for manual testing...")
        time.sleep(10)  # Extra time for manual testing
        try:
            driver.quit()
            print("🧹 Browser closed")
        except:
            pass

if __name__ == "__main__":
    print("🔧 COMPREHENSIVE MOVEMENT DEBUGGING")
    print("🎯 Testing buttons, sustained input, and force analysis")
    print("📸 Visual confirmation with debug grid")
    print("⏱️ Extended browser time for manual verification")
    print("")
    
    success = debug_movement_thoroughly()
    
    if success:
        print("\n🎉 MOVEMENT DEBUGGING: ISSUES RESOLVED!")
    else:
        print("\n🔧 MOVEMENT DEBUGGING: ISSUES IDENTIFIED!")
        print("📸 Check screenshots and console output for solutions")