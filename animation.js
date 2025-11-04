import { 
    GRAVITATIONAL_STRENGTH, 
    BROWNIAN_INTENSITY,
    turbulenceSpeed,
    turbulenceScale,
    turbulenceAmplitude,
    gravitationalRadius,
    RADIAL_SEGMENTS
} from './config.js';

// Animation and deformation logic
export class AnimationController {
    constructor(torus, torusGeometry, originalPositions, material, trefoilKnot) {
        this.torus = torus;
        this.torusGeometry = torusGeometry;
        this.originalPositions = originalPositions;
        this.material = material;
        this.trefoilKnot = trefoilKnot;
        
        this.time = 0;
        this.brownianOffsets = new Float32Array(torusGeometry.attributes.position.count * 3);
    }
    
    updateVertices(mouseController) {
        const positions = this.torusGeometry.attributes.position;
        const vertex = new THREE.Vector3();
        
        // Update main knot vertices
        for (let i = 0; i < positions.count; i++) {
            const i3 = i * 3;
            
            // Start with original vertex position
            const originalVertex = new THREE.Vector3(
                this.originalPositions[i3],
                this.originalPositions[i3 + 1],
                this.originalPositions[i3 + 2]
            );
            
            // Apply turbulence
            const turbulence = 
                Math.sin(originalVertex.x * turbulenceScale + this.time * turbulenceSpeed) * 
                Math.cos(originalVertex.y * turbulenceScale + this.time * turbulenceSpeed * 0.7) * 
                Math.sin(originalVertex.z * turbulenceScale + this.time * turbulenceSpeed * 0.5);
            
            const displacement = originalVertex.clone().normalize()
                .multiplyScalar(turbulence * turbulenceAmplitude);
            vertex.copy(originalVertex).add(displacement);
            
            // Apply Brownian motion
            if (BROWNIAN_INTENSITY > 0) {
                this.brownianOffsets[i3] += (Math.random() - 0.5) * BROWNIAN_INTENSITY;
                this.brownianOffsets[i3 + 1] += (Math.random() - 0.5) * BROWNIAN_INTENSITY;
                this.brownianOffsets[i3 + 2] += (Math.random() - 0.5) * BROWNIAN_INTENSITY;
                
                const damping = 0.95;
                this.brownianOffsets[i3] *= damping;
                this.brownianOffsets[i3 + 1] *= damping;
                this.brownianOffsets[i3 + 2] *= damping;
                
                vertex.x += this.brownianOffsets[i3];
                vertex.y += this.brownianOffsets[i3 + 1];
                vertex.z += this.brownianOffsets[i3 + 2];
            }
            
            // Gravitational pull towards mouse
            if (mouseController.isMouseActive) {
                const worldVertex = vertex.clone().applyMatrix4(this.torus.matrixWorld);
                const distance = worldVertex.distanceTo(mouseController.mousePosition3D);
                
                if (distance < gravitationalRadius) {
                    const falloff = 1 - (distance / gravitationalRadius);
                    const pullStrength = GRAVITATIONAL_STRENGTH * falloff * falloff;
                    
                    const direction = new THREE.Vector3()
                        .subVectors(mouseController.mousePosition3D, worldVertex)
                        .normalize();
                    
                    const inverseMatrix = new THREE.Matrix4().copy(this.torus.matrixWorld).invert();
                    direction.applyMatrix4(inverseMatrix).normalize();
                    
                    vertex.add(direction.multiplyScalar(pullStrength));
                }
            }
            
            // Update position
            positions.array[i3] = vertex.x;
            positions.array[i3 + 1] = vertex.y;
            positions.array[i3 + 2] = vertex.z;
        }
        
        positions.needsUpdate = true;
    }
    
    updateMaterial() {
        const hue = (this.time * 0.1) % 1;
        this.material.color.setHSL(hue, 1, 0.5);
        this.material.emissive.setHSL(hue, 1, 0.2);
        return hue;
    }
    
    updateSegmentRings(segmentRings, hue) {
        const positions = this.torusGeometry.attributes.position;
        
        segmentRings.forEach(segment => {
            // Calculate average position from deformed knot vertices
            const tubularIndex = segment.tubularIndex;
            const verticesPerSegment = RADIAL_SEGMENTS + 1;
            
            let centerX = 0, centerY = 0, centerZ = 0;
            for (let r = 0; r < RADIAL_SEGMENTS; r++) {
                const vertexIndex = tubularIndex * verticesPerSegment + r;
                const i3 = vertexIndex * 3;
                
                if (i3 < positions.count * 3) {
                    centerX += positions.array[i3];
                    centerY += positions.array[i3 + 1];
                    centerZ += positions.array[i3 + 2];
                }
            }
            centerX /= RADIAL_SEGMENTS;
            centerY /= RADIAL_SEGMENTS;
            centerZ /= RADIAL_SEGMENTS;
            
            // Update ring position
            const deformedCenter = new THREE.Vector3(centerX, centerY, centerZ);
            deformedCenter.applyMatrix4(this.torus.matrixWorld);
            segment.mesh.position.copy(deformedCenter);
            
            // Update orientation
            const tangent = this.trefoilKnot.getTangent(segment.t);
            const axis = new THREE.Vector3(0, 0, 1);
            const rotatedTangent = tangent.clone().applyQuaternion(this.torus.quaternion);
            segment.mesh.quaternion.setFromUnitVectors(axis, rotatedTangent.normalize());
            
            // Set contrasting color
            const contrastHue = (hue + 0.5) % 1;
            segment.mesh.material.color.setHSL(contrastHue, 1, 0.5);
            segment.mesh.material.emissive.setHSL(contrastHue, 1, segment.hovered ? 0.8 : 0.2);
            
            // Apply deformations to ring vertices
            this.updateRingVertices(segment);
        });
    }
    
    updateRingVertices(segment) {
        const ringPositions = segment.geometry.attributes.position;
        const ringVertex = new THREE.Vector3();
        
        for (let i = 0; i < ringPositions.count; i++) {
            const i3 = i * 3;
            
            const originalRingVertex = new THREE.Vector3(
                segment.originalPositions[i3],
                segment.originalPositions[i3 + 1],
                segment.originalPositions[i3 + 2]
            );
            
            // Sample turbulence
            const worldPos = originalRingVertex.clone()
                .applyMatrix4(segment.mesh.matrixWorld);
            
            const turbulence = 
                Math.sin(worldPos.x * turbulenceScale + this.time * turbulenceSpeed) * 
                Math.cos(worldPos.y * turbulenceScale + this.time * turbulenceSpeed * 0.7) * 
                Math.sin(worldPos.z * turbulenceScale + this.time * turbulenceSpeed * 0.5);
            
            const displacement = originalRingVertex.clone().normalize()
                .multiplyScalar(turbulence * turbulenceAmplitude);
            ringVertex.copy(originalRingVertex).add(displacement);
            
            // Apply Brownian motion
            if (BROWNIAN_INTENSITY > 0) {
                const brownianScale = 0.5;
                ringVertex.x += (Math.random() - 0.5) * BROWNIAN_INTENSITY * brownianScale;
                ringVertex.y += (Math.random() - 0.5) * BROWNIAN_INTENSITY * brownianScale;
                ringVertex.z += (Math.random() - 0.5) * BROWNIAN_INTENSITY * brownianScale;
            }
            
            ringPositions.array[i3] = ringVertex.x;
            ringPositions.array[i3 + 1] = ringVertex.y;
            ringPositions.array[i3 + 2] = ringVertex.z;
        }
        
        ringPositions.needsUpdate = true;
    }
}
