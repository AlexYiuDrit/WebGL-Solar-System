import { mat3, mat4, quat, vec3 } from "gl-matrix";

export class Sphere {
    public readonly matWorld = mat4.create();
    private scaleVec = vec3.create();
    private rotation = quat.create();

    public orbitCenter = vec3.create();
    public orbitRadius = 1.0;
    public orbitSpeed = 1;
    private orbitAngle = 0;

    private rotationAxis = vec3.create();
    private rotationAngle = 0;

    private vertices: number[] = [];
    private normals: number[] = [];
    private indices: number[] = [];
    private lineIndices: number[] = [];

    constructor(
        public name: string,
        private radius: number,
        private sectorCount: number,
        private stackCount: number,
        private rgbColor: vec3,
        private readonly vao: WebGLVertexArrayObject,
        private pos: vec3,
        private scale: number,
        private selfRotationSpeed: number
    ) { }

    public updateDataArray(vertices: number[], normals: number[], indices: number[], lineIndices: number[]) {
        this.vertices = vertices;
        this.normals = normals;
        this.indices = indices;
        this.lineIndices = lineIndices;
    }

    public setOrbit(center: vec3, orbitRadius: number, orbitSpeed: number) {
        vec3.copy(this.orbitCenter, center);
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = orbitSpeed;
    }

    public setRotation(rotationAxis: vec3, rotationAngle: number) {
        this.rotationAxis = rotationAxis;
        this.rotationAngle = rotationAngle;
    }

    public draw(gl: WebGL2RenderingContext, matWorldUniform: WebGLUniformLocation, matNormalUniform: WebGLUniformLocation, dt: number) {

        this.orbitAngle += this.orbitSpeed * dt;
        const orbitPos = vec3.create();
        vec3.set(
            orbitPos,
            this.orbitCenter[0] + Math.sin(this.orbitAngle) * this.orbitRadius,
            this.orbitCenter[1],
            this.orbitCenter[2] + Math.cos(this.orbitAngle) * this.orbitRadius,
        );


        this.rotationAngle += this.selfRotationSpeed * dt;
        quat.setAxisAngle(this.rotation, this.rotationAxis, this.rotationAngle);
        vec3.set(this.scaleVec, this.scale, this.scale, this.scale);

        mat4.fromRotationTranslationScale(
            this.matWorld,
            this.rotation,
            orbitPos,
            this.scaleVec
        );

        const normalMatrix = mat3.create();
        mat3.fromMat4(normalMatrix, this.matWorld);
        mat3.invert(normalMatrix, normalMatrix);
        mat3.transpose(normalMatrix, normalMatrix);

        gl.uniformMatrix3fv(matNormalUniform, false, normalMatrix);

        gl.uniformMatrix4fv(matWorldUniform, false, this.matWorld);
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }
}



