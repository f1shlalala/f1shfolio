"use client";

import { useEffect, useRef, useState } from "react";

// PROTOTYPE — single WebGL context (one canvas, switchable `variant`). Six
// refined "liquid / premium" and "ASCII-resolves" transitions between the
// resting ASCII (src) and the photo (hoverSrc), cursor + eased progress driven.
//   1 ripple · 2 glass lens · 3 flowing wipe · 4 pixel-resolve · 5 focus pull · 6 liquid melt

type Props = {
  src: string;
  hoverSrc: string;
  variant: number;
  className?: string;
};

const VERT = `
attribute vec2 a_pos; varying vec2 v_uv;
void main(){ v_uv = a_pos*0.5+0.5; gl_Position = vec4(a_pos,0.0,1.0); }`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_base;   // ascii (rest)
uniform sampler2D u_hover;  // photo
uniform vec2 u_baseScale, u_hoverScale, u_aspect;
uniform vec2 u_cursor;      // uv (y-up); (-1) if absent
uniform float u_progress, u_time;
uniform int u_variant;

vec2 cover(vec2 uv, vec2 s){ return (uv-0.5)*s + 0.5; }
vec3 A(vec2 uv){ return texture2D(u_base, cover(uv,u_baseScale)).rgb; }
vec3 P(vec2 uv){ return texture2D(u_hover, cover(uv,u_hoverScale)).rgb; }

void main(){
  vec2 cur = u_cursor.x < 0.0 ? vec2(0.5) : u_cursor;
  float p = u_progress;
  float t = u_time;
  vec3 col;
  float seam = 0.0; // white edge accent amount

  if(u_variant == 1){
    // RIPPLE — refractive concentric wavefront blooming from the cursor.
    float d = distance(v_uv*u_aspect, cur*u_aspect);
    float radius = p*1.25;
    float reveal = smoothstep(radius, radius-0.14, d);
    float wave = sin(d*42.0 - t*5.0) * exp(-d*3.5) * reveal;
    vec2 dir = normalize(v_uv - cur + 0.0001);
    vec2 disp = dir * wave * 0.025;
    col = mix(A(v_uv), P(v_uv + disp), reveal);
    col += vec3(1.0) * abs(wave) * 0.12; // soft specular on the ripple
  } else if(u_variant == 2){
    // GLASS LENS — a liquid droplet tracks the cursor and refracts the photo.
    float d = distance(v_uv*u_aspect, cur*u_aspect);
    float R = 0.30;
    float inside = smoothstep(R, R*0.55, d);
    vec2 dir = (v_uv - cur);
    float bend = 1.0 - smoothstep(0.0, R, d);
    vec2 disp = dir * bend * bend * 0.5;
    col = mix(A(v_uv), P(v_uv - disp), inside * smoothstep(0.0,0.12,p));
    float rim = smoothstep(R, R*0.85, d) * (1.0 - smoothstep(R*0.85, R*0.7, d));
    col += vec3(1.0) * rim * 0.25;
  } else if(u_variant == 3){
    // FLOWING WIPE — seam follows cursor X, edge undulates on a smooth flow.
    float flow = sin(v_uv.y*6.0 + t*1.4)*0.03 + sin(v_uv.y*13.0 - t*0.9)*0.015;
    float s = cur.x + flow;
    float reveal = smoothstep(s+0.008, s-0.008, v_uv.x) * smoothstep(0.0,0.12,p);
    float edge = 1.0 - smoothstep(0.0, 0.05, abs(v_uv.x - s));
    vec2 disp = vec2(edge*0.03*sign(s - v_uv.x), 0.0);
    col = mix(A(v_uv), P(v_uv + disp), reveal);
    col += vec3(1.0) * edge * reveal * 0.10;
  } else if(u_variant == 4){
    // PIXEL-RESOLVE — chunky blocks (ASCII grid) sharpen into the photo.
    float d = distance(v_uv*u_aspect, cur*u_aspect);
    float sharp = clamp(p*1.4 - d*0.45, 0.0, 1.0);
    float blocks = mix(7.0, 190.0, sharp*sharp);
    vec2 quv = (floor(v_uv*blocks)+0.5)/blocks;
    float reveal = smoothstep(0.04, 0.45, sharp);
    col = mix(A(v_uv), P(quv), reveal);
  } else if(u_variant == 5){
    // FOCUS PULL — ASCII is defocused; photo resolves sharp around the cursor.
    float d = distance(v_uv*u_aspect, cur*u_aspect);
    float focus = clamp(p*1.3 - d*0.5, 0.0, 1.0);
    float b = (1.0 - focus) * 0.012;
    vec3 blur = (P(v_uv) + P(v_uv+vec2(b,0.)) + P(v_uv-vec2(b,0.))
               + P(v_uv+vec2(0.,b)) + P(v_uv-vec2(0.,b))) / 5.0;
    vec3 photo = mix(blur, P(v_uv), focus);
    col = mix(A(v_uv), photo, smoothstep(0.0,0.55,focus));
  } else {
    // LIQUID MELT — the ASCII drips away and the photo flows down to fill.
    float drip = sin(v_uv.x*16.0)*0.5 + 0.5;
    float front = p*1.35 * (0.65 + 0.6*drip);
    float fy = 1.0 - v_uv.y; // measure from top
    float reveal = smoothstep(front-0.04, front+0.04, fy);
    reveal = 1.0 - reveal; // photo at top, flowing down
    float edge = 1.0 - smoothstep(0.0, 0.06, abs(fy - front));
    vec2 disp = vec2(0.0, edge*0.04);
    col = mix(A(v_uv + disp), P(v_uv), reveal);
    col += vec3(1.0) * edge * reveal * 0.08;
  }

  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(sh) ?? "compile failed");
  return sh;
}
function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}
function coverScale(iw: number, ih: number, cw: number, ch: number) {
  const ia = iw / ih,
    ba = cw / ch;
  return ia > ba ? [ba / ia, 1] : [1, ia / ba];
}

