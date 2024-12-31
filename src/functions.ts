import { vec3 } from "gl-matrix";
import { SphereDatas } from "../data/sphereData";
import { Sphere } from "./sphere";

export function showError(errorText: string) {
	console.error(errorText);
	const errorBoxDiv = document.getElementById('error-box');
	if (errorBoxDiv === null) {
		return;
	}
	const errorElement = document.createElement('p');
	errorElement.innerText = errorText;
	errorBoxDiv.appendChild(errorElement);
}

export function getContext(canvas: HTMLCanvasElement) {
	const gl = canvas.getContext('webgl2');
	if (!gl) {
		throw new Error('Error in getting webgl2');
	}
	return gl;
}

function getRandomInRange(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export function createShader(gl: WebGL2RenderingContext, type: GLenum, shaderSource: string) {
	const shader = gl.createShader(type);
	if (shader === null) {
		showError('Failed in creating shader');
		return null;
	}
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);
	let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) {
		return shader;
	}
	console.log(gl.getShaderInfoLog(shader));
	showError(`Failed in create shader: ${gl.getShaderInfoLog(shader)}`);
	gl.deleteShader(shader);
}

export function createProgram(gl: WebGL2RenderingContext,
	vertexShader: WebGLShader, fragmentShader: WebGLShader) {

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	let success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (success) {
		return program;
	}
	console.log(gl.getProgramInfoLog(program));
	showError(`Failed in create program: ${gl.getProgramInfoLog(program)}`);
	gl.deleteProgram(program);
}

export const getCirclePoints = (sector: number): number[] => {
	const vertices: number[] = [];
	for (let i = 0; i <= sector; i++) {
		const angle = ((2 * Math.PI) / sector) * i;
		const x = Math.cos(angle);
		const z = Math.sin(angle);
		vertices.push(x, 0, z, 1, 1, 1);
	}
	return vertices;
};

