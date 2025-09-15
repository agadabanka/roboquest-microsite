#!/usr/bin/env python3

"""
Correct Gemini Texture Generation using your provided code format
"""

from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import subprocess
from datetime import datetime

def get_gemini_api_key():
    """Get Gemini API key from .zshrc"""
    try:
        result = subprocess.run(['zsh', '-c', 'source ~/.zshrc && echo $GEMINI_API_KEY'], 
                              capture_output=True, text=True)
        api_key = result.stdout.strip()
        return api_key if api_key else None
    except:
        return None

def generate_tree_bark_texture():
    """Generate tree bark texture using correct API format"""
    print("🌳 Generating tree bark texture with Gemini 2.5 Flash Image...")
    
    # Get API key
    api_key = get_gemini_api_key()
    if not api_key:
        print("❌ No API key found")
        return None
    
    # Create client
    client = genai.Client(api_key=api_key)
    
    # Detailed bark texture prompt
    bark_prompt = """
    Create a seamless, tileable tree bark texture for a 3D video game.
    Style: Realistic brown bark with natural wood grain patterns.
    Details: Vertical ridges, horizontal bark lines, organic texture.
    Format: Square image, high resolution, seamless edges for UV mapping.
    Colors: Warm brown tones, good contrast for 3D game visibility.
    Aesthetic: Clean but detailed, suitable for Astro Bot-style platformer.
    """
    
    try:
        print("📡 Calling Gemini API...")
        
        response = client.models.generate_content(
            model="gemini-2.5-flash-image-preview",
            contents=[bark_prompt],
        )
        
        print("✅ Response received, processing...")
        
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                print(f"📝 Text response: {part.text}")
            elif part.inline_data is not None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"gemini_bark_texture_{timestamp}.png"
                
                image = Image.open(BytesIO(part.inline_data.data))
                image.save(filename)
                
                print(f"✅ Bark texture generated: {filename}")
                print(f"📏 Size: {image.size}")
                print(f"🎨 Mode: {image.mode}")
                
                return filename
        
        print("❌ No image data found in response")
        return None
        
    except Exception as e:
        print(f"❌ Bark texture generation failed: {e}")
        
        if "quota" in str(e).lower() or "429" in str(e):
            print("💳 Still hitting quota limits - billing may need activation")
        
        return None

def generate_tree_leaf_texture():
    """Generate tree leaf texture using correct API format"""
    print("🍃 Generating tree leaf texture with Gemini 2.5 Flash Image...")
    
    # Get API key
    api_key = get_gemini_api_key()
    if not api_key:
        print("❌ No API key found")
        return None
    
    # Create client
    client = genai.Client(api_key=api_key)
    
    # Detailed leaf texture prompt
    leaf_prompt = """
    Create a seamless, tileable leaf texture for a 3D video game tree canopy.
    Style: Vibrant green leaves with natural organic patterns.
    Details: Individual leaf shapes, natural variation, bright green colors.
    Format: Square image, high resolution, seamless for UV mapping.
    Colors: Rich green tones with variation, good visibility in 3D.
    Aesthetic: Organic and lush, suitable for Astro Bot-style platformer trees.
    """
    
    try:
        print("📡 Calling Gemini API for leaves...")
        
        response = client.models.generate_content(
            model="gemini-2.5-flash-image-preview",
            contents=[leaf_prompt],
        )
        
        print("✅ Response received, processing...")
        
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                print(f"📝 Text response: {part.text}")
            elif part.inline_data is not None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"gemini_leaf_texture_{timestamp}.png"
                
                image = Image.open(BytesIO(part.inline_data.data))
                image.save(filename)
                
                print(f"✅ Leaf texture generated: {filename}")
                print(f"📏 Size: {image.size}")
                print(f"🎨 Mode: {image.mode}")
                
                return filename
        
        print("❌ No image data found in response")
        return None
        
    except Exception as e:
        print(f"❌ Leaf texture generation failed: {e}")
        return None

if __name__ == "__main__":
    print("🤖 CORRECT GEMINI TEXTURE GENERATION TEST")
    print("🎯 Using gemini-2.5-flash-image-preview with your code format")
    print("💳 Testing with roboquestai billing setup")
    print("")
    
    generated_files = []
    
    # Generate bark texture
    bark_file = generate_tree_bark_texture()
    if bark_file:
        generated_files.append(bark_file)
    
    # Generate leaf texture
    leaf_file = generate_tree_leaf_texture()
    if leaf_file:
        generated_files.append(leaf_file)
    
    print(f"\n📊 GENERATION SUMMARY:")
    print(f"✅ Generated files: {len(generated_files)}")
    for file in generated_files:
        print(f"   📁 {file}")
    
    if generated_files:
        print(f"\n🎉 SUCCESS! Gemini texture generation working!")
        print(f"🎨 Generated professional textures for RoboQuest")
        print(f"🚀 Ready to integrate into game and test visual quality!")
    else:
        print(f"\n🔧 No textures generated - check billing setup")
        print(f"💡 Billing activation may take time to propagate")