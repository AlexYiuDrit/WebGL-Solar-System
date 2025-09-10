# Solar System Visualization

[![screenshot.jpg](https://alexyiudrit.github.io/WebGL-Solar-System/screenshot.png)](https://alexyiudrit.github.io/WebGL-Solar-System/)

[Click to launch](https://alexyiudrit.github.io/WebGL-Solar-System/)

## Overview

This is a WebGL application that visualizes a simplified 3D solar system, including the Sun, Earth, Moon, and planets like Mars, Jupiter, Saturn, Uranus, and Neptune. Celestial bodies orbit the Sun, with self-rotation and orbital paths rendered for realism. A light source from the Sun applies diffuse lighting effects. The scene includes a starry background and supports camera zooming via mouse wheel.

## Technologies

- **Language**: TypeScript (compiled to JavaScript)
- **Framework**: WebGL 2.0
- **Library**: glMatrix for matrix operations
- **Modular Structure**:
  - `index.ts`: Initializes WebGL context, shaders, buffers, VAOs; handles animation loop and zooming.
  - `glsl.ts`: Vertex and fragment shader sources for transformations, normals, and lighting.
  - `functions.ts`: Utilities for creating shaders, buffers, VAOs; generates sphere vertices and circle points.
  - `sphere.ts`: Sphere class encapsulating position, scale, rotation, and orbital movement; includes draw method for transformations.
  - `sphereData.ts`: Dataset for celestial bodies (e.g., scale, orbit radius, speeds in radians/day).

Data is stored in TypeScript to bypass browser CORS restrictions, with scaled units for visibility while preserving relative proportions.

## Implementation Details

### Solar System Simulation

- **Data Structure**: Each body defined by `SphereData` interface with attributes like name, scale, selfRotationSpeed (2π/days for spin), orbitSpeed (2π/days for revolution), and orbitRadius.
- **Starry Background**: Generated via `createStarVertices()`: Random 3D points normalized to unit vectors, scaled by random radius, and assigned RGB colors for variation.
- **Sphere Generation**: `getSphereData()` uses parametric equations for vertices and normals:
[screenshot.jpg](https://alexyiudrit.github.io/WebGL-Solar-System/sphere.png)
  ```
  x = r * cos(ϕ) * cos(θ)
  y = r * cos(ϕ) * sin(θ)
  z = r * sin(ϕ)
  ```
[screenshot.jpg](https://alexyiudrit.github.io/WebGL-Solar-System/sector.png)
  Where θ = 2π * i / sectorCount, ϕ = π/2 - π * j / stackCount. Triangulated with indices for two triangles per sector (k1 → k2 → k1+1, k1+1 → k2 → k2+1). Normals = position / radius.
- **Orbital Movement**: In `Sphere.draw()`:
  - Update `orbitAngle += orbitSpeed * dt` (dt in simulation days).
  - Position:
  ```
  x = orbitCenter.x + sin(orbitAngle) * orbitRadius 
  z = orbitCenter.z + cos(orbitAngle) * orbitRadius
  ```
- **Self-Rotation**: `rotationAngle += selfRotationSpeed * dt` applied via quaternion in `mat4.fromRotationTranslationScale()`
- **Normal Matrix**: Extract 3x3 from world matrix, invert, transpose for uniform scaling.
- **Orbits**: Unit circle via `getCirclePoints()` (x = cos(θ), z = sin(θ)); scaled by orbitRadius.

### Rendering Pipeline

- **Shaders**: Single vertex shader transforms positions, passes normals/colors. Fragment shader computes diffuse lighting: `max(dot(normal, lightDir), 0.1)`
- **Buffers and VAOs**: Pattern: Generate data → Create/bind VBO → Bind VAO → Set attribute pointers.
- **Animation Loop**: `requestAnimationFrame(frame)`; `dt = (elapsedMs / 1000) * daysPerSecond`. Clears canvas, updates transformations, draws objects.
- **Vertex Colors**: Randomized offsets for adjacent vertices to highlight 3D shape and rotation.

### Camera

- **View Matrix**: `mat4.lookAt(cameraPos, target, up=[0,1,0.5])` for tilted view.
- **Projection**: `mat4.perspective(fovy, aspect, near, far)` fovy adjusts on mouse wheel for zoom.
- **Combined**: `matViewProj = matProj * matView`; passed as uniform.

### Lighting

- Diffuse: `intensity = max(dot(normal, lightDir), 0.1)` to avoid full darkness. Sun excluded as light source. Applied in fragment shader.

## Challenges and Learnings

Implemented modular design for maintainability. Gained experience in WebGL pipeline, sphere geometry, linear algebra (matrices/quaternions), and transformations. Future improvements: Textures, eccentricity, inclination, axial tilt, Kepler's laws.

## References

- [WebGL2 Fundamentals](https://webgl2fundamentals.org/)
- [OpenGL Sphere](https://www.songho.ca/opengl/gl_sphere.html)
- [Solar System GitHub Repo](https://github.com/pengfeiw/solar-system/tree/master)
