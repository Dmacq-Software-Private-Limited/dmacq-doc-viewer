import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';

export const useThreeSnapshot = (url: string, fileType: string) => {
    const [snapshot, setSnapshot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!url || !fileType) return;

        const generateSnapshot = async () => {
            try {
                // Create off-screen canvas
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 600;

                // Create renderer
                const renderer = new THREE.WebGLRenderer({
                    canvas,
                    antialias: true,
                    alpha: true,
                    preserveDrawingBuffer: true
                });
                renderer.setSize(canvas.width, canvas.height);
                renderer.setClearColor(0x1a1a1a, 1);

                // Create scene
                const scene = new THREE.Scene();

                // Create camera with better FOV settings
                const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);

                // Add lighting
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
                scene.add(ambientLight);

                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight.position.set(1, 1, 1);
                scene.add(directionalLight);

                // Add backlight to improve visibility
                const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
                backLight.position.set(-1, -1, -1);
                scene.add(backLight);

                // Load model
                const loader = getLoader(fileType);
                if (!loader) throw new Error(`Unsupported file type: ${fileType}`);

                const model = await new Promise<THREE.Object3D>((resolve, reject) => {
                    loader.load(
                        url,
                        (object) => {
                            // Handle GLTF scene
                            if (object.scene) {
                                resolve(object.scene);
                            } else {
                                resolve(object);
                            }
                        },
                        undefined,
                        (err) => reject(err)
                    );
                });

                // Center and scale model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 1.5 / maxDim;

                model.position.x = -center.x * scale;
                model.position.y = -center.y * scale;
                model.position.z = -center.z * scale;
                model.scale.set(scale, scale, scale);

                scene.add(model);

                // Calculate optimal camera position to fit entire model
                const boundingSphere = new THREE.Sphere();
                box.getBoundingSphere(boundingSphere);

                const distance = boundingSphere.radius * 1.8;
                camera.position.set(0, 0, distance);
                camera.lookAt(new THREE.Vector3(0, 0, 0));

                // Add orbit controls to adjust view if needed
                // const controls = new OrbitControls(camera, canvas);
                // controls.update();

                // Render scene
                renderer.render(scene, camera);

                // Capture snapshot
                const dataUrl = canvas.toDataURL('image/png');
                setSnapshot(dataUrl);

                // Clean up
                renderer.dispose();
                scene.remove(model);
                disposeModel(model);
            } catch (err) {
                console.error('Error generating 3D snapshot:', err);
                setError('Failed to generate preview');
            } finally {
                setIsLoading(false);
            }
        };

        generateSnapshot();
    }, [url, fileType]);

    return { snapshot, isLoading, error };
};

// Helper function to get appropriate loader
const getLoader = (fileType: string) => {
    switch (fileType.toLowerCase()) {
        case 'glb':
        case 'gltf':
            return new GLTFLoader();
        case 'obj':
            return new OBJLoader();
        case 'stl':
            return new STLLoader();
        case '3ds':
            return new TDSLoader();
        default:
            return null;
    }
};

// Helper function to dispose of model resources
const disposeModel = (model: THREE.Object3D) => {
    model.traverse(child => {
        if (child instanceof THREE.Mesh) {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    });
};