#!/usr/bin/env python3

"""
Texture Implementation Testing
Screenshot-based validation of texture loading and visual improvements
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time

def test_texture_implementation():
    """Test texture loading with before/after screenshot comparison"""
    print("🎨 Texture Implementation Testing")
    print("=" * 40)
    print("🎯 Testing ground textures vs blocky materials")
    print("📸 Screenshot validation methodology")
    
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_window_size(1280, 720)
        
        print("🌐 Loading game with texture implementation...")
        driver.get('http://localhost:8000/game/index.html')
        time.sleep(5)  # Wait for texture loading
        
        # Screenshot 1: Initial state with textures
        driver.save_screenshot('texture_test_1_initial_with_textures.png')
        print("📸 1. Initial screenshot with texture implementation")
        
        # Check console for texture loading messages
        print("\n📋 TEXTURE LOADING STATUS:")
        logs = driver.get_log('browser')
        texture_logs = [log['message'] for log in logs if 'texture' in log['message'].lower() or 'grass' in log['message'].lower()]
        
        print(f"🎨 Texture-related logs: {len(texture_logs)}")
        for log in texture_logs:
            print(f"🎨 {log}")
        
        # Check if any texture loading errors
        error_logs = [log['message'] for log in logs if log['level'] == 'SEVERE' and 'texture' in log['message'].lower()]
        if error_logs:
            print("❌ Texture loading errors found:")
            for error in error_logs:
                print(f"❌ {error}")
        else:
            print("✅ No texture loading errors detected")
        
        # Test movement to see textured world interaction
        print("\n🎮 Testing movement on textured ground...")
        canvas = driver.find_element(By.ID, 'gameCanvas')
        canvas.click()
        
        # Move around to see texture details
        from selenium.webdriver.common.action_chains import ActionChains
        actions = ActionChains(driver)
        
        # Circular movement pattern to show textures
        movement_pattern = [
            ('d', 2, 'Move right to see texture detail'),
            ('w', 2, 'Move forward across textured ground'),  
            ('a', 2, 'Move left to test texture consistency'),
            ('s', 2, 'Move back to starting area')
        ]
        
        for key, duration, description in movement_pattern:
            print(f"   {description}...")
            actions.key_down(key).perform()
            time.sleep(duration)
            actions.key_up(key).perform()
            time.sleep(0.5)
        
        # Final screenshot after movement
        driver.save_screenshot('texture_test_2_after_movement_on_textures.png')
        print("📸 2. After movement on textured ground")
        
        # Analyze game state
        game_state = driver.execute_script("""
            return {
                sceneObjects: window.gameEngine?.scene?.children?.length || 0,
                playerPosition: window.gameLogic?.player?.mesh?.position ? {
                    x: Math.round(window.gameLogic.player.mesh.position.x * 10) / 10,
                    y: Math.round(window.gameLogic.player.mesh.position.y * 10) / 10,
                    z: Math.round(window.gameLogic.player.mesh.position.z * 10) / 10
                } : null,
                gameRunning: window.gameLogic?.gameState === 'playing'
            };
        """)
        
        print(f"\n📊 TEXTURE TEST ANALYSIS:")
        print(f"📦 Scene objects: {game_state['sceneObjects']}")
        print(f"📍 Player position: {game_state['playerPosition']}")
        print(f"🎮 Game running: {game_state['gameRunning']}")
        
        # Visual quality assessment
        print(f"\n🎯 VISUAL QUALITY COMPARISON:")
        print(f"📸 Compare screenshots:")
        print(f"   - texture_test_1_initial_with_textures.png")
        print(f"   - texture_test_2_after_movement_on_textures.png")
        print(f"🔍 Look for:")
        print(f"   ✅ Ground texture detail vs solid color")
        print(f"   ✅ Realistic surface appearance")
        print(f"   ✅ Texture tiling and repetition")
        print(f"   ✅ Integration with existing lighting")
        
        # Determine success based on logs and state
        texture_success = len(texture_logs) > 0 and len(error_logs) == 0
        game_success = game_state['gameRunning'] and game_state['sceneObjects'] > 50
        
        overall_success = texture_success and game_success
        
        print(f"\n🏆 TEXTURE TEST RESULT: {'✅ SUCCESS' if overall_success else '❌ NEEDS FIXES'}")
        
        if overall_success:
            print("🎉 Textures loaded and game working!")
            print("🚀 Ready for platform texture implementation")
        else:
            print("🔧 Texture or game issues detected")
            print("📋 Check console logs and screenshots")
        
        return overall_success
        
    except Exception as e:
        print(f"❌ Texture test failed: {e}")
        return False
    finally:
        print(f"\n⏱️ Extended time for visual texture inspection...")
        time.sleep(10)  # Time to see texture detail
        try:
            driver.quit()
            print("🧹 Browser closed")
        except:
            pass

if __name__ == "__main__":
    print("🎨 TEXTURE IMPLEMENTATION WITH ASTRO BOT REFERENCE")
    print("🎯 Goal: Replace blocky materials with detailed textures")
    print("📚 Reference: astrobot.png showing detailed ground and surfaces")
    print("🔬 Method: Screenshot validation with movement testing")
    print("")
    
    success = test_texture_implementation()
    
    if success:
        print("\n🎉 TEXTURE IMPLEMENTATION SUCCESS!")
        print("🚀 Ready for next texture phase: platforms and environment")
    else:
        print("\n🔧 TEXTURE IMPLEMENTATION NEEDS WORK!")
        print("📸 Check screenshots for visual comparison")