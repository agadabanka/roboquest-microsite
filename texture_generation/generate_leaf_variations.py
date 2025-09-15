#!/usr/bin/env python3

"""
Generate multiple leaf texture variations for better trees
"""

from GeminiTextureLibrary import GeminiTextureGenerator

def generate_foliage_set():
    """Generate diverse foliage textures for varied tree appearance"""
    print("🍃 GENERATING DIVERSE FOLIAGE TEXTURE SET")
    print("=" * 45)
    
    generator = GeminiTextureGenerator()
    
    # Generate 4 different leaf variations
    leaf_files = generator.generate_leaf_variations(4)
    
    print(f"\n📊 FOLIAGE GENERATION RESULTS:")
    print(f"✅ Generated leaf variations: {len(leaf_files)}")
    
    for i, file in enumerate(leaf_files):
        if file:
            print(f"   🍃 Variation {i+1}: {file}")
    
    return leaf_files

if __name__ == "__main__":
    leaf_variations = generate_foliage_set()
    
    if leaf_variations:
        print(f"\n🎉 SUCCESS! Generated {len(leaf_variations)} leaf texture variations")
        print(f"🌳 Ready for multi-sphere tree implementation")
        print(f"🎨 Each tree can now have unique foliage appearance")
    else:
        print(f"\n❌ Foliage generation failed")
        print(f"🔧 Check API connection and billing")