#!/usr/bin/env python3

"""
RoboQuest Game Testing Script
Automated testing with console monitoring using Selenium
"""

import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

class RoboQuestGameTester:
    def __init__(self):
        self.driver = None
        self.game_url = 'http://localhost:8000/game/index.html'
        self.test_results = []
        self.console_logs = []
        
    def setup_driver(self):
        """Initialize Chrome WebDriver with console logging"""
        print("🔧 Setting up test environment...")
        
        chrome_options = Options()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        
        # Enable console logging
        chrome_options.add_argument('--enable-logging')
        chrome_options.add_argument('--log-level=0')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_window_size(1280, 720)
            print("✅ Chrome WebDriver initialized")
            return True
        except WebDriverException as e:
            print(f"❌ Failed to initialize WebDriver: {e}")
            return False
    
    def capture_console_logs(self):
        """Capture browser console logs"""
        try:
            logs = self.driver.get_log('browser')
            for log in logs:
                if log['level'] in ['INFO', 'WARNING', 'SEVERE']:
                    self.console_logs.append({
                        'level': log['level'],
                        'message': log['message'],
                        'timestamp': datetime.now().isoformat()
                    })
                    print(f"🎮 Console: {log['message']}")
        except Exception as e:
            print(f"⚠️ Could not capture console logs: {e}")
    
    def test_game_loading(self):
        """Test if the game loads successfully"""
        print("\n🧪 Testing game loading...")
        
        try:
            self.driver.get(self.game_url)
            
            # Wait for loading to complete
            WebDriverWait(self.driver, 15).until(
                EC.invisibility_of_element_located((By.ID, "loading"))
            )
            
            # Check if game canvas is present
            canvas = self.driver.find_element(By.ID, "gameCanvas")
            
            # Check if game objects are initialized
            game_ready = self.driver.execute_script("""
                return !!(window.gameEngine && 
                          window.gameLogic && 
                          window.gameLogic.player &&
                          window.gameLogic.worldManager);
            """)
            
            result = {
                'test': 'game_loading',
                'passed': bool(canvas and game_ready),
                'canvas_present': bool(canvas),
                'game_objects_ready': bool(game_ready),
                'timestamp': datetime.now().isoformat()
            }
            
            self.test_results.append(result)
            print(f"{'✅' if result['passed'] else '❌'} Game loading: {'PASSED' if result['passed'] else 'FAILED'}")
            
            return result['passed']
            
        except TimeoutException:
            print("❌ Game loading timed out")
            self.test_results.append({
                'test': 'game_loading',
                'passed': False,
                'error': 'Loading timeout',
                'timestamp': datetime.now().isoformat()
            })
            return False
        except Exception as e:
            print(f"❌ Game loading error: {e}")
            return False
    
    def test_player_movement(self):
        """Test player movement controls"""
        print("\n🧪 Testing player movement...")
        
        try:
            # Get initial player position
            initial_pos = self.driver.execute_script("""
                return {
                    x: window.gameLogic.player.getPosition().x,
                    y: window.gameLogic.player.getPosition().y,
                    z: window.gameLogic.player.getPosition().z
                };
            """)
            
            print(f"📍 Initial position: x={initial_pos['x']:.2f}, y={initial_pos['y']:.2f}, z={initial_pos['z']:.2f}")
            
            # Focus canvas and hold D for 1s using ActionChains (reliable movement)
            canvas = self.driver.find_element(By.ID, 'gameCanvas')
            canvas.click()
            actions = webdriver.common.action_chains.ActionChains(self.driver)
            actions.key_down('d').perform()
            time.sleep(1.0)
            actions.key_up('d').perform()
            
            # Get new position
            new_pos = self.driver.execute_script("""
                return {
                    x: window.gameLogic.player.getPosition().x,
                    y: window.gameLogic.player.getPosition().y,
                    z: window.gameLogic.player.getPosition().z
                };
            """)
            
            # Check if player moved
            distance_moved = abs(new_pos['x'] - initial_pos['x'])
            movement_working = distance_moved > 0.5
            
            result = {
                'test': 'player_movement',
                'passed': movement_working,
                'initial_position': initial_pos,
                'new_position': new_pos,
                'distance_moved': distance_moved,
                'timestamp': datetime.now().isoformat()
            }
            
            self.test_results.append(result)
            print(f"{'✅' if movement_working else '❌'} Movement: {'WORKING' if movement_working else 'FAILED'}")
            print(f"📏 Distance moved: {distance_moved:.2f} units")
            
            return movement_working
            
        except Exception as e:
            print(f"❌ Movement test error: {e}")
            return False
    
    def test_jumping(self):
        """Test jump and hover mechanics"""
        print("\n🧪 Testing jump mechanics...")
        
        try:
            # Get initial Y position
            initial_y = self.driver.execute_script("""
                return window.gameLogic.player.getPosition().y;
            """)
            
            # Jump test (focus canvas and hold Space briefly)
            canvas = self.driver.find_element(By.ID, 'gameCanvas')
            canvas.click()
            actions = webdriver.common.action_chains.ActionChains(self.driver)
            actions.key_down(Keys.SPACE).perform()
            time.sleep(0.2)
            actions.key_up(Keys.SPACE).perform()
            
            # Check if player is higher
            jump_y = self.driver.execute_script("""
                return window.gameLogic.player.getPosition().y;
            """)
            
            jump_working = jump_y > initial_y + 1
            
            result = {
                'test': 'jumping',
                'passed': jump_working,
                'initial_y': initial_y,
                'jump_y': jump_y,
                'height_gained': jump_y - initial_y,
                'timestamp': datetime.now().isoformat()
            }
            
            self.test_results.append(result)
            print(f"{'✅' if jump_working else '❌'} Jumping: {'WORKING' if jump_working else 'FAILED'}")
            print(f"📈 Height gained: {jump_y - initial_y:.2f} units")
            
            return jump_working
            
        except Exception as e:
            print(f"❌ Jump test error: {e}")
            return False
    
    def test_game_performance(self):
        """Test game performance and FPS"""
        print("\n🧪 Testing game performance...")
        
        try:
            # Let game run for a few seconds to stabilize
            time.sleep(3)
            
            performance_stats = self.driver.execute_script("""
                return {
                    fps: window.gameLogic ? window.gameLogic.getPerformanceStats().fps : 0,
                    deltaTime: window.gameLogic ? window.gameLogic.getPerformanceStats().deltaTime : 0,
                    objects: window.gameLogic ? window.gameLogic.getPerformanceStats().objects : 0,
                    physicsObjects: window.gameLogic ? window.gameLogic.getPerformanceStats().physicsObjects : 0
                };
            """)
            
            fps_good = performance_stats['fps'] > 30
            
            result = {
                'test': 'performance',
                'passed': fps_good,
                'performance_stats': performance_stats,
                'timestamp': datetime.now().isoformat()
            }
            
            self.test_results.append(result)
            print(f"{'✅' if fps_good else '❌'} Performance: {'GOOD' if fps_good else 'POOR'}")
            print(f"📊 FPS: {performance_stats['fps']}")
            print(f"📦 Objects: {performance_stats['objects']} (visual), {performance_stats['physicsObjects']} (physics)")
            
            return fps_good
            
        except Exception as e:
            print(f"❌ Performance test error: {e}")
            return False
    
    def run_automated_gameplay(self):
        """Run automated gameplay to test game mechanics"""
        print("\n🎮 Running automated gameplay test...")
        
        try:
            body = self.driver.find_element(By.TAG_NAME, 'body')
            
            # Automated movement sequence
            movements = [
                ('d', 1.0),  # Move right
                (Keys.SPACE, 0.2),  # Jump
                ('w', 0.5),  # Move forward
                ('a', 1.0),  # Move left
                (Keys.SPACE, 0.2),  # Jump again
                ('s', 0.5),  # Move back
            ]
            
            for key, duration in movements:
                body.send_keys(key)
                time.sleep(duration)
                self.capture_console_logs()
            
            # Get final game state
            final_state = self.driver.execute_script("""
                return {
                    playerPosition: window.gameLogic.player.getPosition(),
                    playerCoins: window.gameLogic.player.coins,
                    playerLives: window.gameLogic.player.lives,
                    gameState: window.gameLogic.gameState
                };
            """)
            
            print(f"🏁 Final player position: {final_state['playerPosition']}")
            print(f"🪙 Coins collected: {final_state['playerCoins']}")
            print(f"❤️ Lives remaining: {final_state['playerLives']}")
            
            return final_state
            
        except Exception as e:
            print(f"❌ Automated gameplay error: {e}")
            return None
    
    def run_full_test_suite(self):
        """Run complete test suite"""
        print("🚀 Starting RoboQuest Game Test Suite")
        print("=" * 50)
        
        if not self.setup_driver():
            return False
        
        try:
            # Run all tests
            tests = [
                self.test_game_loading(),
                self.test_player_movement(),
                self.test_jumping(),
                self.test_game_performance()
            ]
            
            # Run automated gameplay
            gameplay_result = self.run_automated_gameplay()
            
            # Capture final console logs
            self.capture_console_logs()
            
            # Generate and save report
            self.save_test_report()
            
            passed_tests = sum(tests)
            total_tests = len(tests)
            
            print(f"\n🏆 TEST SUITE COMPLETE")
            print(f"📊 Results: {passed_tests}/{total_tests} tests passed")
            print(f"📝 Console logs captured: {len(self.console_logs)}")
            
            return passed_tests == total_tests
            
        except Exception as e:
            print(f"❌ Test suite error: {e}")
            return False
        finally:
            self.cleanup_driver()
    
    def save_test_report(self):
        """Save detailed test report"""
        report = {
            'game': 'RoboQuest 3D Platformer',
            'test_suite_version': '1.0',
            'timestamp': datetime.now().isoformat(),
            'url': self.game_url,
            'test_results': self.test_results,
            'console_logs': self.console_logs,
            'summary': {
                'total_tests': len([r for r in self.test_results if 'passed' in r]),
                'passed_tests': len([r for r in self.test_results if r.get('passed', False)]),
                'console_entries': len(self.console_logs),
                'errors': len([r for r in self.test_results if r.get('passed', True) == False])
            }
        }
        
        with open('game-test-report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📋 Test report saved: game-test-report.json")
    
    def cleanup_driver(self):
        """Clean up WebDriver"""
        if self.driver:
            self.driver.quit()
            print("🧹 Browser closed")

def quick_game_test():
    """Quick test function for immediate feedback"""
    print("⚡ Quick RoboQuest Game Test")
    print("=" * 30)
    
    tester = RoboQuestGameTester()
    
    try:
        if not tester.setup_driver():
            print("❌ Could not set up browser for testing")
            return False
        
        print("🌐 Loading game...")
        success = tester.test_game_loading()
        
        if success:
            print("✅ Game loaded successfully!")
            
            # Quick movement test
            tester.test_player_movement()
            tester.test_jumping()
            
            # Let it run for a moment
            print("🎮 Running game for 5 seconds...")
            time.sleep(5)
            tester.capture_console_logs()
            
            print(f"📝 Captured {len(tester.console_logs)} console logs")
            
        return success
        
    except Exception as e:
        print(f"❌ Quick test failed: {e}")
        return False
    finally:
        tester.cleanup_driver()

if __name__ == "__main__":
    # Check if we can run quick test or full suite
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--full':
        # Full test suite
        tester = RoboQuestGameTester()
        success = tester.run_full_test_suite()
        sys.exit(0 if success else 1)
    else:
        # Quick test
        success = quick_game_test()
        if success:
            print("\n🎯 Quick test PASSED! Game is working.")
        else:
            print("\n❌ Quick test FAILED! Check game setup.")
        sys.exit(0 if success else 1)
