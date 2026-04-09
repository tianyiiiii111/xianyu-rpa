# Rust 3D Effect App - Specification

## Project Overview
- **Project Name**: rust-3d-effect-app
- **Type**: 3D Graphics Application
- **Core Functionality**: A visually appealing 3D demo showcasing rotating geometric shapes with dynamic lighting and materials using Bevy engine
- **Target Users**: Developers exploring Rust 3D graphics, demo viewers

## Technical Stack
- **Language**: Rust
- **Graphics Engine**: Bevy (built on wgpu)
- **Rendering**: WebGPU/Vulkan/Metal/OpenGL

## UI/UX Specification

### Layout Structure
- Full-screen 3D canvas
- Dark background for contrast
- Multiple 3D objects arranged in scene

### Visual Design
- **Color Palette**:
  - Background: Deep space black (#0a0a0f)
  - Primary accent: Electric cyan (#00ffff)
  - Secondary: Magenta (#ff00ff)
  - Tertiary: Golden yellow (#ffd700)
  - Object materials: Metallic with PBR
- **Lighting**:
  - Ambient light: Low intensity (#202030)
  - Directional light: Warm white from top-right
  - Point lights: Colored accent lights around objects

### 3D Scene Elements
1. **Central rotating torus knot** - Primary visual element
2. **Orbiting spheres** - Smaller spheres rotating around center
3. **Ground plane** - Reflective dark surface
4. **Particle effects** - Floating particles around scene

### Animations
- Torus knot: Continuous rotation on Y and Z axes
- Orbiting spheres: Circular motion at different speeds
- Camera: Gentle orbit around the scene
- Colors: Subtle hue shifting on materials

## Functionality Specification

### Core Features
1. **3D Rendering**: Initialize Bevy renderer with PBR materials
2. **Dynamic Geometry**: Create and render torus knot and spheres
3. **Lighting System**: Multiple light sources for depth
4. **Animation Loop**: Continuous rotation and orbit animations
5. **Camera Control**: Auto-rotating camera with slight zoom

### User Interactions
- Window automatically displays 3D scene
- No user input required - purely visual demo

## Acceptance Criteria
1. Application compiles without errors
2. Window opens showing 3D scene
3. Objects are visible with proper lighting
4. Animations run smoothly (target 60 FPS)
5. No crashes or panics during runtime