export function createStaticVertexBuffer(gl: WebGL2RenderingContext, data: ArrayBuffer) {
	const buffer = gl.createBuffer();
	if (!buffer) {
		showError('Failed to allocate buffer');
		return null;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return buffer;
}

export function createStaticIndexBuffer(gl: WebGL2RenderingContext, data: ArrayBuffer) {
	const buffer = gl.createBuffer();
	if (!buffer) {
		showError('Failed to allocate buffer');
		return null;
	}
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	return buffer;
}

export function createOrbitStarVAO(
	gl: WebGL2RenderingContext, buffer: WebGLBuffer,
	posAttrib: number, colorAttrib: number) {
	
	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	if (!vao) {
		showError('Failed to create VAO');
		return null;
	};

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(posAttrib);
	gl.vertexAttribPointer(
		posAttrib, 3, gl.FLOAT, false,
		6 * Float32Array.BYTES_PER_ELEMENT,
		0
	);

	gl.enableVertexAttribArray(colorAttrib);
	gl.vertexAttribPointer(
		colorAttrib, 3, gl.FLOAT, false,
		6 * Float32Array.BYTES_PER_ELEMENT,
		3 * Float32Array.BYTES_PER_ELEMENT
	);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
	return vao;
}

export function createSphereVAO(
	gl: WebGL2RenderingContext,
	vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer,
	indexBuffer: WebGLBuffer, sphereNormalsBuffer: WebGLBuffer,
	posAttrib: number, colorAttrib: number, normalAttrib: number) {

	const vao = gl.createVertexArray();
	if (!vao) {
		showError('Failed to create VAO');
		return null;
	}

	gl.bindVertexArray(vao);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.enableVertexAttribArray(posAttrib);
	gl.vertexAttribPointer(
		posAttrib, 3, gl.FLOAT, false,
		3 * Float32Array.BYTES_PER_ELEMENT,
		0
	);

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.enableVertexAttribArray(colorAttrib);
	gl.vertexAttribPointer(
		colorAttrib, 3, gl.FLOAT, false,
		3 * Float32Array.BYTES_PER_ELEMENT,
		0
	);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalsBuffer);
	gl.enableVertexAttribArray(normalAttrib);
	gl.vertexAttribPointer(
		normalAttrib,
		3,
		gl.FLOAT,
		false,
		0,
		0
	);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bindVertexArray(null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	return vao;
}

export function createSphereList(
	gl: WebGL2RenderingContext,
	posAttrib: number,
	colorAttrib: number,
	normalAttrib: number,
	data: SphereDatas): Sphere[] {

	const sectorCount = 36;
	const stackCount = 18;
	const baseRadius = 1.0;

	const spheres: Sphere[] = [];
	for (const def of data.Spheres) {
		const sphereData = getSphereData(sectorCount, stackCount, baseRadius);
		
		const colors = [];
		const diff = 100
		for (let i = 0; i < sphereData.vertices.length; i++) {
			const vertexColor = [
				getRandomInRange(def.color[0] / 255, (def.color[0] - diff) / 255),
				getRandomInRange(def.color[1] / 255, (def.color[1] - diff) / 255),
				getRandomInRange(def.color[2] / 255, (def.color[2] - diff) / 255)
			];
			colors.push(...vertexColor);
		}

		const sphereVerticesBuffer = createStaticVertexBuffer(gl, new Float32Array(sphereData.vertices));
		const sphereColorBuffer = createStaticVertexBuffer(gl, new Float32Array(colors));
		const sphereIndexBuffer = createStaticIndexBuffer(gl, new Uint16Array(sphereData.indices));

		const sphereNormalsBuffer = createStaticVertexBuffer(gl, new Float32Array(sphereData.normals));


		if (!sphereVerticesBuffer || !sphereColorBuffer || !sphereIndexBuffer || !sphereNormalsBuffer) {
			throw new Error("Failed to create buffers");
		}
		const sphereVao = createSphereVAO(
			gl,
			sphereVerticesBuffer,
			sphereColorBuffer,
			sphereIndexBuffer,
			sphereNormalsBuffer,
			posAttrib,
			colorAttrib,
			normalAttrib
		);

		if (!sphereVao) {
			throw new Error("Failed to create sphere VAO");
		}

		const sphere = createSphere(
			def.name,
			baseRadius,
			sectorCount,
			stackCount,
			def.color as vec3,
			sphereVao,
			vec3.fromValues(0, 0, 0),
			def.scale,
			def.selfRotationSpeed
		);

		sphere.setOrbit(def.orbitCenter as vec3, def.orbitRadius, def.orbitSpeed);
		sphere.setRotation(def.rotationAxis, def.rotationAngle);
		spheres.push(sphere);
	}
	return spheres;
}

export function createSphere(name: string, radius: number, sectorCount: number, stackCount: number,
    color: vec3, vao: WebGLVertexArrayObject, pos: vec3, scale: number, selfRotationSpeed: number) {
    const { vertices, normals, indices, lineIndices } = getSphereData(sectorCount, stackCount, radius);
    let sphere = new Sphere(name, radius, sectorCount, stackCount, color, vao, pos, scale, selfRotationSpeed);
    sphere.updateDataArray(vertices, normals, indices, lineIndices);
    return sphere;
}

export function getSphereData(sectorCount: number, stackCount: number, radius: number) {
    let x, y, z, xy;
    let nx, ny, nz, lengthInv = 1.0 / radius;
    let sectorAngle, stackAngle;

    let vertices = [];
    let normals = [];

    for (let i = 0; i <= stackCount; i++) {
        stackAngle = (Math.PI / 2) - (Math.PI / stackCount) * i;
        xy = radius * Math.cos(stackAngle);
        z = radius * Math.sin(stackAngle);

        for (let j = 0; j <= sectorCount; j++) {
            sectorAngle = (2 * Math.PI) / sectorCount * j;
            x = xy * Math.cos(sectorAngle);
            y = xy * Math.sin(sectorAngle);

            vertices.push(x, y, z);

            nx = x * lengthInv;
            ny = y * lengthInv;
            nz = z * lengthInv;
            normals.push(nx, ny, nz);
        }
    }

    // k1--k1+1
    // |  / |
    // | /  |
    // k2--k2+1

    let indices = [];
    let lineIndices = [];

    let k1, k2;
    for (let i = 0; i < stackCount; ++i) {

        k1 = i * (sectorCount + 1);     // beginning of current stack
        k2 = k1 + sectorCount + 1;      // beginning of next stack

        for (let j = 0; j < sectorCount; ++j, ++k1, ++k2) {
            // 2 triangles per sector excluding first and last stacks
            // k1 => k2 => k1+1
            if (i != 0) {
                indices.push(k1);
                indices.push(k2);
                indices.push(k1 + 1);
            }

            // k1+1 => k2 => k2+1
            if (i != (stackCount - 1)) {
                indices.push(k1 + 1);
                indices.push(k2);
                indices.push(k2 + 1);
            }

            // store indices for lines
            // vertical lines for all stacks, k1 => k2
            lineIndices.push(k1);
            lineIndices.push(k2);
            if (i != 0)  // horizontal lines except 1st stack, k1 => k+1
            {
                lineIndices.push(k1);
                lineIndices.push(k1 + 1);
            }
        }
    }

    return { vertices, normals, indices, lineIndices };
}

export function createStarVertices(numStars: number, radius: number) {
	const starPositions = [];
	for (let i = 0; i < numStars; i++) {
        let x = Math.random() - 0.5;
        let y = Math.random() - 0.5;
        let z = Math.random() - 0.5;
		let len = Math.sqrt(x * x + y * y + z * z);
		x /= len;
		y /= len;
		z /= len;

        const dist = radius * Math.random();
        x *= dist;
        y *= dist;
        z *= radius;
		
		const rgb = getRandomInRange(100, 255);
        starPositions.push(x, y, z, rgb, rgb, rgb);
    }
	return starPositions;
}