#!/usr/bin/env python3

"""
Test RoboQuest game with manual movement button
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time

def test_game_with_manual_movement():
    """Test game and trigger manual movement via button"""
    print("🧪 Testing Game with Manual Movement Button")
    print("=" * 45)
    
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_window_size(1280, 720)
        
        print("🌐 Loading game...")
        driver.get('http://localhost:8000/game/index.html')
        time.sleep(5)  # Wait for full initialization
        
        # Check initial state
        print("📊 Checking initial game state...")
        initial_state = driver.execute_script("""
            return {
                gameReady: !!window.gameLogic,
                playerExists: !!window.gameLogic?.player,
                playerPosition: window.gameLogic?.player?.mesh?.position ? {
                    x: window.gameLogic.player.mesh.position.x,
                    y: window.gameLogic.player.mesh.position.y,
                    z: window.gameLogic.player.mesh.position.z
                } : null,
                sceneObjects: window.gameEngine?.scene?.children?.length || 0
            };
        """)
        
        print(f"✅ Game ready: {initial_state['gameReady']}")
        print(f"✅ Player exists: {initial_state['playerExists']}")
        print(f"📍 Initial position: {initial_state['playerPosition']}")
        print(f"📦 Scene objects: {initial_state['sceneObjects']}")
        
        # Take initial screenshot
        driver.save_screenshot('test-initial.png')
        print("📸 Initial screenshot saved")
        
        # Click the test movement button
        print("🎮 Triggering manual movement test...")
        try:
            test_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Test Movement')]")
            test_button.click()
            time.sleep(1)
            
            # Check position after manual movement
            final_state = driver.execute_script("""
                return {
                    playerPosition: window.gameLogic?.player?.mesh?.position ? {
                        x: window.gameLogic.player.mesh.position.x,
                        y: window.gameLogic.player.mesh.position.y,
                        z: window.gameLogic.player.mesh.position.z
                    } : null
                };
            """)
            
            print(f"📍 Final position: {final_state['playerPosition']}")
            
            # Check if player moved
            if initial_state['playerPosition'] and final_state['playerPosition']:
                moved = (abs(final_state['playerPosition']['x'] - initial_state['playerPosition']['x']) > 0.1 or
                        abs(final_state['playerPosition']['z'] - initial_state['playerPosition']['z']) > 0.1)
                print(f"🏃 Manual movement: {'✅ SUCCESS' if moved else '❌ FAILED'}")
            
            # Take final screenshot
            driver.save_screenshot('test-after-movement.png')
            print("📸 Movement screenshot saved")
            
        except Exception as e:
            print(f"❌ Button test failed: {e}")
        
        # Check console for movement-related logs
        print("\n📋 Recent console logs:")
        logs = driver.get_log('browser')
        movement_logs = [log['message'] for log in logs if 'movement' in log['message'].lower() or 'position' in log['message'].lower()]
        
        for log in movement_logs[-10:]:  # Last 10 movement-related logs
            print(f"🎮 {log}")
        
        # Final status
        success = initial_state['gameReady'] and initial_state['sceneObjects'] > 40
        print(f"\n🏆 Game status: {'✅ WORKING' if success else '❌ BROKEN'}")
        
        return success
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        try:
            driver.quit()
        except:
            pass

if __name__ == "__main__":
    success = test_game_with_manual_movement()
    
    if success:
        print("\n🎉 GAME IS WORKING!")
        print("📸 Check screenshots: test-initial.png and test-after-movement.png")
        print("🎯 Ready to debug movement controls or add physics")
    else:
        print("\n⚠️ GAME NEEDS FIXES!")
        print("🔧 Check console output and screenshots")