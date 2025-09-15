/*
RoboQuest Game Testing Script
Automated testing with console monitoring using Puppeteer
*/

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class GameTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.gameUrl = 'http://localhost:8000/game/index.html';
    }
    
    async init() {
        console.log('🧪 Starting RoboQuest Game Testing...');
        
        this.browser = await puppeteer.launch({
            headless: false, // Show browser for visual testing
            args: ['--no-sandbox', '--disable-web-security']
        });
        
        this.page = await this.browser.newPage();
        
        // Set viewport for consistent testing
        await this.page.setViewport({ width: 1280, height: 720 });
        
        // Capture console logs
        this.page.on('console', msg => {
            const text = msg.text();
            console.log(`🎮 Game: ${text}`);
            
            // Store important logs
            if (text.includes('initialized') || text.includes('error') || text.includes('collected')) {
                this.testResults.push({
                    type: 'console',
                    message: text,
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Capture errors
        this.page.on('pageerror', error => {
            console.error(`❌ Game Error: ${error.message}`);
            this.testResults.push({
                type: 'error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        });
        
        console.log('✅ Test environment ready');
    }
    
    async runTests() {
        console.log('🚀 Loading game...');
        
        try {
            // Load the game
            await this.page.goto(this.gameUrl, { waitUntil: 'networkidle0' });
            
            console.log('⏱️  Waiting for game initialization...');
            
            // Wait for game to load
            await this.page.waitForFunction(() => {
                return window.gameLogic && window.gameEngine && window.gameEngine.isLoaded;
            }, { timeout: 10000 });
            
            console.log('✅ Game loaded successfully!');
            
            // Test basic functionality
            await this.testMovement();
            await this.testJumping();
            await this.testCollectibles();
            await this.testGameSystems();
            
            // Generate test report
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Test failed:', error.message);
            this.testResults.push({
                type: 'test_error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    async testMovement() {
        console.log('🧪 Testing player movement...');
        
        // Get initial position
        const initialPos = await this.page.evaluate(() => {
            return window.gameLogic.player.getPosition();
        });
        
        console.log('📍 Initial position:', initialPos);
        
        // Test WASD movement
        await this.page.keyboard.down('KeyD');
        await this.page.waitForTimeout(1000);
        await this.page.keyboard.up('KeyD');
        
        const newPos = await this.page.evaluate(() => {
            return window.gameLogic.player.getPosition();
        });
        
        const moved = Math.abs(newPos.x - initialPos.x) > 0.1;
        console.log(moved ? '✅ Movement working' : '❌ Movement failed');
        
        this.testResults.push({
            type: 'movement_test',
            passed: moved,
            initialPos,
            newPos,
            timestamp: new Date().toISOString()
        });
    }
    
    async testJumping() {
        console.log('🧪 Testing jump mechanics...');
        
        const initialY = await this.page.evaluate(() => {
            return window.gameLogic.player.getPosition().y;
        });
        
        // Jump test
        await this.page.keyboard.press('Space');
        await this.page.waitForTimeout(500);
        
        const jumpY = await this.page.evaluate(() => {
            return window.gameLogic.player.getPosition().y;
        });
        
        const jumped = jumpY > initialY + 1;
        console.log(jumped ? '✅ Jumping working' : '❌ Jumping failed');
        
        this.testResults.push({
            type: 'jump_test',
            passed: jumped,
            initialY,
            jumpY,
            timestamp: new Date().toISOString()
        });
    }
    
    async testCollectibles() {
        console.log('🧪 Testing collectible system...');
        
        const initialCoins = await this.page.evaluate(() => {
            return window.gameLogic.player.coins;
        });
        
        // Move player near a collectible and check if collection works
        await this.page.evaluate(() => {
            // Teleport player near first coin for testing
            if (window.gameLogic.worldManager.collectibles.length > 0) {
                const coinPos = window.gameLogic.worldManager.collectibles[0].mesh.position;
                window.gameLogic.player.physicsBody.position.set(coinPos.x, coinPos.y + 2, coinPos.z);
            }
        });
        
        await this.page.waitForTimeout(1000);
        
        const finalCoins = await this.page.evaluate(() => {
            return window.gameLogic.player.coins;
        });
        
        const collected = finalCoins > initialCoins;
        console.log(collected ? '✅ Collectibles working' : '⚠️ Collectibles need testing');
        
        this.testResults.push({
            type: 'collectible_test',
            passed: collected,
            initialCoins,
            finalCoins,
            timestamp: new Date().toISOString()
        });
    }
    
    async testGameSystems() {
        console.log('🧪 Testing game systems...');
        
        const gameInfo = await this.page.evaluate(() => {
            return {
                gameState: window.gameLogic.gameState,
                playerAlive: window.gameLogic.player.isAlive(),
                worldObjects: window.gameLogic.worldManager.getDebugInfo(),
                performance: window.gameLogic.getPerformanceStats()
            };
        });
        
        console.log('📊 Game Systems:', gameInfo);
        
        this.testResults.push({
            type: 'systems_test',
            gameInfo,
            timestamp: new Date().toISOString()
        });
    }
    
    generateReport() {
        const report = {
            testSuite: 'RoboQuest 3D Game',
            timestamp: new Date().toISOString(),
            url: this.gameUrl,
            results: this.testResults,
            summary: this.generateSummary()
        };
        
        // Save report
        const reportPath = path.join(__dirname, 'test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('\n📋 TEST REPORT:');
        console.log('================');
        console.log(`Total tests: ${this.testResults.length}`);
        console.log(`Passed: ${this.testResults.filter(r => r.passed !== false).length}`);
        console.log(`Failed: ${this.testResults.filter(r => r.passed === false).length}`);
        console.log(`Report saved: ${reportPath}`);
        
        // Print summary
        this.printSummary();
    }
    
    generateSummary() {
        const passed = this.testResults.filter(r => r.passed !== false).length;
        const total = this.testResults.filter(r => r.hasOwnProperty('passed')).length;
        
        return {
            testsPassed: passed,
            testsTotal: total,
            success: passed === total,
            errors: this.testResults.filter(r => r.type === 'error').length
        };
    }
    
    printSummary() {
        console.log('\n🎯 GAME TEST SUMMARY:');
        console.log('====================');
        
        this.testResults.forEach(result => {
            const icon = result.passed === true ? '✅' : result.passed === false ? '❌' : 'ℹ️';
            console.log(`${icon} ${result.type}: ${result.message || 'Completed'}`);
        });
        
        const summary = this.generateSummary();
        console.log(`\n🏆 Overall: ${summary.success ? 'PASSED' : 'NEEDS FIXES'}`);
    }
    
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        console.log('🧹 Test cleanup complete');
    }
}

// Test runner
async function runGameTests() {
    const tester = new GameTester();
    
    try {
        await tester.init();
        await tester.runTests();
    } catch (error) {
        console.error('❌ Testing failed:', error);
    } finally {
        await tester.cleanup();
    }
}

// Export for use
module.exports = { GameTester, runGameTests };

// Run tests if called directly
if (require.main === module) {
    runGameTests();
}