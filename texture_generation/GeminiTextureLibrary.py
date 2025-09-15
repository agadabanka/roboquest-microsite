#!/usr/bin/env python3

"""
Gemini Texture Generation Library
Reusable AI texture generation system for game development
"""

from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import subprocess
import os
from datetime import datetime

class GeminiTextureGenerator:
    """Reusable Gemini AI texture generation library"""
    
    def __init__(self):
        self.client = None
        self.api_key = None
        self.model_name = "gemini-2.5-flash-image-preview"
        self.output_dir = "generated_textures"
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        self.initialize()
    
    def initialize(self):
        """Initialize Gemini API client"""
        print("🤖 Initializing Gemini Texture Generator...")
        
        # Get API key
        self.api_key = self._get_api_key()
        if not self.api_key:
            raise Exception("❌ Gemini API key not found in .zshrc")
        
        # Create client
        self.client = genai.Client(api_key=self.api_key)
        print("✅ Gemini client initialized")
    
    def _get_api_key(self):
        """Get Gemini API key from environment"""
        try:
            result = subprocess.run(['zsh', '-c', 'source ~/.zshrc && echo $GEMINI_API_KEY'], 
                                  capture_output=True, text=True)
            api_key = result.stdout.strip()
            return api_key if api_key else None
        except:
            return None
    
    def generate_texture(self, prompt, texture_name, style_notes=""):
        """Generate a single texture with given prompt"""
        print(f"🎨 Generating {texture_name} texture...")
        
        # Enhanced prompt with game-specific requirements
        full_prompt = f"""
        {prompt}
        
        GAME REQUIREMENTS:
        - Seamless, tileable texture for 3D video games
        - High resolution, square format (1024x1024 preferred)
        - Good contrast and visibility in 3D environments
        - Suitable for UV mapping on 3D objects
        - Realistic but stylized (Astro Bot aesthetic)
        {style_notes}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[full_prompt],
            )
            
            # Extract image data
            for part in response.candidates[0].content.parts:
                if part.text is not None:
                    print(f"📝 AI Response: {part.text[:100]}...")
                elif part.inline_data is not None:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"{self.output_dir}/{texture_name}_{timestamp}.png"
                    
                    image = Image.open(BytesIO(part.inline_data.data))
                    image.save(filename)
                    
                    print(f"✅ {texture_name} generated: {filename}")
                    print(f"📏 Size: {image.size}, Mode: {image.mode}")
                    
                    return filename
            
            print(f"❌ No image generated for {texture_name}")
            return None
            
        except Exception as e:
            print(f"❌ {texture_name} generation failed: {e}")
            return None
    
    def generate_bark_variations(self, count=3):
        """Generate multiple bark texture variations"""
        print(f"🌳 Generating {count} bark texture variations...")
        
        bark_prompts = [
            "Create a detailed tree bark texture with deep vertical grooves and natural wood grain, rich brown colors",
            "Generate a smooth birch-like bark texture with horizontal lines and lighter brown tones",
            "Make a rough oak bark texture with deep ridges, dark brown color with weathered appearance"
        ]
        
        generated_files = []
        
        for i, prompt in enumerate(bark_prompts[:count]):
            texture_name = f"bark_variation_{i+1}"
            filename = self.generate_texture(prompt, texture_name, 
                "- Warm brown tones varying from light to dark\n- Natural wood patterns")
            
            if filename:
                generated_files.append(filename)
        
        return generated_files
    
    def generate_leaf_variations(self, count=4):
        """Generate multiple leaf texture variations for diverse foliage"""
        print(f"🍃 Generating {count} leaf texture variations...")
        
        leaf_prompts = [
            "Create a dense green leaf texture with small round leaves, bright vibrant green",
            "Generate a tropical foliage texture with larger leaves, varied green tones and natural gaps",
            "Make a delicate leaf pattern with fine detailed leaves, light to medium green gradient",
            "Create an autumn-touched foliage with green leaves and hints of yellow-green variation"
        ]
        
        generated_files = []
        
        for i, prompt in enumerate(leaf_prompts[:count]):
            texture_name = f"leaves_variation_{i+1}"
            filename = self.generate_texture(prompt, texture_name,
                "- Rich green colors with natural variation\n- Organic leaf patterns\n- Some transparency for realistic foliage")
            
            if filename:
                generated_files.append(filename)
        
        return generated_files
    
    def generate_platform_textures(self, count=3):
        """Generate platform texture variations"""
        print(f"🏗️ Generating {count} platform texture variations...")
        
        platform_prompts = [
            "Create a futuristic metal platform texture with panel lines and subtle sci-fi details",
            "Generate a stone brick platform texture with weathered edges and natural stone patterns", 
            "Make a crystal platform texture with glowing edges and translucent crystal formations"
        ]
        
        generated_files = []
        
        for i, prompt in enumerate(platform_prompts[:count]):
            texture_name = f"platform_variation_{i+1}"
            filename = self.generate_texture(prompt, texture_name,
                "- Suitable for colorful tinting (cyan, orange, pink)\n- Clean geometric patterns\n- Good for platformer game aesthetics")
            
            if filename:
                generated_files.append(filename)
        
        return generated_files
    
    def generate_character_textures(self):
        """Generate robot character texture variations"""
        print("🤖 Generating robot character textures...")
        
        character_prompts = [
            "Create a clean white robot chassis texture with subtle panel lines and sci-fi details",
            "Generate a metallic robot texture with chrome-like reflective surface and smooth panels",
            "Make a cute robot texture with soft matte finish and friendly rounded panel details"
        ]
        
        generated_files = []
        
        for i, prompt in enumerate(character_prompts):
            texture_name = f"robot_texture_{i+1}"
            filename = self.generate_texture(prompt, texture_name,
                "- Clean, friendly appearance\n- Suitable for cute robot character\n- Good lighting response")
            
            if filename:
                generated_files.append(filename)
        
        return generated_files
    
    def generate_complete_texture_set(self):
        """Generate a complete set of game textures"""
        print("🎨 GENERATING COMPLETE ROBOQUEST TEXTURE SET")
        print("=" * 50)
        
        all_generated = {
            'bark_variations': [],
            'leaf_variations': [],
            'platform_variations': [],
            'character_textures': []
        }
        
        # Generate all texture types
        all_generated['bark_variations'] = self.generate_bark_variations(3)
        all_generated['leaf_variations'] = self.generate_leaf_variations(4)
        all_generated['platform_variations'] = self.generate_platform_textures(3)
        all_generated['character_textures'] = self.generate_character_textures()
        
        # Summary
        total_generated = sum(len(textures) for textures in all_generated.values())
        
        print(f"\n📊 TEXTURE GENERATION SUMMARY:")
        print(f"🌳 Bark variations: {len(all_generated['bark_variations'])}")
        print(f"🍃 Leaf variations: {len(all_generated['leaf_variations'])}")
        print(f"🏗️ Platform variations: {len(all_generated['platform_variations'])}")
        print(f"🤖 Character textures: {len(all_generated['character_textures'])}")
        print(f"📁 Total generated: {total_generated} textures")
        
        return all_generated

# Convenience functions for easy use
def quick_bark_texture():
    """Quick bark texture generation"""
    generator = GeminiTextureGenerator()
    return generator.generate_texture(
        "Create a realistic tree bark texture with vertical wood grain",
        "quick_bark"
    )

def quick_leaf_texture():
    """Quick leaf texture generation"""
    generator = GeminiTextureGenerator()
    return generator.generate_texture(
        "Create a vibrant green leaf texture with natural foliage patterns",
        "quick_leaves"
    )

def generate_game_texture_set():
    """Generate complete texture set for game"""
    generator = GeminiTextureGenerator()
    return generator.generate_complete_texture_set()

# Example usage
if __name__ == "__main__":
    print("🤖 GEMINI TEXTURE GENERATION LIBRARY")
    print("🎯 Reusable AI texture generation for game development")
    print("")
    
    try:
        # Quick test
        generator = GeminiTextureGenerator()
        
        # Generate a test texture
        test_file = generator.generate_texture(
            "Create a beautiful tree bark texture with natural wood patterns",
            "library_test",
            "- Perfect for 3D game trees\n- Seamless tiling required"
        )
        
        if test_file:
            print(f"\n🎉 LIBRARY TEST SUCCESS!")
            print(f"📁 Generated: {test_file}")
            print(f"🚀 Library ready for professional texture generation!")
        else:
            print(f"\n❌ Library test failed")
        
    except Exception as e:
        print(f"❌ Library initialization failed: {e}")
        print(f"💡 Check API key and billing setup")