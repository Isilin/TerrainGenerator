export const WATER_VERTEX_SHADER = `
  attribute float depthFactor;
  varying float vDepth;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  void main() {
    vDepth = depthFactor;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

export const WATER_FRAGMENT_SHADER = `
  uniform vec3 waterColor;
  uniform float baseOpacity;
  uniform float depthOpacityBoost;
  uniform float reflectionStrength;
  uniform vec3 lightDirection;

  varying float vDepth;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 lightDir = normalize(lightDirection);

    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    float specular = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 44.0);
    float alpha = clamp(baseOpacity + vDepth * depthOpacityBoost, 0.03, 0.96);

    vec3 reflectedLight = vec3((fresnel + specular * 0.7) * reflectionStrength);
    vec3 finalColor = waterColor + reflectedLight;

    gl_FragColor = vec4(finalColor, alpha);
  }
`
