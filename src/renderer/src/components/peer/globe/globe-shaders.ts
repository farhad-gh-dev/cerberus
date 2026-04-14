// ---------------------------------------------------------------------------
// Globe Shaders
// ---------------------------------------------------------------------------

export const DOT_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`

export const DOT_FRAGMENT = /* glsl */ `
  uniform sampler2D earthMap;
  uniform vec3 landColor;
  uniform vec3 oceanGridColor;
  uniform float gridDensity;
  uniform float dotRadius;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    float landMask = texture2D(earthMap, vUv).r;

    // --- dot grid ---
    vec2 cells = vec2(gridDensity, gridDensity * 0.5);
    vec2 cell  = fract(vUv * cells);
    float d    = length(cell - 0.5);
    float dotMask = smoothstep(dotRadius, dotRadius * 0.50, d);

    // --- fresnel rim ---
    vec3 viewDir = normalize(vViewPos);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 3.0);

    // --- combine ---
    float landAlpha  = dotMask * landMask * 0.92;
    float oceanAlpha = dotMask * (1.0 - landMask) * 0.04;
    float rimAlpha   = fresnel * 0.14;

    float alpha = landAlpha + oceanAlpha + rimAlpha;

    vec3 color = landColor  * landAlpha
               + oceanGridColor * oceanAlpha
               + vec3(0.18, 0.22, 0.55) * rimAlpha;

    color = alpha > 0.001 ? color / alpha : vec3(0.0);

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`

export const ATMO_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`

export const ATMO_FRAGMENT = /* glsl */ `
  uniform vec3 glowColor;
  uniform float intensity;

  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    vec3 viewDir = normalize(vViewPos);
    float rim = 1.0 - max(0.0, dot(normalize(vNormal), viewDir));
    float glow = pow(rim, 4.0) * intensity;
    gl_FragColor = vec4(glowColor, glow);
  }
`

export const BOTTOM_GLOW_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const BOTTOM_GLOW_FRAGMENT = /* glsl */ `
  uniform vec3 glowColor;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float glow = exp(-d * d * 8.0) * 0.25;
    gl_FragColor = vec4(glowColor, glow);
  }
`

// ---- Flame shader ----

export const FLAME_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const FLAME_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColorBase;   // bright inner (white/cyan)
  uniform vec3 uColorMid;    // mid flame color
  uniform vec3 uColorOuter;  // outer edge color
  uniform float uOpacity;

  varying vec2 vUv;

  // Simplex-like hash noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289v2(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5000 * snoise(p); p *= 2.02;
    f += 0.2500 * snoise(p); p *= 2.03;
    f += 0.1250 * snoise(p); p *= 2.01;
    f += 0.0625 * snoise(p);
    return f;
  }

  void main() {
    vec2 uv = vUv;

    // Center horizontally: x from -1 to 1, y from 0 (base) to 1 (top)
    float x = (uv.x - 0.5) * 2.0;
    float y = uv.y;

    // Flame shape: narrow at top, wider at base
    float width = mix(0.6, 0.05, pow(y, 0.8)) * uIntensity;
    float shape = smoothstep(width, width * 0.3, abs(x));

    // Noise distortion — scrolls upward over time
    float t = uTime;
    vec2 noiseCoord = vec2(x * 2.0, y * 3.0 - t * 1.5);
    float n1 = fbm(noiseCoord);
    float n2 = fbm(noiseCoord * 1.5 + vec2(3.7, -t * 0.8));
    float noise = n1 * 0.6 + n2 * 0.4;

    // Distort shape with noise
    float flame = shape * (0.5 + noise * 0.8);

    // Fade at top and bottom edges
    flame *= smoothstep(0.0, 0.15, y); // fade in at base
    flame *= smoothstep(1.0, 0.4, y);  // fade out at top

    // Intensity scaling
    flame *= uIntensity;

    // Color gradient: white core → mid → outer
    float colorMix = smoothstep(0.0, 0.5, abs(x) / max(width, 0.001));
    float heightMix = pow(y, 0.6);
    vec3 color = mix(uColorBase, uColorMid, colorMix * 0.6 + heightMix * 0.4);
    color = mix(color, uColorOuter, heightMix * 0.7);

    // Bright core
    float core = smoothstep(width * 0.5, 0.0, abs(x)) * (1.0 - y) * uIntensity;
    color += vec3(1.0) * core * 0.4;

    gl_FragColor = vec4(color, flame * uOpacity);
  }
`
