#!/usr/bin/env python3

"""
Gemini Texture Generation for RoboQuest
Generate professional game textures using gemini-2.5-flash-image-preview
"""

import google.generativeai as genai
import subprocess
import os
from datetime import datetime
from PIL import Image
from io import BytesIO

def get_gemini_api_key():
    """Get Gemini API key from .zshrc"""
    try:
        result = subprocess.run(['zsh', '-c', 'source ~/.zshrc && echo $GEMINI_API_KEY'], 
                              capture_output=True, text=True)
        api_key = result.stdout.strip()
        
        if api_key and api_key != '':
            print("✅ Gemini API key loaded from .zshrc")
            return api_key
        else:
            print("❌ Gemini API key not found in .zshrc")
            return None
    except Exception as e:
        print(f"❌ Failed to get Gemini API key: {e}")
        return None

def generate_tree_bark_texture():
    """Generate realistic tree bark texture using gemini-2.5-flash-image-preview"""
    
    print("🌳 Generating tree bark texture with Gemini 2.5 Flash...")
    
    # Detailed prompt for tree bark texture
    bark_prompt = """
    Create a seamless, tileable tree bark texture for a 3D video game. 
    Style: Realistic but stylized, similar to Astro Bot aesthetic.
    Requirements:
    - Brown bark with natural wood grain patterns
    - Vertical ridges and horizontal bark lines
    - Suitable for UV mapping on cylindrical tree trunks
    - High contrast for good visibility in 3D games
    - Seamless edges for perfect tiling
    - Rich detail but clean, not too noisy
    - Warm brown tones with some variation
    - Organic, natural bark appearance
    - Square format, high resolution
    """
    
    try:
        # Use new Gemini 2.5 Flash image generation API
        model = genai.GenerativeModel("gemini-2.5-flash-image-preview")
        
        response = model.generate_content([bark_prompt])
        
        # Extract image data from response
        image_parts = [
            part.inline_data.data
            for part in response.candidates[0].content.parts
            if part.inline_data
        ]
        
        if image_parts:
            # Save the generated image
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"generated_bark_texture_{timestamp}.png"
            
            image = Image.open(BytesIO(image_parts[0]))
            image.save(filename)
            print(f"✅ Tree bark texture generated: {filename}")
            
            return filename
        else:
            print("❌ No image data in response")
            return None
            
    except Exception as e:
        print(f"❌ Bark texture generation failed: {e}")
        return None

def generate_tree_leaf_texture():
    """Generate realistic tree leaf texture for RoboQuest"""
    
    print("🍃 Generating tree leaf texture with Gemini...")
    
    # Detailed prompt for leaf texture
    leaf_prompt = """
    Generate a seamless, tileable leaf texture for a 3D video game tree canopy.
    Style: Vibrant and organic, similar to Astro Bot aesthetic.
    Requirements:
    - Bright green leaves with natural variation
    - Individual leaf shapes visible but forming a cohesive pattern
    - Suitable for spherical tree canopies in 3D
    - Good contrast and visibility
    - Seamless edges for UV mapping
    - Rich green colors (not too dark)
    - Organic, natural leaf patterns
    - Some transparency areas for realistic foliage
    """
    
    try:
        # Use new Gemini 2.5 Flash image generation API
        model = genai.GenerativeModel("gemini-2.5-flash-image-preview")
        
        response = model.generate_content([leaf_prompt])
        
        # Extract image data from response
        image_parts = [
            part.inline_data.data
            for part in response.candidates[0].content.parts
            if part.inline_data
        ]
        
        if image_parts:
            # Save the generated image
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"generated_leaf_texture_{timestamp}.png"
            
            image = Image.open(BytesIO(image_parts[0]))
            image.save(filename)
            print(f"✅ Tree leaf texture generated: {filename}")
            
            return filename
        else:
            print("❌ No image data in response")
            return None
            
    except Exception as e:
        print(f"❌ Leaf texture generation failed: {e}")
        return None

def test_gemini_setup():
    """Test basic Gemini connection and list available models"""
    print("🧪 Testing Gemini API connection...")
    
    try:
        # First, list available models
        print("📋 Checking available models...")
        models = genai.list_models()
        
        available_models = []
        for model in models:
            available_models.append(model.name)
            print(f"   📱 {model.name}")
        
        # Find a suitable text generation model
        text_models = [m for m in available_models if 'gemini' in m and 'pro' in m and 'embedding' not in m]
        
        if text_models:
            model_name = text_models[0].split('/')[-1]  # Get model name without prefix
            print(f"🧪 Testing with model: {model_name}")
            
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Say 'Gemini API working!' if you can respond")
            
            print(f"✅ Gemini connection test: {response.text}")
            return True, available_models
        else:
            print("❌ No models available")
            return False, []
        
    except Exception as e:
        print(f"❌ Gemini connection failed: {e}")
        return False, []

def generate_roboquest_textures():
    """Main function to generate all RoboQuest textures"""
    print("🎨 RoboQuest Texture Generation with Gemini")
    print("=" * 50)
    print("🎯 Goal: Generate professional tree textures for Astro Bot-style game")
    print("🤖 Using: Gemini Imagen 3.0 for texture generation")
    
    # Get API key
    api_key = get_gemini_api_key()
    if not api_key:
        print("❌ Cannot proceed without Gemini API key")
        return False
    
    # Configure Gemini
    genai.configure(api_key=api_key)
    print("🔧 Gemini API configured")
    
    # Test connection and get available models
    connection_success, available_models = test_gemini_setup()
    if not connection_success:
        print("❌ Gemini connection test failed")
        return False
    
    print(f"✅ Gemini connected! Available models: {len(available_models)}")
    
    # Generate textures
    print("\n🎨 Starting texture generation...")
    
    generated_files = []
    
    # Generate bark texture
    bark_file = generate_tree_bark_texture()
    if bark_file:
        generated_files.append(bark_file)
    
    # Generate leaf texture  
    leaf_file = generate_tree_leaf_texture()
    if leaf_file:
        generated_files.append(leaf_file)
    
    # Summary
    print(f"\n📊 TEXTURE GENERATION SUMMARY:")
    print(f"✅ Generated textures: {len(generated_files)}")
    for file in generated_files:
        print(f"   📁 {file}")
    
    if generated_files:
        print(f"\n🎯 NEXT STEPS:")
        print(f"1. Review generated textures visually")
        print(f"2. Compare with Astro Bot reference quality")
        print(f"3. Integrate best textures into game/textures/")
        print(f"4. Update World.js to use generated textures")
        print(f"5. Test with screenshot validation methodology")
        
        return True
    else:
        print(f"\n❌ No textures generated successfully")
        return False

if __name__ == "__main__":
    print("🤖 GEMINI TEXTURE GENERATION FOR ROBOQUEST")
    print("🎯 Creating professional tree textures for Astro Bot-style aesthetics")
    print("📱 Using Imagen 3.0 for high-quality texture generation")
    print("")
    
    success = generate_roboquest_textures()
    
    if success:
        print(f"\n🎉 TEXTURE GENERATION SUCCESS!")
        print(f"🎨 Generated professional textures ready for game integration")
        print(f"🚀 Ready to enhance RoboQuest visual quality!")
    else:
        print(f"\n❌ TEXTURE GENERATION FAILED!")
        print(f"🔧 Check API key and connection issues")