import { fragmentShaderSourceCode, vertexShaderSourceCode } from "./glsl";
import { createOrbitStarVAO, createProgram, createShader, createSphereList, createStarVertices, createStaticVertexBuffer, getCirclePoints, getContext, resizeCanvas, showError } from "./functions";
import { glMatrix, mat4, vec3 } from "gl-matrix";
import { Sphere } from "./sphere";
import { STAR_DATA, PLANET_DATA, MOON_DATA } from "../data/sphereData";

function render() {
    const canvas = document.getElementById('canvas');
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        showError('Could not get Canvas reference');
        return;
    }
    const gl = getContext(canvas);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSourceCode);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceCode);
    if (!vertexShader || !fragmentShader) {
        showError('Failed to create shaders');
        return;
    }

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
        showError('Failed to create WebGL program');
        return;
    }

    const posAttrib = gl.getAttribLocation(program, 'a_position');
    const colorAttrib = gl.getAttribLocation(program, 'a_color');
    const normalAttrib = gl.getAttribLocation(program, 'a_normal');

    const matWorldUniform = gl.getUniformLocation(program, 'u_matWorld');
    const matViewProjUniform = gl.getUniformLocation(program, 'u_matViewProj');

    const matNormalUniform = gl.getUniformLocation(program, 'u_matNormal');
    const lightPosUniform = gl.getUniformLocation(program, 'u_lightPos');
    const lightColorUniform = gl.getUniformLocation(program, 'u_lightColor');
    const isSunUniform = gl.getUniformLocation(program, "u_isSun");

    if (posAttrib < 0 || colorAttrib < 0 || normalAttrib < 0
        || !matWorldUniform || !matViewProjUniform || !matNormalUniform
        || !lightPosUniform || !lightColorUniform || !isSunUniform) {
        showError(`Failed to get attribs/uniforms: ` +
            `pos=${posAttrib}, color=${colorAttrib}, normal=${normalAttrib} ` +
            `matWorld=${!!matWorldUniform} matViewProj=${!!matViewProjUniform} ` +
            `matNormal=${!!matNormalUniform} lightPos=${!!lightPosUniform} ` +
            `lightColor=${!!lightColorUniform} isSun=${!!isSunUniform}`
        );
        return;
    }

    const numStars = 60000;
    const MAX_STAR_RADIUS = 1000;
    const starVertices = createStarVertices(numStars, MAX_STAR_RADIUS);

    const starBuffer = createStaticVertexBuffer(gl, new Float32Array(starVertices));
    if (!starBuffer) {
        showError('Failed to create VBO');
		return null;
    }
    const starVAO = createOrbitStarVAO(gl, starBuffer, posAttrib, colorAttrib);

    const stars: Sphere[] = createSphereList(gl, posAttrib, colorAttrib, normalAttrib, STAR_DATA);
    const planets: Sphere[] = createSphereList(gl, posAttrib, colorAttrib, normalAttrib, PLANET_DATA);
    const moonList: Sphere[] = createSphereList(gl, posAttrib, colorAttrib, normalAttrib, MOON_DATA);
    const moon = moonList[0];

    const sector = 1000;
    const orbitLineVertices = getCirclePoints(sector);
    const orbitLineBuffer = createStaticVertexBuffer(gl, new Float32Array(orbitLineVertices));
    if (!orbitLineBuffer) {
        showError('Failed to create VBO');
		return null;
    }
    const orbitLineVAO = createOrbitStarVAO(gl, orbitLineBuffer, posAttrib, colorAttrib);

    let fovyDegrees = 80;
    canvas.addEventListener("wheel", (e) => {
        fovyDegrees += e.deltaY * 0.1;
        fovyDegrees = Math.max(10, Math.min(120, fovyDegrees));
    });

    const daysPerSecond = 1;
    const now = performance.now();
    let lastTime = now;

    const frame = function () {
        const currentTime = performance.now();
        const elapsedMs = currentTime - lastTime;
        lastTime = currentTime;
        const dt = (elapsedMs / 1000) * daysPerSecond;

        const matView = mat4.create();
        const matProj = mat4.create();

        mat4.lookAt(
            matView,
            vec3.fromValues(0, 150, 300),
            vec3.fromValues(0, 0, 0),
            vec3.fromValues(0.5, 1, 0)
        );

        mat4.perspective(
            matProj,
            glMatrix.toRadian(fovyDegrees),
            canvas.width / canvas.height,
            0.1,
            10000.0
        );

        const matViewProj = mat4.create();
        mat4.multiply(matViewProj, matProj, matView);

        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;
        gl.clearColor(0.02, 0.02, 0.02, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        resizeCanvas(gl, canvas);

        gl.useProgram(program);

        gl.uniform3fv(lightPosUniform, [1, 1, 1]);
        gl.uniform3fv(lightColorUniform, [1.0, 1.0, 1.0]);

        gl.uniformMatrix4fv(matViewProjUniform, false, matViewProj);

        gl.bindVertexArray(starVAO);
        gl.drawArrays(gl.POINTS, 0, numStars);
        gl.bindVertexArray(null);

        gl.uniform1i(isSunUniform, 1);
        for (const star of stars) {
            star.draw(gl, matWorldUniform, matNormalUniform, dt);
        }
        gl.uniform1i(isSunUniform, 0);

        for (const planet of planets) {
            planet.draw(gl, matWorldUniform, matNormalUniform, dt);
            if (planet.name === "Earth") {
                const earthPos = vec3.fromValues(planet.matWorld[12], planet.matWorld[13], planet.matWorld[14]);
                moon.setOrbit(earthPos, moon.orbitRadius, moon.orbitSpeed);
                moon.draw(gl, matWorldUniform, matNormalUniform, dt);
                gl.bindVertexArray(orbitLineVAO);
                const model = mat4.create();
                const radius = moon.orbitRadius;
                mat4.translate(model, model, earthPos);
                mat4.scale(model, model, [radius, radius, radius]);
                gl.uniformMatrix4fv(matWorldUniform, false, model);
                gl.drawArrays(gl.LINE_STRIP, 0, orbitLineVertices.length / 6);
            }
            gl.bindVertexArray(orbitLineVAO);
            const model = mat4.create();
            const radius = planet.orbitRadius;
            mat4.scale(model, model, [radius, radius, radius]);
            gl.uniformMatrix4fv(matWorldUniform, false, model);
            gl.drawArrays(gl.LINE_STRIP, 0, orbitLineVertices.length / 6);
        }

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

try {
    render();
} catch (e) {
    showError(`Unhandled Javascript exception: ${e}`);
}