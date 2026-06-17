"use client";

import { useEffect, useRef, useState } from "react";
import { registerPaintTarget } from "@/lib/touchPaint";

// Cursor-driven "ink in water" dissolve between two same-framed images.
// Paint-to-reveal: the second image (e.g. an ASCII render) materialises around
// the cursor through flowing fbm noise and bleeds outward, decaying back to the
// base photo on leave. Hand-rolled WebGL1 (byte textures), no dependencies.
// Falls back to a plain CSS crossfade on touch / reduced-motion / no-WebGL.

type Props = {
  src: string;
  hoverSrc: string;
  alt: string;
  hoverAlt?: string;
  className?: string;
};

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Shared noise helpers (value-noise fbm) used by both passes.
const NOISE = `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0,0.0));
  float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v = 0.0, amp = 0.5;
  for(int i=0;i<5;i++){ v += amp*vnoise(p); p *= 2.02; amp *= 0.5; }
  return v;
}`;

// Sim pass: evolve the reveal field (stored in .r). Brush in at cursor, bleed
// outward via noise-warped sampling + growth, decay over time.
const SIM_FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_field;
uniform vec2 u_texel;     // 1/fieldResolution
uniform vec2 u_cursor;    // uv, or (-1) when absent
uniform float u_brush;    // brush strength (pointer present/speed)
uniform float u_decay;    // per-frame persistence (high = fills, low = recedes)
uniform float u_time;
${NOISE}
void main(){
  float prev = texture2D(u_field, v_uv).r;

  // Noise-warped neighbour sampling -> organic capillary bleed (ink fingering).
  vec2 warp = vec2(
    fbm(v_uv*6.0 + u_time*0.15),
    fbm(v_uv*6.0 - u_time*0.13 + 5.2)
  ) - 0.5;
  float spread = 0.0;
  for(int i=0;i<8;i++){
    float a = float(i) * 0.785398; // 2pi/8
    vec2 dir = vec2(cos(a), sin(a));
    vec2 off = (dir + warp*1.0) * u_texel * 1.5;
    spread = max(spread, texture2D(u_field, v_uv + off).r);
  }

  // Persistence (recedes when not fed) + slow capillary spread from neighbours
  // (the 0.985 gain throttles how fast the ink creeps outward).
  float v = prev * u_decay;
  v = max(v, spread * 0.985);

  // Brush: a small soft gaussian at the cursor seeds/feeds the ink source.
  if(u_cursor.x >= 0.0){
    float d = distance(v_uv, u_cursor);
    v = max(v, exp(-d*d / 0.006) * u_brush);
  }

  gl_FragColor = vec4(clamp(v,0.0,1.0), 0.0, 0.0, 1.0);
}`;

// Display pass: composite photo -> hover image through the field, with a noisy
// living boundary and an accent-red glow rim at the dissolve front.
const DISPLAY_FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_field;
uniform sampler2D u_base;
uniform sampler2D u_hover;
uniform float u_time;
uniform vec2 u_baseScale;   // object-cover scale for base
uniform vec2 u_hoverScale;  // object-cover scale for hover
${NOISE}
vec2 cover(vec2 uv, vec2 s){ return (uv - 0.5) * s + 0.5; }
void main(){
  float field = texture2D(u_field, v_uv).r;
  // Gentle, low-frequency undulation so the front feels organic yet calm.
  float n = fbm(v_uv*3.0 + u_time*0.12) - 0.5;
  float reveal = smoothstep(0.16, 0.44, field + n*0.07);

  vec3 base = texture2D(u_base, cover(v_uv, u_baseScale)).rgb;
  vec3 hover = texture2D(u_hover, cover(v_uv, u_hoverScale)).rgb;
  vec3 col = mix(base, hover, reveal);

  // Crisp white hairline tracing the dissolve front (no glow, never blooms).
  float active = step(0.03, field) * (1.0 - step(0.97, field));
  float line = 1.0 - smoothstep(0.0, 0.06, abs(reveal - 0.5));
  col = mix(col, vec3(1.0), line * active * 0.85);

  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) ?? "shader compile failed");
  }
  return sh;
}

function program(gl: WebGLRenderingContext, vert: string, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? "program link failed");
  }
  return p;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// object-cover scale factor: how much to scale uv so the image fills the canvas.
function coverScale(imgW: number, imgH: number, cw: number, ch: number) {
  const imgAspect = imgW / imgH;
  const boxAspect = cw / ch;
  return imgAspect > boxAspect
    ? [boxAspect / imgAspect, 1] // image wider -> crop sides
    : [1, imgAspect / boxAspect]; // image taller -> crop top/bottom
}

export default function DissolveImage({
  src,
  hoverSrc,
  alt,
  hoverAlt = "",
  className = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    // Note: we no longer bail on touch. On a touchscreen the fine-pointer
    // listeners below simply never fire, and the global touch-paint controller
    // drives the brush from the finger instead (see registerPaintTarget below).
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    if (!canvasRef.current || !wrapRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;
    const wrap: HTMLDivElement = wrapRef.current;

    const glCtx = (canvas.getContext("webgl", {
      premultipliedAlpha: false,
      antialias: false,
    }) || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!glCtx) return;
    const gl: WebGLRenderingContext = glCtx;

    let disposed = false;
    let raf = 0;
    // The reveal field is a fixed-size square in uv space (it's a soft mask, so
    // resolution-independence keeps the texel math and FBO size consistent).
    const FIELD = 256;
    const fieldW = FIELD;
    const fieldH = FIELD;

    // Geometry: fullscreen triangle.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    let simProg: WebGLProgram;
    let dispProg: WebGLProgram;
    try {
      simProg = program(gl, VERT, SIM_FRAG);
      dispProg = program(gl, VERT, DISPLAY_FRAG);
    } catch (e) {
      console.error("[DissolveImage]", e);
      return;
    }

    function bindPos(prog: WebGLProgram) {
      const loc = gl.getAttribLocation(prog, "a_pos");
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }

    function makeFieldTex() {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fieldW, fieldH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }

    let texA = makeFieldTex();
    let texB = makeFieldTex();
    const fbo = gl.createFramebuffer();

    function imageTexture(img: HTMLImageElement) {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }

    // Pointer state.
    const cursor = { x: -1, y: -1, brush: 0, inside: false };
    let leaveTime = -1e9;
    // Seed the brush at a point in the tile's local space (uv, Y flipped for GL).
    const seed = (clientX: number, clientY: number) => {
      const r = wrap.getBoundingClientRect();
      cursor.x = (clientX - r.left) / r.width;
      cursor.y = 1 - (clientY - r.top) / r.height;
      cursor.inside = true;
      cursor.brush = 1;
      ensureRunning();
    };
    const release = () => {
      cursor.inside = false;
      cursor.x = -1;
      cursor.y = -1;
      leaveTime = performance.now();
      ensureRunning();
    };

    // Fine pointer (mouse / pen). Touch pointers are handled by the global
    // controller, so ignore them here to avoid double-driving the brush.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      seed(e.clientX, e.clientY);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      release();
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerenter", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    // Touch: a finger dragging across the grid paints whichever tile it's over.
    const unsubPaint = registerPaintTarget(wrap, (p) => {
      if (p) seed(p.clientX, p.clientY);
      else release();
    });

    let baseTex: WebGLTexture | null = null;
    let hoverTex: WebGLTexture | null = null;
    let baseScale: [number, number] = [1, 1];
    let hoverScale: [number, number] = [1, 1];
    let ready = false;

    function resize() {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    function computeScales(base: HTMLImageElement, hover: HTMLImageElement) {
      const r = wrap.getBoundingClientRect();
      baseScale = coverScale(base.width, base.height, r.width, r.height) as [number, number];
      hoverScale = coverScale(hover.width, hover.height, r.width, r.height) as [number, number];
    }

    const startTime = performance.now();
    function render() {
      raf = 0;
      if (disposed || !ready) return;
      const now = performance.now();
      const t = (now - startTime) / 1000;

      // While the cursor is inside, keep feeding ink at full strength so the
      // dissolve bleeds outward to fill the whole image; on leave it recedes.
      cursor.brush = cursor.inside ? 1 : 0;
      const decay = cursor.inside ? 0.994 : 0.95; // recede faster after leaving

      // --- sim pass: texA -> texB ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texB, 0);
      gl.viewport(0, 0, fieldW, fieldH);
      gl.useProgram(simProg);
      bindPos(simProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texA);
      gl.uniform1i(gl.getUniformLocation(simProg, "u_field"), 0);
      gl.uniform2f(gl.getUniformLocation(simProg, "u_texel"), 1 / fieldW, 1 / fieldH);
      gl.uniform2f(gl.getUniformLocation(simProg, "u_cursor"), cursor.x, cursor.y);
      gl.uniform1f(gl.getUniformLocation(simProg, "u_brush"), cursor.brush);
      gl.uniform1f(gl.getUniformLocation(simProg, "u_decay"), decay);
      gl.uniform1f(gl.getUniformLocation(simProg, "u_time"), t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      [texA, texB] = [texB, texA]; // ping-pong

      // --- display pass: to screen ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(dispProg);
      bindPos(dispProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texA);
      gl.uniform1i(gl.getUniformLocation(dispProg, "u_field"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, baseTex);
      gl.uniform1i(gl.getUniformLocation(dispProg, "u_base"), 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, hoverTex);
      gl.uniform1i(gl.getUniformLocation(dispProg, "u_hover"), 2);
      gl.uniform1f(gl.getUniformLocation(dispProg, "u_time"), t);
      gl.uniform2f(gl.getUniformLocation(dispProg, "u_baseScale"), baseScale[0], baseScale[1]);
      gl.uniform2f(gl.getUniformLocation(dispProg, "u_hoverScale"), hoverScale[0], hoverScale[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Keep running while hovering, and for a beat after leaving so the
      // dissolve-back animation plays out before the loop idles.
      if (cursor.inside || now - leaveTime < 2000) {
        ensureRunning();
      }
    }

    function ensureRunning() {
      if (!raf && !disposed) raf = requestAnimationFrame(render);
    }

    Promise.all([loadImage(src), loadImage(hoverSrc)])
      .then(([base, hover]) => {
        if (disposed) return;
        resize();
        baseTex = imageTexture(base);
        hoverTex = imageTexture(hover);
        computeScales(base, hover);
        ro.disconnect();
        ro.observe(wrap);
        const onResize = () => computeScales(base, hover);
        window.addEventListener("resize", onResize);
        ready = true;
        setWebgl(true);
        // Prime one frame so the canvas shows the base image immediately.
        ensureRunning();
        cleanupResize = () => window.removeEventListener("resize", onResize);
      })
      .catch((e) => console.error("[DissolveImage] image load failed", e));

    let cleanupResize = () => {};

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      cleanupResize();
      unsubPaint();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerenter", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      const lose = gl.getExtension("WEBGL_lose_context");
      lose?.loseContext();
    };
  }, [src, hoverSrc]);

  return (
    <div ref={wrapRef} data-dissolve className={className}>
      {/* Base photo: SSR / LCP / resting state, and the fallback layer. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* CSS crossfade fallback when WebGL is not active (touch / reduced / unsupported). */}
      {!webgl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={hoverSrc}
          alt={hoverAlt}
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-[var(--ease-out-extreme)] group-hover:opacity-100"
        />
      )}
      {/* WebGL canvas overlay (revealed only once initialised). */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300 ${
          webgl ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
