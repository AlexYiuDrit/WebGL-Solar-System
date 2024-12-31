export const vertexShaderSourceCode = `#version 300 es
    precision mediump float;
    
    in vec3 a_position;
    in vec3 a_color;
    in vec3 a_normal;

    out vec3 fragmentColor;
    out vec3 v_normal;

    uniform mat4 u_matWorld;
    uniform mat4 u_matViewProj;
    uniform mat3 u_matNormal;

    
    void main() {
        fragmentColor = a_color;
        v_normal = u_matNormal * a_normal;

        gl_PointSize = 3.0;
        gl_Position = u_matViewProj * u_matWorld * vec4(a_position, 1.0);
    }
`;

export const fragmentShaderSourceCode = `#version 300 es
    precision highp float;
    
    in vec3 fragmentColor;
    in vec3 v_normal;

    out vec4 outputColor;

    uniform vec3 u_lightPos;
    uniform vec3 u_lightColor;
    uniform bool u_isSun;
  
    void main() {
        if (u_isSun) {
            outputColor = vec4(fragmentColor, 1.0);
            return;
        }

        vec3 normal = normalize(v_normal);
        vec3 lightDir = normalize(u_lightPos);
        float diffuseIntensity = max(dot(normal, lightDir), 0.1);

        vec3 finalColor = fragmentColor * u_lightColor * diffuseIntensity;
        outputColor = vec4(finalColor, 1.0);
    }
`;