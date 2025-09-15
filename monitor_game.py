#!/usr/bin/env python3

"""
RoboQuest Game Monitor
Real-time monitoring of game console output via browser automation
"""

import subprocess
import time
import json
from datetime import datetime

def monitor_game_console():
    """Monitor game console output using browser inspector"""
    print("🔍 RoboQuest Game Console Monitor")
    print("=" * 40)
    
    print("🌐 Game should be running at: http://localhost:8000/game/")
    print("📋 Monitoring browser console for game events...")
    print("=" * 40)
    
    # JavaScript snippet to inject into browser console for monitoring
    monitor_script = """
// RoboQuest Console Monitor
console.log('🔍 Console monitor activated');

// Store original console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

// Monitor array
window.gameMonitor = {
    logs: [],
    startTime: Date.now(),
    addLog: function(type, message) {
        const entry = {
            type: type,
            message: message,
            timestamp: Date.now() - this.startTime,
            time: new Date().toISOString()
        };
        this.logs.push(entry);
        
        // Keep only last 100 logs
        if (this.logs.length > 100) {
            this.logs.shift();
        }
    }
};

// Override console methods
console.log = function(...args) {
    const message = args.join(' ');
    window.gameMonitor.addLog('log', message);
    originalLog.apply(console, args);
};

console.error = function(...args) {
    const message = args.join(' ');
    window.gameMonitor.addLog('error', message);
    originalError.apply(console, args);
};

console.warn = function(...args) {
    const message = args.join(' ');
    window.gameMonitor.addLog('warn', message);
    originalWarn.apply(console, args);
};

// Game-specific monitoring
if (window.gameLogic) {
    const originalCollectCoin = window.gameLogic.player.collectCoin;
    window.gameLogic.player.collectCoin = function() {
        originalCollectCoin.call(this);
        console.log(`🪙 Coin collected! Total: ${this.coins}`);
    };
}

console.log('✅ Game monitoring active - check window.gameMonitor.logs for history');
"""
    
    print("📋 COPY THIS SCRIPT TO BROWSER CONSOLE:")
    print("-" * 40)
    print(monitor_script)
    print("-" * 40)
    
    print("\n📝 INSTRUCTIONS:")
    print("1. Open game at http://localhost:8000/game/")
    print("2. Open DevTools (F12) → Console tab")
    print("3. Paste the script above and press Enter")
    print("4. Play the game for testing")
    print("5. Run: window.gameMonitor.logs to see captured events")
    print("6. Run: JSON.stringify(window.gameMonitor.logs, null, 2) for formatted output")
    
    print("\n🎮 EXPECTED CONSOLE OUTPUT:")
    print("✅ '🎮 Game engine ready'")
    print("✅ '🤖 Welcome to RoboQuest!'") 
    print("✅ '✅ RoboQuest initialized successfully!'")
    print("✅ Movement and jump feedback")
    print("✅ '🪙 Coin collected!' when collecting items")
    print("❌ Any red error messages (should be none)")

def create_monitoring_bookmarklet():
    """Create a bookmarklet for easy console monitoring"""
    
    # Minified monitoring script
    bookmarklet = """javascript:(function(){
        if(window.gameMonitor) return console.log('Monitor already active');
        window.gameMonitor={logs:[],startTime:Date.now(),addLog:function(t,m){this.logs.push({type:t,message:m,timestamp:Date.now()-this.startTime,time:new Date().toISOString()});if(this.logs.length>100)this.logs.shift()}};
        const ol=console.log,oe=console.error,ow=console.warn;
        console.log=function(...a){const m=a.join(' ');window.gameMonitor.addLog('log',m);ol.apply(console,a)};
        console.error=function(...a){const m=a.join(' ');window.gameMonitor.addLog('error',m);oe.apply(console,a)};
        console.warn=function(...a){const m=a.join(' ');window.gameMonitor.addLog('warn',m);ow.apply(console,a)};
        console.log('✅ RoboQuest monitor active - check window.gameMonitor.logs');
    })();"""
    
    print("\n🔖 BOOKMARKLET FOR EASY MONITORING:")
    print("=" * 40)
    print("1. Copy this entire line:")
    print(bookmarklet)
    print("\n2. Create new bookmark in browser")
    print("3. Paste as URL/location")
    print("4. Click bookmark when on game page to activate monitoring")
    
    # Save to file for easy access
    with open('game-monitor-bookmarklet.txt', 'w') as f:
        f.write(bookmarklet)
    
    print("💾 Bookmarklet saved to: game-monitor-bookmarklet.txt")

def show_live_testing_guide():
    """Show complete testing guide"""
    print("\n📋 COMPLETE TESTING WORKFLOW:")
    print("=" * 35)
    print("1. 🌐 Game opens automatically in browser")
    print("2. 🔧 Open DevTools (F12) → Console")
    print("3. 📝 Paste monitoring script OR use bookmarklet")
    print("4. 🎮 Test game controls:")
    print("   - WASD/Arrow keys for movement")
    print("   - Space for jumping")
    print("   - Mouse click for hover")
    print("5. 🪙 Try to collect coins and gems")
    print("6. 📊 Check window.gameMonitor.logs for captured events")
    print("7. ✅ Verify no red errors in console")
    
    print("\n🎯 SUCCESS CRITERIA:")
    print("- Game loads without errors")
    print("- All controls work smoothly")
    print("- 3D graphics render properly")
    print("- Collectibles can be gathered")
    print("- Performance >30 FPS")

if __name__ == "__main__":
    print("🎮 RoboQuest Game Testing & Monitoring")
    print("=" * 45)
    
    # Run visual test
    if quick_visual_test():
        create_monitoring_bookmarklet()
        show_live_testing_guide()
        print("\n🚀 Game monitoring tools ready!")
    else:
        print("\n❌ Setup failed - check server and files")