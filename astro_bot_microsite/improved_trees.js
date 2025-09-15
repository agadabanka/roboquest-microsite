    // IMPROVED TREE STRUCTURE: Trunk + Branches + Single Leaf Texture
    createTree(x, y, z) {
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
                return new THREE.MeshLambertMaterial({ color: 0x32CD32 });
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
    }