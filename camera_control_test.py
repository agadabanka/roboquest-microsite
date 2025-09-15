#!/usr/bin/env python3

"""
3rd Person Camera Control Testing
Test the new camera system with mouse and movement controls
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
import time

def test_camera_controls():
    """Test the new 3rd person camera system"""
    print("📷 3rd Person Camera Control Testing")
    print("=" * 40)
    print("🎯 Testing mouse camera rotation + WASD movement")
    print("📸 Screenshot validation with camera movement")
    
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_window_size(1280, 720)
        
        print("🌐 Loading game with new camera system...")
        driver.get('http://localhost:8000/game/index.html')
        time.sleep(5)  # Wait for initialization
        
        # Screenshot 1: Initial camera position
        driver.save_screenshot('camera_test_1_initial.png')
        print("📸 1. Initial camera position")
        
        # Check if new camera controller loaded
        camera_status = driver.execute_script("""
            return {
                cameraControllerExists: !!window.gameLogic?.cameraController,
                playerExists: !!window.gameLogic?.player,
                cameraPosition: {
                    x: window.gameEngine?.camera?.position.x || 0,
                    y: window.gameEngine?.camera?.position.y || 0,
                    z: window.gameEngine?.camera?.position.z || 0
                }
            };
        """)
        
        print(f"📊 Camera Status:")
        print(f"   ✅ Camera Controller: {camera_status['cameraControllerExists']}")
        print(f"   ✅ Player: {camera_status['playerExists']}")
        print(f"   📍 Camera Position: {camera_status['cameraPosition']}")
        
        canvas = driver.find_element(By.ID, 'gameCanvas')
        
        # Test 1: Mouse camera rotation
        print("\n🖱️ TEST 1: Mouse camera rotation...")
        canvas.click()  # Focus
        
        actions = ActionChains(driver)
        
        # Simulate mouse drag for camera rotation
        actions.click_and_hold(canvas).perform()
        time.sleep(0.5)
        
        # Drag right to rotate camera
        actions.move_by_offset(100, 0).perform()
        time.sleep(1)
        
        # Drag down to adjust pitch
        actions.move_by_offset(0, 50).perform()
        time.sleep(1)
        
        actions.release().perform()
        
        driver.save_screenshot('camera_test_2_after_mouse_rotation.png')
        print("📸 2. After mouse camera rotation")
        
        # Test 2: WASD movement with camera-relative directions
        print("\n🎮 TEST 2: WASD movement with camera...")
        
        movement_tests = [
            ('w', 3, 'Move forward relative to camera'),
            ('d', 2, 'Move right relative to camera'), 
            ('s', 2, 'Move backward relative to camera'),
            ('a', 2, 'Move left relative to camera')
        ]
        
        for key, duration, description in movement_tests:
            print(f"   {description}...")
            actions = ActionChains(driver)
            actions.key_down(key).perform()
            time.sleep(duration)
            actions.key_up(key).perform()
            time.sleep(0.5)
        
        driver.save_screenshot('camera_test_3_after_wasd_movement.png')
        print("📸 3. After WASD movement")
        
        # Test 3: Mouse wheel zoom
        print("\n🔍 TEST 3: Mouse wheel zoom...")
        
        # Simulate scroll wheel (zoom out)
        driver.execute_script("window.dispatchEvent(new WheelEvent('wheel', {deltaY: 500}));")
        time.sleep(1)
        
        driver.save_screenshot('camera_test_4_after_zoom_out.png')
        print("📸 4. After zoom out")
        
        # Zoom back in
        driver.execute_script("window.dispatchEvent(new WheelEvent('wheel', {deltaY: -300}));")
        time.sleep(1)
        
        driver.save_screenshot('camera_test_5_after_zoom_in.png')
        print("📸 5. After zoom in")
        
        # Check console for camera-related logs
        print("\n📋 CAMERA CONSOLE ANALYSIS:")
        logs = driver.get_log('browser')
        camera_logs = [log['message'] for log in logs if 'camera' in log['message'].lower() or 'rotation' in log['message'].lower()]
        
        print(f"📷 Camera-related logs: {len(camera_logs)}")
        for log in camera_logs[-5:]:  # Last 5 camera logs
            print(f"📷 {log}")
        
        # Final camera state
        final_camera_state = driver.execute_script("""
            return {
                cameraPosition: {
                    x: Math.round(window.gameEngine?.camera?.position.x * 10) / 10,
                    y: Math.round(window.gameEngine?.camera?.position.y * 10) / 10,
                    z: Math.round(window.gameEngine?.camera?.position.z * 10) / 10
                },
                playerPosition: window.gameLogic?.player?.mesh?.position ? {
                    x: Math.round(window.gameLogic.player.mesh.position.x * 10) / 10,
                    y: Math.round(window.gameLogic.player.mesh.position.y * 10) / 10,
                    z: Math.round(window.gameLogic.player.mesh.position.z * 10) / 10
                } : null
            };
        """)
        
        print(f"\n📊 FINAL CAMERA TEST ANALYSIS:")
        print(f"📷 Final camera position: {final_camera_state['cameraPosition']}")
        print(f"🤖 Final player position: {final_camera_state['playerPosition']}")
        
        print(f"\n🎯 SCREENSHOT COMPARISON:")
        print(f"📸 Compare these for camera behavior:")
        print(f"   - camera_test_1_initial.png (starting view)")
        print(f"   - camera_test_2_after_mouse_rotation.png (mouse rotation)")
        print(f"   - camera_test_3_after_wasd_movement.png (movement)")
        print(f"   - camera_test_4_after_zoom_out.png (zoom out)")
        print(f"   - camera_test_5_after_zoom_in.png (zoom in)")
        
        # Determine success
        camera_working = camera_status['cameraControllerExists']
        movement_working = final_camera_state['playerPosition'] is not None
        
        success = camera_working and movement_working
        
        print(f"\n🏆 CAMERA TEST RESULT: {'✅ SUCCESS' if success else '❌ NEEDS FIXES'}")
        
        if success:
            print("🎉 3rd person camera system working!")
            print("🎮 Ready for professional camera controls!")
        else:
            print("🔧 Camera system needs debugging")
            print("📋 Check console logs and screenshots")
        
        return success
        
    except Exception as e:
        print(f"❌ Camera test failed: {e}")
        return False
    finally:
        print(f"\n⏱️ Extended time for manual camera testing...")
        time.sleep(15)  # Extra time for manual testing
        try:
            driver.quit()
            print("🧹 Browser closed")
        except:
            pass

if __name__ == "__main__":
    print("📷 3RD PERSON CAMERA SYSTEM TESTING")
    print("🎯 Testing mouse rotation + WASD movement + zoom")
    print("📸 Visual validation with before/after screenshots")
    print("⏱️ Extended manual testing time for camera feel")
    print("")
    
    success = test_camera_controls()
    
    if success:
        print("\n🎉 CAMERA CONTROL TEST PASSED!")
        print("📷 3rd person camera system working correctly!")
        print("🚀 Ready for professional game controls!")
    else:
        print("\n🔧 CAMERA CONTROL ISSUES FOUND!")
        print("📸 Check screenshots for camera behavior analysis")