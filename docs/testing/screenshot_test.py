#!/usr/bin/env python3

"""
RoboQuest Visual Testing with Screenshots
Automated testing with screenshot capture to see what's rendering
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os
from datetime import datetime

def test_game_with_screenshots():
    """Test game and capture screenshots to see visual output"""
    print("📸 RoboQuest Visual Testing with Screenshots")
    print("=" * 45)
    
    # Setup Chrome
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        print("🔧 Setting up Chrome WebDriver...")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_window_size(1280, 720)
        
        # Create screenshots directory
        os.makedirs('screenshots', exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        print("✅ WebDriver initialized")
        
        # Load game
        print("🌐 Loading game...")
        driver.get('http://localhost:8000/game/index.html')
        
        # Screenshot 1: Initial loading
        driver.save_screenshot(f'screenshots/01_loading_{timestamp}.png')
        print("📸 Screenshot 1: Loading screen")
        
        # Wait for game to initialize
        print("⏱️ Waiting for game initialization...")
        time.sleep(5)  # Give extra time for initialization
        
        # Screenshot 2: After initialization
        driver.save_screenshot(f'screenshots/02_initialized_{timestamp}.png')
        print("📸 Screenshot 2: After initialization")
        
        # Check console for errors
        print("\n📋 CONSOLE STATUS:")
        logs = driver.get_log('browser')
        success_messages = []
        error_messages = []
        
        for log in logs:
            message = log['message']
            if 'initialized successfully' in message or 'Game engine ready' in message:
                success_messages.append(message)
                print(f"✅ {message}")
            elif log['level'] == 'SEVERE' and 'CANNON' not in message:
                error_messages.append(message)
                print(f"❌ {message}")
        
        # Check if 3D scene is loaded
        print("\n🧪 CHECKING 3D SCENE:")
        try:
            scene_info = driver.execute_script("""
                return {
                    sceneExists: !!window.gameEngine?.scene,
                    sceneChildren: window.gameEngine?.scene?.children?.length || 0,
                    cameraExists: !!window.gameEngine?.camera,
                    rendererExists: !!window.gameEngine?.renderer,
                    playerExists: !!window.gameLogic?.player?.mesh,
                    worldExists: !!window.gameLogic?.worldManager
                };
            """)
            
            print(f"📊 Scene objects: {scene_info['sceneChildren']}")
            print(f"✅ Camera: {'✓' if scene_info['cameraExists'] else '✗'}")
            print(f"✅ Renderer: {'✓' if scene_info['rendererExists'] else '✗'}")
            print(f"✅ Player: {'✓' if scene_info['playerExists'] else '✗'}")
            print(f"✅ World: {'✓' if scene_info['worldExists'] else '✗'}")
            
        except Exception as e:
            print(f"❌ Could not check 3D scene: {e}")
        
        # Wait a bit more and take final screenshot
        time.sleep(3)
        driver.save_screenshot(f'screenshots/03_final_{timestamp}.png')
        print("📸 Screenshot 3: Final state")
        
        # Test movement and capture
        print("\n🎮 TESTING MOVEMENT:")
        try:
            body = driver.find_element(By.TAG_NAME, 'body')
            body.send_keys('d' * 5)  # Move right
            time.sleep(1)
            
            driver.save_screenshot(f'screenshots/04_after_movement_{timestamp}.png')
            print("📸 Screenshot 4: After movement test")
            
            # Check if player moved
            player_pos = driver.execute_script("""
                return window.gameLogic?.player?.mesh?.position ? {
                    x: window.gameLogic.player.mesh.position.x,
                    y: window.gameLogic.player.mesh.position.y,
                    z: window.gameLogic.player.mesh.position.z
                } : null;
            """)
            
            if player_pos:
                print(f"📍 Player position: x={player_pos['x']:.2f}, y={player_pos['y']:.2f}, z={player_pos['z']:.2f}")
            
        except Exception as e:
            print(f"⚠️ Movement test failed: {e}")
        
        # Final analysis
        print(f"\n📊 VISUAL TEST SUMMARY:")
        print(f"📸 Screenshots saved: screenshots/*_{timestamp}.png")
        print(f"✅ Success messages: {len(success_messages)}")
        print(f"❌ Critical errors: {len(error_messages)}")
        
        success = len(success_messages) > 0 and len(error_messages) == 0
        print(f"🏆 Overall: {'✅ VISUAL SUCCESS' if success else '⚠️ NEEDS FIXES'}")
        
        print(f"\n📁 Check screenshots to see what's actually rendering!")
        print(f"🔍 Look at: screenshots/03_final_{timestamp}.png")
        
        return success, f'screenshots/03_final_{timestamp}.png'
        
    except Exception as e:
        print(f"❌ Screenshot test failed: {e}")
        return False, None
    finally:
        try:
            driver.quit()
            print("🧹 Browser closed")
        except:
            pass

if __name__ == "__main__":
    success, screenshot_path = test_game_with_screenshots()
    
    if success:
        print(f"\n🎉 VISUAL TEST PASSED!")
        print(f"📸 Check screenshot: {screenshot_path}")
    else:
        print(f"\n⚠️ VISUAL TEST ISSUES!")
        print(f"📸 Check screenshots for debugging")
        
    print(f"\n🎯 Next: Review screenshots and fix any visual issues")