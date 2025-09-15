#!/usr/bin/env python3

"""
Replace createTree method and add more trees to world
"""

import re

def replace_tree_method():
    """Replace the createTree method with improved version"""
    
    # Read the current World.js file
    with open('game/js/World.js', 'r') as f:
        content = f.read()
    
    # Find and replace the createTree method (lines 319-433)
    improved_tree_method = '''    createTree(x, y, z) {
        console.log('🌳 Creating believable tree: trunk + branches + canopies...');
        const treeGroup = new THREE.Group();
        const textureLoader = new THREE.TextureLoader();
        
        // AI-Generated bark texture for all tree parts
        const barkTexture = textureLoader.load(
            './textures/gemini_bark.png',
            () => console.log('✅ AI bark texture loaded for tree'),
            undefined,
            () => console.warn('⚠️ Using brown fallback for bark')
        );
        barkTexture.wrapS = THREE.RepeatWrapping;
        barkTexture.wrapT = THREE.RepeatWrapping;
        barkTexture.repeat.set(1, 2);
        
        const barkMaterial = new THREE.MeshLambertMaterial({ 
            map: barkTexture,
            color: 0x8B4513 
        });
        
        // MAIN TRUNK (properly grounded)
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 4, 8);
        const trunkMesh = new THREE.Mesh(trunkGeometry, barkMaterial);
        trunkMesh.position.set(0, 2, 0); // Base at y=0 when tree at ground level
        trunkMesh.castShadow = true;
        treeGroup.add(trunkMesh);
        
        // BRANCH 1 (extends from trunk)
        const branch1Geometry = new THREE.CylinderGeometry(0.2, 0.35, 2.5, 6);
        const branch1Mesh = new THREE.Mesh(branch1Geometry, barkMaterial);
        branch1Mesh.position.set(-1.5, 3.5, 0.8);
        branch1Mesh.rotation.z = Math.PI / 5; // Realistic branch angle
        branch1Mesh.castShadow = true;
        treeGroup.add(branch1Mesh);
        
        // BRANCH 2 (other side for balance)
        const branch2Geometry = new THREE.CylinderGeometry(0.15, 0.28, 2, 6);
        const branch2Mesh = new THREE.Mesh(branch2Geometry, barkMaterial);
        branch2Mesh.position.set(1.2, 4, -0.6);
        branch2Mesh.rotation.z = -Math.PI / 6; // Angled the other way
        branch2Mesh.castShadow = true;
        treeGroup.add(branch2Mesh);
        
        // SINGLE LEAF TEXTURE (small tiled - the good one)
        const leafTexture = textureLoader.load(
            './textures/leaves_variation_1_20250915_124330.png',
            () => console.log('✅ Small tiled leaf texture loaded'),
            undefined,
            () => {
                console.warn('⚠️ Using green fallback for leaves');
            }
        );
        leafTexture.wrapS = THREE.RepeatWrapping;
        leafTexture.wrapT = THREE.RepeatWrapping;
        leafTexture.repeat.set(4, 4); // More tiling for detail
        
        const leafMaterial = new THREE.MeshLambertMaterial({ 
            map: leafTexture,
            color: 0x32CD32,
            emissive: 0x0a1f0a
        });
        
        // MAIN CANOPY (on trunk)
        const mainCanopy = new THREE.SphereGeometry(2.4, 12, 8);
        const mainCanopyMesh = new THREE.Mesh(mainCanopy, leafMaterial);
        mainCanopyMesh.position.set(0, 5.8, 0);
        mainCanopyMesh.castShadow = true;
        mainCanopyMesh.receiveShadow = true;
        treeGroup.add(mainCanopyMesh);
        
        // BRANCH 1 CANOPY (smaller, at end of branch)
        const branch1Canopy = new THREE.SphereGeometry(1.3, 10, 6);
        const branch1CanopyMesh = new THREE.Mesh(branch1Canopy, leafMaterial);
        branch1CanopyMesh.position.set(-2.3, 4.5, 1.2);
        branch1CanopyMesh.castShadow = true;
        branch1CanopyMesh.receiveShadow = true;
        treeGroup.add(branch1CanopyMesh);
        
        // BRANCH 2 CANOPY (smallest, at end of second branch)
        const branch2Canopy = new THREE.SphereGeometry(1.1, 8, 6);
        const branch2CanopyMesh = new THREE.Mesh(branch2Canopy, leafMaterial);
        branch2CanopyMesh.position.set(1.8, 4.8, -0.9);
        branch2CanopyMesh.castShadow = true;
        branch2CanopyMesh.receiveShadow = true;
        treeGroup.add(branch2CanopyMesh);
        
        // Position entire tree on ground
        treeGroup.position.set(x, 0, z); // Grounded properly
        this.scene.add(treeGroup);
        this.decorations.push(treeGroup);
        
        console.log('✅ Believable tree created: 1 trunk + 2 branches + 3 canopies with consistent AI leaf texture');
    }'''
    
    # Pattern to match the entire createTree method
    pattern = r'    createTree\(x, y, z\) \{.*?\n    \}'
    
    # Replace with improved version
    new_content = re.sub(pattern, improved_tree_method, content, flags=re.DOTALL)
    
    # Also add more tree positions
    additional_trees_pattern = r'(decorationPositions\.forEach\(pos => \{\s*this\.createTree\(\.\.\.pos\);\s*\}\);)'
    
    additional_trees = '''decorationPositions.forEach(pos => {
            this.createTree(...pos);
        });
        
        // Add more trees for richer forest environment
        const extraTreePositions = [
            [35, 2, 20], [55, 3, -25], [-35, 2, 18], 
            [-25, 4, -22], [50, 5, 30], [-40, 3, -30],
            [60, 2, 15], [-50, 4, 25], [40, 3, -35],
            [25, 2, 35], [-30, 3, 30], [65, 4, -15]
        ];
        
        extraTreePositions.forEach(pos => {
            this.createTree(...pos);
        });
        
        console.log('🌳 Created additional trees for richer forest environment');'''
    
    new_content = re.sub(additional_trees_pattern, additional_trees, new_content)
    
    # Write the updated file
    with open('game/js/World.js', 'w') as f:
        f.write(new_content)
    
    print("✅ Improved tree method implemented")
    print("✅ Additional trees added for richer environment")
    print("🌳 Features: trunk + 2 branches + 3 canopies per tree")
    print("🍃 Single consistent AI leaf texture (small tiled)")
    print("🎨 AI bark texture on all tree parts")

if __name__ == "__main__":
    replace_tree_method()
    print("\n🚀 Ready to test improved trees with screenshot validation!")