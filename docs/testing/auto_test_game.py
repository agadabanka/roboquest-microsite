#!/usr/bin/env python3

"""
Automated RoboQuest Game Testing with Console Reading
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json

def test_roboquest_game():
    """Automated test with console reading"""
    print("🤖 RoboQuest Automated Game Testing")
    print("=" * 40)
    
    # Setup Chrome with console logging
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        # Initialize driver
        print("🔧 Setting up Chrome WebDriver...")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_window_size(1280, 720)
        
        print("✅ WebDriver initialized")
        
        # Load game
        print("🌐 Loading game...")
        driver.get('http://localhost:8000/game/index.html')
        
        # Wait for game to load
        print("⏱️ Waiting for game initialization...")
        try:
            WebDriverWait(driver, 15).until(
                EC.invisibility_of_element_located((By.ID, "loading"))
            )
            print("✅ Game loaded!")
        except:
            print("⚠️ Loading element didn't disappear, continuing...")
        
        # Wait a bit more for initialization
        time.sleep(3)
        
        # Check console logs
        print("\n📋 CONSOLE LOGS:")
        print("-" * 20)
        
        logs = driver.get_log('browser')
        game_logs = []
        errors = []
        
        for log in logs:
            level = log['level']
            message = log['message']
            
            if 'gameEngine' in message or 'RoboQuest' in message or 'Game' in message:
                game_logs.append(message)
                print(f"🎮 {message}")
            elif level == 'SEVERE':
                errors.append(message)
                print(f"❌ ERROR: {message}")
            elif level == 'WARNING':
                print(f"⚠️ WARNING: {message}")
        
        # Test game state
        print("\n🧪 TESTING GAME STATE:")
        print("-" * 25)
        
        try:
            game_state = driver.execute_script("""
                return {
                    engineExists: !!window.gameEngine,
                    logicExists: !!window.gameLogic,
                    playerExists: !!window.gameLogic?.player,
                    worldExists: !!window.gameLogic?.worldManager,
                    isLoaded: !!window.gameEngine?.isLoaded,
                    gameState: window.gameLogic?.gameState,
                    playerPosition: window.gameLogic?.player?.getPosition(),
                    playerCoins: window.gameLogic?.player?.coins || 0
                };
            """)
            
            print(f"✅ Game Engine: {'✓' if game_state['engineExists'] else '✗'}")
            print(f"✅ Game Logic: {'✓' if game_state['logicExists'] else '✗'}")  
            print(f"✅ Player: {'✓' if game_state['playerExists'] else '✗'}")
            print(f"✅ World: {'✓' if game_state['worldExists'] else '✗'}")
            print(f"✅ Loaded: {'✓' if game_state['isLoaded'] else '✗'}")
            print(f"📊 Game State: {game_state['gameState']}")
            
            if game_state['playerPosition']:
                pos = game_state['playerPosition']
                print(f"📍 Player Position: x={pos['x']:.1f}, y={pos['y']:.1f}, z={pos['z']:.1f}")
            
            print(f"🪙 Player Coins: {game_state['playerCoins']}")
            
        except Exception as e:
            print(f"❌ Could not read game state: {e}")
        
        # Test movement
        print("\n🎮 TESTING MOVEMENT:")
        print("-" * 20)
        
        try:
            # Get initial position
            initial_pos = driver.execute_script("return window.gameLogic?.player?.getPosition();")
            
            if initial_pos:
                print(f"📍 Initial: x={initial_pos['x']:.1f}, y={initial_pos['y']:.1f}, z={initial_pos['z']:.1f}")
                
                # Test movement
                body = driver.find_element(By.TAG_NAME, 'body')
                body.send_keys('d' * 10)  # Hold D key
                time.sleep(1)
                
                # Check new position
                new_pos = driver.execute_script("return window.gameLogic?.player?.getPosition();")
                if new_pos:
                    moved = abs(new_pos['x'] - initial_pos['x']) > 0.1
                    print(f"📍 After 'D': x={new_pos['x']:.1f}, y={new_pos['y']:.1f}, z={new_pos['z']:.1f}")
                    print(f"🏃 Movement: {'✅ WORKING' if moved else '❌ FAILED'}")
                
                # Test jumping
                body.send_keys(Keys.SPACE)
                time.sleep(0.5)
                jump_pos = driver.execute_script("return window.gameLogic?.player?.getPosition();")
                if jump_pos:
                    jumped = jump_pos['y'] > new_pos['y'] + 0.5
                    print(f"🦘 Jump: {'✅ WORKING' if jumped else '❌ FAILED'}")
            
        except Exception as e:
            print(f"❌ Movement test failed: {e}")
        
        # Final console check
        print("\n📋 FINAL CONSOLE CHECK:")
        print("-" * 25)
        
        final_logs = driver.get_log('browser')
        new_logs = final_logs[len(logs):]  # Only new logs
        
        for log in new_logs:
            if log['level'] == 'SEVERE':
                print(f"❌ NEW ERROR: {log['message']}")
            elif 'collected' in log['message'].lower():
                print(f"🪙 COLLECTION: {log['message']}")
            elif 'roboquest' in log['message'].lower():
                print(f"🎮 GAME: {log['message']}")
        
        # Summary
        print(f"\n🎯 TEST SUMMARY:")
        print(f"📊 Total console logs: {len(logs + new_logs)}")
        print(f"🎮 Game-related logs: {len(game_logs)}")
        print(f"❌ Errors found: {len(errors)}")
        
        success = len(errors) == 0 and game_state.get('isLoaded', False)
        print(f"🏆 Overall: {'✅ SUCCESS' if success else '❌ NEEDS FIXES'}")
        
        # Keep browser open for 5 seconds for visual inspection
        print("\n👀 Keeping browser open for 5 seconds for visual inspection...")
        time.sleep(5)
        
        return success
        
    except Exception as e:
        print(f"❌ Test setup failed: {e}")
        return False
    finally:
        try:
            driver.quit()
            print("🧹 Browser closed")
        except:
            pass

if __name__ == "__main__":
    success = test_roboquest_game()
    
    if success:
        print("\n🎉 GAME TEST PASSED!")
        print("🚀 Ready for deployment to roboquest.ninja")
    else:
        print("\n⚠️ GAME TEST ISSUES FOUND!")
        print("🔧 Check console output above for details")