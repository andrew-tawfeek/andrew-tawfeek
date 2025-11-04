// Mouse tracking and interaction controls

export class MouseController {
    constructor(camera, torus) {
        this.camera = camera;
        this.torus = torus;
        
        // Mouse tracking
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.mousePosition3D = new THREE.Vector3();
        this.isMouseActive = false;
        
        // Rotation controls
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.manualRotation = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Mouse down - start dragging
        document.addEventListener('mousedown', (event) => {
            this.isDragging = true;
            this.previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        });
        
        // Mouse up - stop dragging
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        // Track mouse movement
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.isMouseActive = true;
            
            // Handle rotation when dragging
            if (this.isDragging) {
                this.manualRotation = true;
                
                const deltaX = event.clientX - this.previousMousePosition.x;
                const deltaY = event.clientY - this.previousMousePosition.y;
                
                this.torus.rotation.y += deltaX * 0.01;
                this.torus.rotation.x += deltaY * 0.01;
                
                this.previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
            
            // Project mouse position into 3D space
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const distance = 5;
            this.mousePosition3D = this.raycaster.ray.origin.clone().add(
                this.raycaster.ray.direction.multiplyScalar(distance)
            );
        });
        
        document.addEventListener('mouseleave', () => {
            this.isMouseActive = false;
        });
    }
    
    checkSegmentHover(segmentRings) {
        if (!this.isDragging && this.isMouseActive) {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(segmentRings.map(s => s.mesh));
            
            // Reset all segments
            segmentRings.forEach(segment => {
                segment.hovered = false;
                segment.mesh.material.emissiveIntensity = 0.3;
                segment.mesh.material.opacity = 0.9;
                segment.mesh.scale.set(1, 1, 1);
            });
            
            // Highlight hovered segment with glow
            if (intersects.length > 0) {
                const hoveredMesh = intersects[0].object;
                const segment = segmentRings.find(s => s.mesh === hoveredMesh);
                if (segment) {
                    segment.hovered = true;
                    segment.mesh.material.emissiveIntensity = 2.0;
                    segment.mesh.material.opacity = 1.0;
                    segment.mesh.scale.set(1.3, 1.3, 1.3);
                }
            }
        }
    }
}
