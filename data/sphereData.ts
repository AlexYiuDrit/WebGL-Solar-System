import { vec3 } from "gl-matrix";

interface SphereData {
    name: string;
    scale: number;
    rotationAxis: vec3;
    rotationAngle: number;
    orbitCenter: vec3;
    orbitRadius: number;
    orbitSpeed: number;
    orbitAngle: number;
    color: vec3;
    selfRotationSpeed: number;
}

export interface SphereDatas {
    Spheres: SphereData[];
}

export const STAR_DATA: SphereDatas = {
    Spheres: [
        {
            "name": "Sun",
            "scale": 10.0,
            "rotationAxis": [0, 1, 0],
            "rotationAngle": 0,
            "orbitCenter": [0, 0, 0],
            "orbitRadius": 0,
            "orbitSpeed": 0,
            "orbitAngle": 0,
            "color": [255, 0.0, 0.0],
            selfRotationSpeed: (2 * Math.PI) / 25,
        },
    ]
}

export const PLANET_DATA: SphereDatas = {
    Spheres: [
        {
            name: "Mercury",
            scale: 0.38,
            rotationAxis: [0, 1, 0],
            rotationAngle: 0,
            orbitCenter: [0, 0, 0],
            orbitRadius: 15,
            orbitSpeed: (2 * Math.PI) / 88,
            orbitAngle: 0,
            color: [255, 255, 255],
            selfRotationSpeed: (2 * Math.PI) / 58.6,
        },
        {
            name: "Venus",
            scale: 0.95,
            rotationAxis: [0, 1, 0],
            rotationAngle: 0,
            orbitCenter: [0, 0, 0],
            orbitRadius: 20,
            orbitSpeed: (2 * Math.PI) / 225,
            orbitAngle: 0,
            color: [204, 204, 76.5],
            selfRotationSpeed: -(2 * Math.PI) / 243,
        },
        {
            name: "Earth",
            scale: 1.0, 
            rotationAxis: [0, 1, 0],
            rotationAngle: 0,
            orbitCenter: [0, 0, 0],
            orbitRadius: 30,             
            orbitSpeed: (2 * Math.PI) / 365, 
            orbitAngle: 0,
            color: [51, 102, 255],
            selfRotationSpeed: 2 * Math.PI,
        },
        {
            name: "Mars",
            scale: 0.53,
            rotationAxis: [0, 1, 0],
            rotationAngle: 0,
            orbitCenter: [0, 0, 0],
            orbitRadius: 45,
            orbitSpeed: (2 * Math.PI) / 687,
            orbitAngle: 0,
            color: [255, 102, 76.5],
            selfRotationSpeed: 2 * Math.PI / 1.04,
        },
        {
            name: "Jupiter",
            scale: 6.2,
            rotationAxis: [0, 1, 0],
            rotationAngle: 0,
            orbitCenter: [0, 0, 0],
            orbitRadius: 100,
            orbitSpeed: (2 * Math.PI) / 4333,
            orbitAngle: 0,
            color: [229.5, 178.5, 127.5],
            selfRotationSpeed: 2 * Math.PI / 0.41,
        },
        {
            name: "Saturn",
            scale: 5.45,
            rotationAxis: [0, 1, 0],
            rotationAngle: 0,
            orbitCenter: [0, 0, 0],
            orbitRadius: 150,
            orbitSpeed: (2 * Math.PI) / 10759,
            orbitAngle: 0,
            color: [204, 178.5, 127.5],
            selfRotationSpeed: 2 * Math.PI / 0.44,
        },
        {
            name: "Uranus",
            scale: 3.0,
            rotationAxis: [0, 1, 0],
            rotationAngle: 0,
            orbitCenter: [0, 0, 0],
            orbitRadius: 200,
            orbitSpeed: (2 * Math.PI) / 30687,
            orbitAngle: 0,
            color: [153, 255, 204],
            selfRotationSpeed: 2 * Math.PI / 0.72,
        },
        {
            name: "Neptune",
            scale: 3.88,
            rotationAxis: [0, 1, 0],
            rotationAngle: 0,
            orbitCenter: [0, 0, 0],
            orbitRadius: 220,
            orbitSpeed: (2 * Math.PI) / 60190,
            orbitAngle: 0,
            color: [76.5, 76.5, 255.0],
            selfRotationSpeed: 2 * Math.PI / 0.67,
        },
    ],
};

export const MOON_DATA: SphereDatas = {
    Spheres: [
      {
        name: "Moon",
        scale: 0.27,                 
        rotationAxis: [0, 1, 0],
        rotationAngle: 0,
        orbitCenter: [0, 0, 0],       
        orbitRadius: 4,              
        orbitSpeed: (2 * Math.PI) / 27,
        orbitAngle: 0,
        color: [200, 200, 200],     
        selfRotationSpeed: (2 * Math.PI) / 27,
      }
    ]
  };