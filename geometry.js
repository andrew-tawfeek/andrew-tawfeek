import { RADIAL_SEGMENTS, TUBULAR_SEGMENTS } from './config.js';

// Create trefoil knot curve
export function createTrefoilKnot() {
    const trefoilKnot = new THREE.Curve();
    trefoilKnot.getPoint = function(t) {
        t = t * Math.PI * 2;
        const x = Math.sin(t) + 2 * Math.sin(2 * t);
        const y = Math.cos(t) - 2 * Math.cos(2 * t);
        const z = -Math.sin(3 * t);
        return new THREE.Vector3(x, y, z).multiplyScalar(0.8);
    };
    return trefoilKnot;
}

// Create main trefoil mesh
export function createTrefoilMesh(trefoilKnot) {
    const torusGeometry = new THREE.TubeGeometry(
        trefoilKnot, 
        TUBULAR_SEGMENTS, 
        0.3, 
        RADIAL_SEGMENTS, 
        true
    );
    
    const originalPositions = torusGeometry.attributes.position.array.slice();
    
    const material = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        wireframe: true,
        emissive: 0x003333,
        shininess: 100
    });
    
    const torus = new THREE.Mesh(torusGeometry, material);
    
    return { torus, torusGeometry, originalPositions, material };
}
