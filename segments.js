import { NUM_HIGHLIGHTED_SEGMENTS, TUBULAR_SEGMENTS } from './config.js';

// Create highlighted segment rings along the trefoil
export function createSegmentRings(trefoilKnot, scene) {
    const segmentRings = [];
    
    for (let i = 0; i < NUM_HIGHLIGHTED_SEGMENTS; i++) {
        const t = i / NUM_HIGHLIGHTED_SEGMENTS;
        const position = trefoilKnot.getPoint(t);
        
        // Create a ring geometry at this position
        const ringGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 16);
        
        // Create material for this ring
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0xff00ff,
            wireframe: true,
            emissive: 0xff00ff,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.9
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        
        // Store original positions for applying deformations
        const ringOriginalPositions = ringGeometry.attributes.position.array.slice();
        
        // Position the ring
        ring.position.copy(position);
        
        // Orient the ring to be perpendicular to the curve
        const tangent = trefoilKnot.getTangent(t);
        const axis = new THREE.Vector3(0, 0, 1);
        ring.quaternion.setFromUnitVectors(axis, tangent.normalize());
        
        scene.add(ring);
        segmentRings.push({
            mesh: ring,
            geometry: ringGeometry,
            originalPositions: ringOriginalPositions,
            t: t,
            tubularIndex: Math.floor(t * TUBULAR_SEGMENTS),
            hovered: false
        });
    }
    
    return segmentRings;
}
