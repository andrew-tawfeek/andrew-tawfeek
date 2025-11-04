import { createTrefoilKnot, createTrefoilMesh } from './geometry.js';
import { createSegmentRings } from './segments.js';
import { MouseController } from './mouse.js';
import { AnimationController } from './animation.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0a0a0a, 1);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

// Create trefoil knot
const trefoilKnot = createTrefoilKnot();
const { torus, torusGeometry, originalPositions, material } = createTrefoilMesh(trefoilKnot);
scene.add(torus);

// Create segment rings
const segmentRings = createSegmentRings(trefoilKnot, scene);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 100);
pointLight2.position.set(-5, -5, 5);
scene.add(pointLight2);

// Initialize controllers
const mouseController = new MouseController(camera, torus);
const animationController = new AnimationController(torus, torusGeometry, originalPositions, material, trefoilKnot);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    animationController.time += 0.01;
    
    // Auto-rotate only if not manually rotated
    if (!mouseController.manualRotation) {
        torus.rotation.x += 0.003;
        torus.rotation.y += 0.005;
    }
    
    // Check for segment hover
    mouseController.checkSegmentHover(segmentRings);
    
    // Update vertices with deformations
    animationController.updateVertices(mouseController);
    
    // Update material colors
    const hue = animationController.updateMaterial();
    
    // Update segment rings
    animationController.updateSegmentRings(segmentRings, hue);
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