export default function PrototypeDissolve({ src, hoverSrc, variant, className = "" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const variantRef = useRef(variant);
  variantRef.current = variant;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!wrapRef.current || !canvasRef.current) return;
    const wrap: HTMLDivElement = wrapRef.current;
    const canvas: HTMLCanvasElement = canvasRef.current;
    const glCtx = (canvas.getContext("webgl", { antialias: false }) ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!glCtx) return;
    const gl: WebGLRenderingContext = glCtx;

    let disposed = false;
    let raf = 0;
    let W = 1,
      H = 1;

    const prog = gl.createProgram()!;
    try {
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(prog) ?? "link failed");
    } catch (e) {
      console.error("[PrototypeDissolve]", e);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);

    function tex(img: HTMLImageElement) {
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

    let baseTex: WebGLTexture | null = null,
      hoverTex: WebGLTexture | null = null;
    let baseScale: [number, number] = [1, 1],
      hoverScale: [number, number] = [1, 1],
      aspect: [number, number] = [1, 1];
    const cursor = { x: -1, y: -1, inside: false };
    let progress = 0,
      target = 0;

    function resize() {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width * dpr));
      H = Math.max(1, Math.round(r.height * dpr));
      canvas.width = W;
      canvas.height = H;
      aspect = [r.width / r.height, 1];
    }
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      cursor.x = (e.clientX - r.left) / r.width;
      cursor.y = 1 - (e.clientY - r.top) / r.height;
      cursor.inside = true;
      target = 1;
      run();
    };
    const onLeave = () => {
      cursor.inside = false;
      target = 0;
      run();
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerenter", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    const start = performance.now();
    function frame() {
      raf = 0;
      if (disposed || !baseTex) return;
      progress += (target - progress) * 0.1;
      const t = (performance.now() - start) / 1000;
      gl.viewport(0, 0, W, H);
      gl.useProgram(prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, baseTex);
      gl.uniform1i(U("u_base"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, hoverTex);
      gl.uniform1i(U("u_hover"), 1);
      gl.uniform2f(U("u_baseScale"), baseScale[0], baseScale[1]);
      gl.uniform2f(U("u_hoverScale"), hoverScale[0], hoverScale[1]);
      gl.uniform2f(U("u_aspect"), aspect[0], aspect[1]);
      gl.uniform2f(U("u_cursor"), cursor.x, cursor.y);
      gl.uniform1f(U("u_progress"), progress);
      gl.uniform1f(U("u_time"), t);
      gl.uniform1i(U("u_variant"), variantRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (cursor.inside || progress > 0.002) run();
    }
    function run() {
      if (!raf && !disposed) raf = requestAnimationFrame(frame);
    }

    Promise.all([loadImage(src), loadImage(hoverSrc)])
      .then(([b, h]) => {
        if (disposed) return;
        resize();
        baseTex = tex(b);
        hoverTex = tex(h);
        const r = wrap.getBoundingClientRect();
        baseScale = coverScale(b.width, b.height, r.width, r.height) as [number, number];
        hoverScale = coverScale(h.width, h.height, r.width, r.height) as [number, number];
        setReady(true);
        run();
      })
      .catch((e) => console.error("[PrototypeDissolve] load", e));

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerenter", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      // NOTE: intentionally not calling loseContext() — StrictMode remounts
      // reuse this canvas's context; losing it would break the re-mount.
    };
  }, [src, hoverSrc]);

  // Redraw once when the variant changes while idle (so the swap is visible).
  useEffect(() => {
    // The render loop reads variantRef each frame; nudge a frame if idle.
    const id = requestAnimationFrame(() => {});
    return () => cancelAnimationFrame(id);
  }, [variant]);

  return (
    <div ref={wrapRef} className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-200 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
