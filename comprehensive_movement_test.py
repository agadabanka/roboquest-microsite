#!/usr/bin/env python3

"""
Comprehensive Movement Testing with Extended Exercise Plan
Test all movement controls with sustained input and visual confirmation
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import time

def comprehensive_movement_test():
    """Extended movement test with specific exercise plan"""
    print("🎮 Comprehensive RoboQuest Movement Test")
    print("=" * 45)
    print("🎯 20-second exercise plan to test all movement mechanics")
    
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
        time.sleep(3)  # Wait for initialization
        
        # Check game state
        game_state = driver.execute_script("""
            return {
                gameReady: !!window.gameLogic,
                playerReady: !!window.gameLogic?.player,
                physicsReady: !!window.gameLogic?.player?.physicsBody,
                playerPos: window.gameLogic?.player?.mesh?.position ? {
                    x: window.gameLogic.player.mesh.position.x,
                    y: window.gameLogic.player.mesh.position.y,
                    z: window.gameLogic.player.mesh.position.z
                } : null
            };
        """)
        
        print(f"✅ Game Ready: {game_state['gameReady']}")
        print(f"✅ Player Ready: {game_state['playerReady']}")  
        print(f"✅ Physics Ready: {game_state['physicsReady']}")
        print(f"📍 Starting Position: {game_state['playerPos']}")
        
        if not game_state['gameReady']:
            print("❌ Game not ready - aborting test")
            return False
        
        # Take initial screenshot
        driver.save_screenshot('movement_test_start.png')
        print("📸 Initial screenshot taken")
        
        # Get canvas element for focus
        canvas = driver.find_element(By.ID, 'gameCanvas')
        body = driver.find_element(By.TAG_NAME, 'body')
        
        print("\n🎮 STARTING 20-SECOND MOVEMENT EXERCISE PLAN:")
        print("=" * 50)
        
        # Movement Exercise Plan
        movements = [
            ("Move Right (D)", "KeyD", 3),
            ("Jump (Space)", "Space", 1), 
            ("Move Forward (W)", "KeyW", 3),
            ("Jump Again", "Space", 1),
            ("Move Left (A)", "KeyA", 3),
            ("Move Backward (S)", "KeyS", 3),
            ("Jump + Right", ["Space", "KeyD"], 2),
            ("Final Movement (W)", "KeyW", 2),
            ("Final Jump", "Space", 2)
        ]
        
        total_time = 0
        
        for i, (description, keys, duration) in enumerate(movements):
            print(f"🎯 Step {i+1}: {description} ({duration}s)")
            
            # Handle single key or multiple keys
            if isinstance(keys, str):
                keys = [keys]
            
            # Press keys using ActionChains for sustained input
            actions = ActionChains(driver)
            
            # Press down all keys
            for key in keys:
                if key == "Space":
                    actions.key_down(Keys.SPACE)
                elif key == "KeyW":
                    actions.key_down("w")
                elif key == "KeyA": 
                    actions.key_down("a")
                elif key == "KeyS":
                    actions.key_down("s")
                elif key == "KeyD":
                    actions.key_down("d")
            
            actions.perform()
            
            # Hold for duration
            time.sleep(duration)
            
            # Release all keys
            actions = ActionChains(driver)
            for key in keys:
                if key == "Space":
                    actions.key_up(Keys.SPACE)
                elif key == "KeyW":
                    actions.key_up("w")
                elif key == "KeyA":
                    actions.key_up("a") 
                elif key == "KeyS":
                    actions.key_up("s")
                elif key == "KeyD":
                    actions.key_up("d")
                    
            actions.perform()
            
            # Check position after this movement
            current_pos = driver.execute_script("""
                return window.gameLogic?.player?.mesh?.position ? {
                    x: Math.round(window.gameLogic.player.mesh.position.x * 100) / 100,
                    y: Math.round(window.gameLogic.player.mesh.position.y * 100) / 100,
                    z: Math.round(window.gameLogic.player.mesh.position.z * 100) / 100
                } : null;
            """)
            
            if current_pos:
                print(f"   📍 Position: x={current_pos['x']}, y={current_pos['y']}, z={current_pos['z']}")
            
            total_time += duration
            
            # Brief pause between movements
            time.sleep(0.5)
        
        # Take final screenshot
        driver.save_screenshot('movement_test_end.png')
        print(f"\n📸 Final screenshot taken after {total_time}s of movement")
        
        # Get final position and analyze movement
        final_pos = driver.execute_script("""
            return window.gameLogic?.player?.mesh?.position ? {
                x: window.gameLogic.player.mesh.position.x,
                y: window.gameLogic.player.mesh.position.y,
                z: window.gameLogic.player.mesh.position.z
            } : null;
        """)
        
        print(f"\n📊 MOVEMENT ANALYSIS:")
        print(f"📍 Start Position: {game_state['playerPos']}")
        print(f"📍 Final Position: {final_pos}")
        
        if game_state['playerPos'] and final_pos:
            distance_moved = ((final_pos['x'] - game_state['playerPos']['x'])**2 + 
                            (final_pos['z'] - game_state['playerPos']['z'])**2)**0.5
            height_change = abs(final_pos['y'] - game_state['playerPos']['y'])
            
            print(f"📏 Horizontal Distance: {distance_moved:.2f} units")
            print(f"📈 Height Change: {height_change:.2f} units") 
            
            movement_working = distance_moved > 1.0
            jumping_working = height_change > 0.5
            
            print(f"🏃 Movement: {'✅ WORKING' if movement_working else '❌ BROKEN'}")
            print(f"🦘 Jumping: {'✅ WORKING' if jumping_working else '❌ BROKEN'}")
            
            success = movement_working and jumping_working
        else:
            success = False
            print("❌ Could not analyze movement - position data unavailable")
        
        # Check console for physics-related messages
        print(f"\n📋 CONSOLE ANALYSIS:")
        logs = driver.get_log('browser')
        physics_logs = [log['message'] for log in logs if 'STEP' in log['message'] or 'physics' in log['message'].lower()]
        
        print(f"📊 Total console messages: {len(logs)}")
        print(f"🔧 Physics-related messages: {len(physics_logs)}")
        
        for log in physics_logs[-5:]:  # Show last 5 physics messages
            print(f"🎮 {log}")
        
        print(f"\n🏆 COMPREHENSIVE TEST RESULT: {'✅ SUCCESS' if success else '❌ NEEDS FIXES'}")
        
        if success:
            print("🎉 Movement and jumping both working!")
            print("🚀 Ready for collectibles and final game polish!")
        else:
            print("🔧 Movement or jumping needs debugging")
            print("📸 Check screenshots: movement_test_start.png vs movement_test_end.png")
        
        return success
        
    except Exception as e:
        print(f"❌ Comprehensive test failed: {e}")
        return False
    finally:
        print(f"\n📋 Keeping browser open for 5 seconds for visual inspection...")
        time.sleep(5)
        try:
            driver.quit()
            print("🧹 Browser closed")
        except:
            pass

if __name__ == "__main__":
    print("🎯 COMPREHENSIVE MOVEMENT TEST WITH EXERCISE PLAN")
    print("🎮 Testing all movement mechanics systematically")
    print("⏱️ Duration: ~20 seconds of sustained movement")
    print("📸 Visual confirmation via screenshots")
    print("🔍 Console monitoring for physics debugging")
    print("")
    
    success = comprehensive_movement_test()
    
    if success:
        print("\n🎉 COMPREHENSIVE MOVEMENT TEST PASSED!")
        print("🎮 All movement mechanics working perfectly!")
        print("🚀 Ready for final game polish and app store packaging!")
    else:
        print("\n⚠️ MOVEMENT ISSUES FOUND!")
        print("🔧 Check console output and screenshots for debugging")
        print("📸 Compare: movement_test_start.png vs movement_test_end.png")