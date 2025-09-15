#!/usr/bin/env python3

"""
Test Gemini Billing Setup and Image Generation
Quick test to verify billing and generate a simple texture
"""

import google.generativeai as genai
import subprocess
from datetime import datetime
from PIL import Image
from io import BytesIO
import base64

def get_gemini_api_key():
    """Get Gemini API key from .zshrc"""
    try:
        result = subprocess.run(['zsh', '-c', 'source ~/.zshrc && echo $GEMINI_API_KEY'], 
                              capture_output=True, text=True)
        api_key = result.stdout.strip()
        return api_key if api_key else None
    except:
        return None

def test_image_generation():
    """Test image generation with gemini-2.5-flash-image-preview"""
    print("🧪 Testing Gemini Image Generation")
    print("=" * 40)
    
    # Get API key
    api_key = get_gemini_api_key()
    if not api_key:
        print("❌ No API key found")
        return False
    
    # Configure Gemini
    genai.configure(api_key=api_key)
    print("✅ API key configured")
    
    try:
        # Test simple image generation first
        print("🎨 Testing simple image generation...")
        
        model = genai.GenerativeModel("gemini-2.5-flash-image-preview")
        
        # Simple test prompt
        test_prompt = "Generate a simple brown tree bark texture for a video game, seamless and tileable"
        
        print(f"📝 Prompt: {test_prompt}")
        
        response = model.generate_content([test_prompt])
        
        print("📡 Response received, checking for image data...")
        
        # Extract image data
        image_parts = []
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    image_parts.append(part.inline_data.data)
        
        print(f"🖼️ Found {len(image_parts)} image parts")
        
        if image_parts:
            # Save the first image
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"test_bark_texture_{timestamp}.png"
            
            # Decode base64 image data
            image_data = base64.b64decode(image_parts[0])
            image = Image.open(BytesIO(image_data))
            image.save(filename)
            
            print(f"✅ Test texture generated: {filename}")
            print(f"📏 Size: {image.size}")
            print(f"🎨 Mode: {image.mode}")
            
            return True, filename
        else:
            print("❌ No image data found in response")
            if response.candidates:
                print("📋 Response content:", response.candidates[0].content)
            return False, None
    
    except Exception as e:
        print(f"❌ Image generation failed: {e}")
        
        # Check if it's a billing issue
        if "quota" in str(e).lower() or "429" in str(e):
            print("💳 BILLING ISSUE DETECTED:")
            print("   - Still hitting free tier quotas")
            print("   - Billing may not be properly enabled for this project")
            print("   - Check Google AI Studio → Settings → Plan Information")
        
        return False, None

def check_billing_status():
    """Check if billing is properly enabled"""
    print("\n💳 Checking billing status...")
    
    try:
        # Try to list projects with gcloud
        result = subprocess.run(['gcloud', 'projects', 'list'], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ gcloud authentication working")
            
            # Look for roboquestai project
            if 'roboquestai' in result.stdout:
                print("✅ roboquestai project found")
            else:
                print("⚠️ roboquestai project not visible")
            
            print("📋 Available projects:")
            for line in result.stdout.split('\n')[:5]:  # Show first 5 lines
                if line.strip():
                    print(f"   {line}")
        else:
            print("❌ gcloud authentication needed")
            print("💡 Run: gcloud auth login")
    
    except Exception as e:
        print(f"⚠️ gcloud check failed: {e}")

if __name__ == "__main__":
    print("🤖 GEMINI BILLING & IMAGE GENERATION TEST")
    print("🎯 Testing gemini-2.5-flash-image-preview with billing")
    print("💳 Validating roboquestai project billing setup")
    print("")
    
    # Check billing first
    check_billing_status()
    
    # Test image generation
    success, filename = test_image_generation()
    
    if success:
        print(f"\n🎉 SUCCESS! Image generation working!")
        print(f"📁 Generated: {filename}")
        print(f"🚀 Ready for professional texture generation!")
    else:
        print(f"\n🔧 BILLING SETUP NEEDED:")
        print(f"1. Open Google AI Studio: https://aistudio.google.com")
        print(f"2. Go to Settings → Plan Information")
        print(f"3. Set up billing for roboquestai project") 
        print(f"4. Upgrade to pay-as-you-go tier")
        print(f"5. Retry texture generation")