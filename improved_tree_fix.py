#!/usr/bin/env python3

"""
Quick fix for tree issues: grounding and branch structure
"""

def fix_tree_issues():
    """Create improved tree code with proper grounding and branches"""
    
    improved_tree_code = '''
    createTree(x, y, z) {
        console.log('🌳 Creating improved grounded tree with branches...');
        const treeGroup = new THREE.Group();
        const textureLoader = new THREE.TextureLoader();
        
        // AI-Generated bark texture (reuse first AI texture - it was perfect)
        const trunkTexture = textureLoader.load(
            './textures/gemini_bark.png',
            () => console.log('✅ AI bark texture loaded'),
            undefined,
            () => console.warn('⚠️ AI bark texture failed, using brown')
        );
        trunkTexture.wrapS = THREE.RepeatWrapping;
        trunkTexture.wrapT = THREE.RepeatWrapping;
        trunkTexture.repeat.set(1, 2);
        
        // Main trunk (grounded properly)
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 4, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            map: trunkTexture,
            color: 0x8B4513 
        });
        const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunkMesh.position.set(0, 2, 0); // Positioned so base touches ground (y=0)
        trunkMesh.castShadow = true;
        treeGroup.add(trunkMesh);
        
        // Branch 1 (extends from trunk)
        const branch1Geometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
        const branch1Mesh = new THREE.Mesh(branch1Geometry, trunkMaterial);
        branch1Mesh.position.set(-1.2, 3.5, 0.5);
        branch1Mesh.rotation.z = Math.PI / 6; // Angle the branch
        branch1Mesh.castShadow = true;
        treeGroup.add(branch1Mesh);
        
        // Branch 2 (other side)
        const branch2Geometry = new THREE.CylinderGeometry(0.15, 0.25, 1.5, 6);
        const branch2Mesh = new THREE.Mesh(branch2Geometry, trunkMaterial);
        branch2Mesh.position.set(1, 3.8, -0.3);
        branch2Mesh.rotation.z = -Math.PI / 8; // Angle the other way
        branch2Mesh.castShadow = true;
        treeGroup.add(branch2Mesh);
        
        // Use consistent leaf texture (first AI variation - small tiled leaves)
        const leafTexture = textureLoader.load(
            './textures/leaves_variation_1_20250915_124330.png',
            () => console.log('✅ Small tiled leaf texture loaded'),
            undefined,
            () => console.warn('⚠️ Using fallback green leaves')
        );
        leafTexture.wrapS = THREE.RepeatWrapping;
        leafTexture.wrapT = THREE.RepeatWrapping;
        leafTexture.repeat.set(3, 3);
        
        const leafMaterial = new THREE.MeshLambertMaterial({ 
            map: leafTexture,
            color: 0x32CD32,
            emissive: 0x0a1f0a
        });
        
        // Main canopy sphere (on trunk)
        const mainCanopy = new THREE.SphereGeometry(2.2, 12, 8);
        const mainCanopyMesh = new THREE.Mesh(mainCanopy, leafMaterial);
        mainCanopyMesh.position.set(0, 5.5, 0); // Positioned above trunk
        mainCanopyMesh.castShadow = true;
        mainCanopyMesh.receiveShadow = true;
        treeGroup.add(mainCanopyMesh);
        
        // Branch 1 canopy
        const branch1Canopy = new THREE.SphereGeometry(1.2, 10, 6);
        const branch1CanopyMesh = new THREE.Mesh(branch1Canopy, leafMaterial);
        branch1CanopyMesh.position.set(-2, 4.2, 0.8); // At end of branch 1
        branch1CanopyMesh.castShadow = true;
        branch1CanopyMesh.receiveShadow = true;
        treeGroup.add(branch1CanopyMesh);
        
        // Branch 2 canopy
        const branch2Canopy = new THREE.SphereGeometry(1, 8, 6);
        const branch2CanopyMesh = new THREE.Mesh(branch2Canopy, leafMaterial);
        branch2CanopyMesh.position.set(1.5, 4.5, -0.5); // At end of branch 2
        branch2CanopyMesh.castShadow = true;
        branch2CanopyMesh.receiveShadow = true;
        treeGroup.add(branch2CanopyMesh);
        
        // Position tree group properly on ground
        treeGroup.position.set(x, 0, z); // y=0 ensures tree base touches ground
        this.scene.add(treeGroup);
        this.decorations.push(treeGroup);
        
        console.log('✅ Improved tree created: trunk + 2 branches + 3 canopies, properly grounded');
    }
    '''
    
    print("🌳 IMPROVED TREE STRUCTURE:")
    print("=" * 30)
    print("✅ Properly grounded (y=0 base)")
    print("✅ Main trunk with AI bark texture")
    print("✅ 2 angled branches for believability") 
    print("✅ 3 separate canopies (main + 2 branch canopies)")
    print("✅ Consistent leaf texture (small tiled pattern)")
    print("✅ Realistic tree proportions and structure")
    print("")
    print("📋 Copy this code to replace the createTree method in World.js")
    print("")
    print(improved_tree_code)

if __name__ == "__main__":
    fix_tree_issues()
    print("\n🔧 Apply this fix and test with screenshot validation!")