# Trefoil Knot Visualization

An interactive 3D visualization of a trefoil knot with dynamic deformations and mouse interactions.

## File Structure

```
├── index.html              # Original single-file version (legacy)
├── index-modular.html      # New modular version entry point
├── styles.css              # All CSS styles
├── config.js               # All configurable parameters
├── geometry.js             # Trefoil geometry creation
├── segments.js             # Highlighted segment rings
├── mouse.js                # Mouse interaction and controls
├── animation.js            # Animation and deformation logic
└── main.js                 # Main application entry point
```

## Quick Start

To use the modular version, open `index-modular.html` in a web browser.

**Note:** Due to ES6 module imports, you'll need to serve the files via a local web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000/index-modular.html`

## Configuration

All adjustable parameters are centralized in `config.js`:

### Triangulation Density
- `RADIAL_SEGMENTS`: Segments around the tube (default: 22)
- `TUBULAR_SEGMENTS`: Segments around the main ring (default: 64)

### Highlighted Segments
- `NUM_HIGHLIGHTED_SEGMENTS`: Number of interactive rings (default: 5)

### Mouse Attraction
- `GRAVITATIONAL_STRENGTH`: Mouse attraction strength (default: 0.2)
  - Higher values = stronger attraction (try 0.05-0.5)
  - Set to 0 to disable

### Turbulence Animation
- `turbulenceSpeed`: Speed of turbulence (default: 1)
- `turbulenceScale`: Scale of turbulence patterns (default: 0.5)
- `turbulenceAmplitude`: Intensity of turbulence (default: 0.1)

### Brownian Motion
- `BROWNIAN_INTENSITY`: Random surface motion (default: 0.01)
  - Higher values = more jittery motion
  - Set to 0 to disable

## Modules Overview

### config.js
Contains all configuration parameters for easy adjustment without diving into the code logic.

### geometry.js
Handles the creation of the trefoil knot curve and the main mesh geometry.

### segments.js
Creates and manages the highlighted segment rings that appear along the trefoil.

### mouse.js
Manages all mouse interactions:
- Click-and-drag rotation
- Mouse hover detection for segments
- 3D mouse position tracking for gravitational attraction

### animation.js
Contains the core animation logic:
- Vertex deformations (turbulence, Brownian motion)
- Gravitational pull towards mouse
- Color cycling
- Segment ring updates

### main.js
The main entry point that ties everything together:
- Scene setup
- Lighting
- Animation loop
- Window resize handling

## Features

- **Interactive Rotation**: Click and drag to manually rotate the trefoil
- **Mouse Attraction**: Vertices are gently pulled towards your mouse
- **Turbulence Animation**: Organic wave-like motion across the surface
- **Brownian Motion**: Subtle random jittering for a living feel
- **Highlighted Segments**: 5 interactive rings that glow when hovered
- **Color Cycling**: Smooth color transitions over time
- **Contrasting Colors**: Rings are always opposite color from main knot

## Browser Compatibility

Requires a modern browser with ES6 module support:
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+
