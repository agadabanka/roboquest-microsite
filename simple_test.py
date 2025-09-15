#!/usr/bin/env python3

"""
Simple RoboQuest Game Testing
Opens browser and monitors via simple HTTP requests
"""

import subprocess
import time
import requests
import webbrowser
from datetime import datetime

def test_local_server():
    """Test if local server is running"""
    try:
        response = requests.get('http://localhost:8000', timeout=5)
        return response.status_code == 200
    except:
        return False

def test_game_files():
    """Test if game files are accessible"""
    game_files = [
        'http://localhost:8000/game/index.html',
        'http://localhost:8000/game/js/GameEngine.js',
        'http://localhost:8000/game/js/Player.js',
        'http://localhost:8000/game/js/World.js',
        'http://localhost:8000/game/js/GameLogic.js',
        'http://localhost:8000/game/js/main.js'
    ]
    
    results = {}
    
    for url in game_files:
        try:
            response = requests.get(url, timeout=5)
            results[url] = response.status_code == 200
            print(f"{'✅' if results[url] else '❌'} {url.split('/')[-1]}")
        except Exception as e:
            results[url] = False
            print(f"❌ {url.split('/')[-1]} - Error: {e}")
    
    return all(results.values())

def quick_visual_test():
    """Open game in browser for visual testing"""
    print("🎮 Opening RoboQuest game for visual testing...")
    print("=" * 50)
    
    # Test server first
    if not test_local_server():
        print("❌ Local server not running!")
        print("💡 Run: python3 -m http.server 8000")
        return False
    
    print("✅ Local server running")
    
    # Test game files
    if not test_game_files():
        print("❌ Some game files not accessible!")
        return False
    
    print("✅ All game files accessible")
    
    # Open browser
    game_url = 'http://localhost:8000/game/index.html'
    print(f"🌐 Opening browser: {game_url}")
    
    try:
        webbrowser.open(game_url)
        print("✅ Browser opened successfully")
        
        print("\n🧪 MANUAL TESTING CHECKLIST:")
        print("=" * 30)
        print("[ ] Game loads without errors")
        print("[ ] Robot character appears in 3D scene")  
        print("[ ] WASD/Arrow keys move the character")
        print("[ ] Space key makes character jump")
        print("[ ] Mouse click activates hover/jetpack")
        print("[ ] Colorful platforms and world visible")
        print("[ ] Coins and gems can be collected")
        print("[ ] Smooth camera following player")
        print("[ ] Mobile-friendly touch controls work")
        print("[ ] No console errors in browser DevTools")
        
        print("\n🔍 BROWSER CONSOLE MONITORING:")
        print("=" * 35)
        print("1. Open DevTools (F12)")
        print("2. Go to Console tab")  
        print("3. Look for these messages:")
        print("   ✅ '🎮 Game engine ready'")
        print("   ✅ '✅ RoboQuest initialized successfully!'")
        print("   ✅ '🤖 Use WASD/Arrow keys to move...'")
        print("   ❌ Any red error messages")
        
        print("\n⏱️ Test for 30 seconds, then close browser")
        print("📊 Report results below...")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to open browser: {e}")
        return False

def create_test_report():
    """Create a simple test report template"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report = f"""
# RoboQuest Game Test Report
Generated: {datetime.now().isoformat()}

## Test Environment
- URL: http://localhost:8000/game/index.html
- Browser: Chrome/Safari/Firefox
- Platform: Web (Desktop)

## Test Results

### ✅ Automated Checks
- [ ] Local server running
- [ ] Game files accessible
- [ ] Browser opens game successfully

### 🧪 Manual Testing
- [ ] Game loads without errors
- [ ] 3D scene renders correctly
- [ ] Character movement (WASD/Arrows)
- [ ] Jump mechanics (Space)
- [ ] Hover mechanics (Mouse click)
- [ ] Collectible system working
- [ ] Camera follows player smoothly
- [ ] Touch controls (mobile/tablet)
- [ ] Performance acceptable (>30 FPS)
- [ ] No console errors

### 📊 Performance
- FPS: ___
- Loading Time: ___ seconds
- Memory Usage: ___
- Mobile Performance: ___

### 🐛 Issues Found
- Issue 1: ___
- Issue 2: ___
- Issue 3: ___

### 💬 Console Messages
- Game initialization: ___
- Movement feedback: ___
- Collection feedback: ___
- Error messages: ___

### 📱 Mobile Testing
- Touch controls: ___
- Screen orientation: ___
- Performance on mobile: ___

### ✅ Overall Assessment
Game Quality: [ ] Excellent [ ] Good [ ] Needs Work [ ] Broken
Ready for Launch: [ ] Yes [ ] Needs Fixes [ ] Not Ready

### 📝 Notes
Additional observations:
___

"""
    
    with open(f'test-report-{timestamp}.md', 'w') as f:
        f.write(report)
    
    print(f"📋 Test report template created: test-report-{timestamp}.md")

if __name__ == "__main__":
    print("🤖 RoboQuest Game Testing Tool")
    print("=" * 35)
    
    # Run quick visual test
    success = quick_visual_test()
    
    if success:
        # Create test report template
        create_test_report()
        
        print("\n🎯 TESTING COMPLETE!")
        print("📋 Fill out the generated test report")
        print("🎮 Game should be running in your browser")
    else:
        print("\n❌ TESTING FAILED!")
        print("🔧 Check server and file setup")
    
    print("\n🚀 Next: Test the game and report results!")