// КРЕСЛО ИЗ ЛИСТА ПО ЕЁ ЧЕРТЕЖУ 1 НОЯБ. — то самое, что в ролике «ружа» (4 нояб.). Её слово 4 нояб.: «нам нужно вот это вот
// кресло поставить в центр куба… на пол в центр… на нижнюю часть». НЕ построено заново: данные — копия
// ~/Projects/кресло/видео-стена/кресло-диван.json (развёртка, 375 прорезей, углы сгибов, ножки), код складывания и оболочки —
// перенесён из ~/Projects/кресло/видео-стена/диван.html (folder, chair) без изменений формы. Ножки «1» — её выбор: задняя 41°
// от отвеса, сиденье −5°, перёд сиденья 339 мм, передняя ножка со скосами 30 → 20 мм. Рыжая миллиметровка на бумаге, синим —
// только прорези в окне куска 440 × 600; контур везде рыжий (её поправка 4 нояб.). Прорези — насквозь.
// 6 нояб. (её слово: «кресло… с новым узлом… заменить его на сайте… у нас там зигзаг, а надо новый узел с чикагскими винтами»):
// данные — копия ~/Projects/кресло/видео-стена/кресло-диван-узелА.json (тот же лист, шов уха и подлокотника — пазл узла А
// вместо зигзага, отверстия, 3 винта Чикаго с каждой стороны); лист теперь толщиной 15 мм и стоит на ножках касанием.
// Нового против ролика два: середина следа — в начале координат (ставит куб), и тень на полу (в ролике её давал лист на диване;
// в кубе свет рассеянный со всех граней — тень считана сверху: где над полом есть лист, там темнее, чем ниже лист — тем резче).
// Пол y = 0, кресло смотрит на +z. Метры.
const rad = d => d * Math.PI / 180;
const ORANGE = [255 / 255, 150 / 255, 92 / 255], BLUE = [30 / 255, 80 / 255, 230 / 255], PAPER = [222 / 255, 218 / 255, 211 / 255];
const LINES = `
float fam(vec2 u, float s, float w) {
  vec2 px = max(fwidth(u), vec2(1e-5));
  vec2 dist = abs(fract(u / s + .5) - .5) * s / px;
  vec2 wpx = max(w / px, vec2(.8));
  vec2 cov = min(wpx, 1.) * clamp(max(wpx, 1.) * .5 + .5 - dist, 0., 1.);
  float dense = smoothstep(5., 2., s / max(px.x, px.y));
  return mix(max(cov.x, cov.y), min(1., 2. * w / s), dense);
}`;

// ── складывание листа (расчёт/кинематика.py) — как в диван.html
function folder(K) {
  const o1 = [0, 0];
  const bendSZ = (s, z, th, s0, w, o) => { const d = s - s0;
    if (Math.abs(th) < 1e-9 || d < 0) { o[0] = s; o[1] = z; return; }
    const R = w / th, phi = Math.min(d, w) / R, r = R - z, ext = Math.max(d - w, 0);
    o[0] = s0 + r * Math.sin(phi) + ext * Math.cos(phi); o[1] = R - r * Math.cos(phi) + ext * Math.sin(phi); };
  const rigidCenter = (th, s0, w) => { const R = w / th, c = Math.cos(th), s = Math.sin(th), vx = s0 + w, vy = R;
    const rx = s0 - (c * vx - s * vy), ry = R - (s * vx + c * vy), a = 1 - c, b = s, cc = -s, d = 1 - c, det = a * d - b * cc;
    return [(d * rx - b * ry) / det, (-cc * rx + a * ry) / det]; };
  return (X, Y, U, out, k, z0 = 0) => {   // z0 — мм от опорной поверхности сгиба (лист толщиной 15: наружу −4,9, внутрь +10,1)
    const sg = X < 0 ? -1 : 1, a = Math.abs(X); let x = a, y = Y, z = z0;
    if (!U.Q) U.Q = U.sh > 1e-9 ? rigidCenter(U.sh, K.YSH, K.W) : [0, 0];
    const up = Y >= K.YSB && !(a > K.A0 && Y < K.YSB + K.W);
    if (up) {
      if (a > K.A0) { bendSZ(a, z0, U.wing, K.A0 + K.Pa, K.W, o1); x = o1[0]; z = o1[1]; }
      const th = U.sh;
      if (th > 1e-9 && Y > Math.min(K.YSH, K.YCB0)) {
        bendSZ(y, z, th, K.YSH, K.W, o1);
        if (a <= K.A0) { y = o1[0]; z = o1[1]; }
        else { const u = Math.min(Math.max((a - K.A0) / K.W, 0), 1);
          const lo = K.YSH + (K.YCB0 - K.YSH) * u, hi = K.YSH + K.W + (K.YCB1 - K.YSH - K.W) * u;
          const t = Math.min(Math.max((Y - lo) / (hi - lo), 0), 1);
          const Qc = U.Q, an = th * t, c = Math.cos(an), s = Math.sin(an), dy = y - Qc[0], dz = z - Qc[1];
          y = (1 - u) * o1[0] + u * (Qc[0] + c * dy - s * dz); z = (1 - u) * o1[1] + u * (Qc[1] + s * dy + c * dz); }
      }
      bendSZ(y, z, U.back, K.YSB + K.Pb, K.W, o1); y = o1[0]; z = o1[1];
    } else if (a > K.A0) { bendSZ(a, z0, U.arm, K.A0 + K.Pa, K.W, o1); x = o1[0]; z = o1[1]; }
    out[k] = sg * x; out[k + 1] = z; out[k + 2] = -y;
  };
}

function canvasOf(B, mmpx, draw) {
  const c = document.createElement('canvas'); c.width = Math.ceil((B[2] - B[0]) / mmpx); c.height = Math.ceil((B[3] - B[1]) / mmpx);
  const g = c.getContext('2d'); const T = p => [(p[0] - B[0]) / mmpx, c.height - (p[1] - B[1]) / mmpx];
  draw(g, T, c); return c;
}

// mm — миллиметров листа на точку чертежа: в ролике 0,4 (кадр 4K вблизи); в кубе кресло видно с 1–7 м — 0,5, на телефоне 0,7
// (иначе одна картинка 2800 × 3800 точек — на телефоне на пределе памяти)
export async function chairSofa(THREE, renderer, { url = 'кресло-диван.json', mm = 0.5 } = {}) {
  const D = await (await fetch(url)).json(), K = D.K, A = D.angles;
  const B = [D.bbox[0] - 2, D.bbox[1] - 2, D.bbox[2] + 2, D.bbox[3] + 2];
  const MM = mm;
  const fold = folder(K), U = { arm: rad(A.arm), back: rad(A.back), wing: rad(A.wing), sh: rad(A.sh) };
  const mask = canvasOf(B, 0.75, (g, T) => { g.fillStyle = '#fff'; g.beginPath(); D.contour.forEach((p, i) => i ? g.lineTo(...T(p)) : g.moveTo(...T(p))); g.fill(); });
  const MD = mask.getContext('2d').getImageData(0, 0, mask.width, mask.height).data;
  const inside = (X, Y) => { const i = Math.floor((X - B[0]) / 0.75), j = Math.floor(mask.height - (Y - B[1]) / 0.75);
    return i >= 0 && j >= 0 && i < mask.width && j < mask.height && MD[(j * mask.width + i) * 4 + 3] > 0; };
  const P = D.piece;
  const draw = canvasOf(B, MM, (g, T, c) => {
    g.lineJoin = 'round';
    const pass = (color, clip) => { g.save(); g.beginPath();
      if (clip === 'in') { const a = T([P[0], P[3]]), b = T([P[2], P[1]]); g.rect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
      else { g.rect(0, 0, c.width, c.height); const a = T([P[0], P[3]]), b = T([P[2], P[1]]); g.rect(a[0], b[1], b[0] - a[0], a[1] - b[1]); }
      g.clip('evenodd'); g.strokeStyle = color;
      g.lineWidth = 1.5 / MM;   // насквозь: половина линии уходит в дырку — каёмка 0,75 мм
      for (const s of D.slots) { g.beginPath(); s.forEach((p, i) => i ? g.lineTo(...T(p)) : g.moveTo(...T(p))); g.closePath(); g.stroke(); }
      g.restore(); };
    pass('rgb(255,0,0)', 'out'); pass('rgb(0,0,255)', 'in');        // красный канал — рыжие линии, синий — синие
    g.strokeStyle = 'rgb(255,0,0)'; g.lineWidth = 1.6 / MM; g.beginPath(); D.contour.forEach((p, i) => i ? g.lineTo(...T(p)) : g.moveTo(...T(p))); g.closePath(); g.stroke();
    // отверстия под винты Чикаго (узел А, 5 нояб.) — тоже чертежом, рыжим, как в ролике «узел А»
    if (D.screw) for (const h of (D.holes || [])) { const c = T(h); g.beginPath(); g.arc(c[0], c[1], D.screw.hole_d / 2 / MM, 0, 2 * Math.PI); g.stroke(); }
  });
  const cut = canvasOf(B, MM, (g, T) => { g.fillStyle = '#fff'; g.beginPath(); D.contour.forEach((p, i) => i ? g.lineTo(...T(p)) : g.moveTo(...T(p))); g.fill();
    g.globalCompositeOperation = 'destination-out';
    for (const sl of D.slots) { g.beginPath(); sl.forEach((p, i) => i ? g.lineTo(...T(p)) : g.moveTo(...T(p))); g.closePath(); g.fill(); }
    if (D.screw) for (const h of (D.holes || [])) { const c = T(h); g.beginPath(); g.arc(c[0], c[1], D.screw.hole_d / 2 / MM, 0, 2 * Math.PI); g.fill(); } });
  const maskTex = new THREE.CanvasTexture(cut); maskTex.generateMipmaps = false; maskTex.minFilter = maskTex.magFilter = THREE.LinearFilter;
  const drawTex = new THREE.CanvasTexture(draw); drawTex.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
  drawTex.minFilter = THREE.LinearMipmapLinearFilter; drawTex.colorSpace = THREE.NoColorSpace;
  // сетка вершин: в полосах сгиба через 1,5 мм, на плоском через 5 мм
  const axis = (lo, hi, dense, marks) => { const v = [];
    for (let s = lo; s < hi;) { v.push(s); s += dense.some(([a, b]) => s >= a && s < b) ? 1.5 : 5; }
    v.push(hi, ...marks.filter(m => m > lo && m < hi)); v.sort((a, b) => a - b); return v.filter((s, i) => i === 0 || s - v[i - 1] > 0.3); };
  const xa = [K.A0 + K.Pa - 3, K.A0 + K.Pa + K.W + 3];
  const xs = axis(B[0], B[2], [xa, [-xa[1], -xa[0]]], [K.A0, K.A0 + K.Pa, K.A0 + K.Pa + K.W, K.A0 + K.W].flatMap(m => [m, -m]));
  const ys = axis(B[1], B[3], [[K.YSB + K.Pb - 3, K.YSB + K.Pb + K.W + 3], [Math.min(K.YSH, K.YCB0) - 3, Math.max(K.YSH + K.W, K.YCB1) + 3]],
    [K.YSB, K.YSB + K.Pb, K.YSB + K.Pb + K.W, K.YSB + K.W, K.YSH, K.YSH + K.W, K.YCB0, K.YCB1]);
  const NX = xs.length, NY = ys.length, flat = new Float32Array(NX * NY * 2), pos = new Float32Array(NX * NY * 3);
  for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) { const k = i * NY + j; flat[2 * k] = xs[i]; flat[2 * k + 1] = ys[j]; fold(xs[i], ys[j], U, pos, 3 * k); }
  const idx = [];
  for (let i = 0; i < NX - 1; i++) for (let j = 0; j < NY - 1; j++) {
    const x0 = xs[i], x1 = xs[i + 1], y0 = ys[j], y1 = ys[j + 1], xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
    if (inside(x0, y0) || inside(x1, y0) || inside(x0, y1) || inside(x1, y1) || inside(xm, ym) || inside(xm, y0) || inside(xm, y1) || inside(x0, ym) || inside(x1, ym)) {
      const a = i * NY + j, b = a + NY; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(flat, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const shade = `float lit(vec3 n) { return clamp(.70 + .18 * n.z + .20 * n.x + .12 * n.y, .42, 1.04); }`;
  const uni = { uOr: { value: new THREE.Vector3(...ORANGE) }, uBl: { value: new THREE.Vector3(...BLUE) }, uPaper: { value: new THREE.Vector3(...PAPER) },
    uMask: { value: maskTex }, uDraw: { value: drawTex }, uBox: { value: new THREE.Vector4(B[0], B[1], B[2] - B[0], B[3] - B[1]) } };
  const mat = new THREE.ShaderMaterial({ uniforms: uni, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform vec3 uOr, uBl, uPaper; uniform sampler2D uMask, uDraw; uniform vec4 uBox; varying vec2 vUv; varying vec3 vN;` + LINES + shade + `
void main(){ vec2 t = (vUv - uBox.xy) / uBox.zw;
  if (texture2D(uMask, t).a < .5) discard;
  vec3 n0 = normalize(vN); vec3 c = uPaper * lit(gl_FrontFacing ? n0 : -n0);
  float g = 1. - (1. - fam(vUv, 1., .1) * .22) * (1. - fam(vUv, 10., .4) * .5);     // миллиметровка бумаги — тихо
  c = mix(c, min(c, uOr), g * .55);
  vec4 d = texture2D(uDraw, t);
  float ao = d.r * d.a, ab = d.b * d.a;
  c = mix(c, min(c, uOr * .92), clamp(ao * 1.4, 0., 1.));
  c = mix(c, uBl, clamp(ab * 1.6, 0., 1.));
  gl_FragColor = vec4(c, 1.); }` });
  const shell = new THREE.Mesh(geo, mat);
  // ── узел А (её правка 5 нояб.: 2 пальца 30 × 55, R4, 3 винта Чикаго; ролик «узел А» 6 нояб.) — вместо зигзага шва уха
  // и подлокотника. Перенесено из ~/Projects/кресло/видео-стена/узел.html, без разреза и подсветок ролика: лист настоящей
  // толщины 15 мм — наружная грань −4,9, внутренняя +10,1 от опорной поверхности сгиба; торцы — по контуру и прорезям;
  // по шву пазла торцов нет (там ухо и подлокотник смыкаются — внутри сплошного листа). Винт: трубка Ø5 сквозь лист,
  // шляпки Ø10 × 2 с обеих сторон, синие — как в ролике (её слово 5 нояб.: латунь «как-то не очень… синеньким»).
  const THICK = !!D.screws, ZO = -4.89, ZI = 10.11, толща = [], винты = [];
  let шовКвадов = 0;
  if (THICK) {
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) fold(xs[i], ys[j], U, pos, 3 * (i * NY + j), ZO);
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
    const posI = new Float32Array(NX * NY * 3);
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) fold(xs[i], ys[j], U, posI, 3 * (i * NY + j), ZI);
    const geoI = new THREE.BufferGeometry(); geoI.setAttribute('position', new THREE.BufferAttribute(posI, 3)); geoI.setAttribute('uv', geo.attributes.uv);
    geoI.setIndex(idx); geoI.computeVertexNormals(); толща.push(new THREE.Mesh(geoI, mat));
    // торцы: кольца контура и прорезей; отверстия торцов не получают — их целиком занимает трубка винта Ø5
    const кольца = [D.contour, ...D.slots].map(r => { const R = r.slice(), f = R[0], l = R[R.length - 1]; if (f[0] === l[0] && f[1] === l[1]) R.pop(); return R; });
    const SC = D.screw, ШВЫ = D.seams || [], ДЫРЫ = D.holes || [];
    const sb = ШВЫ.flat().reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [1e9, 1e9, -1e9, -1e9]);
    const наШве = (x, y) => { if (x < sb[0] - 1 || x > sb[2] + 1 || y < sb[1] - 1 || y > sb[3] + 1) return false;
      for (const h of ДЫРЫ) if (Math.hypot(x - h[0], y - h[1]) < SC.hole_d / 2 + .6) return false;
      for (const L of ШВЫ) for (let i = 0; i < L.length - 1; i++) { const [ax, ay] = L[i], [bx, by] = L[i + 1], dx = bx - ax, dy = by - ay;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1e-12)));
        if (Math.hypot(ax + t * dx - x, ay + t * dy - y) < 0.45) return true; } return false; };
    const nW = кольца.reduce((a, r) => a + r.length, 0), wPos = new Float32Array(nW * 6), wUv = new Float32Array(nW * 4), wIdx = [];
    let base = 0, швом = 0;
    for (const r of кольца) { const n = r.length, шов = r.map(q => наШве(q[0], q[1]));
      for (let i = 0; i < n; i++) { const A0 = base + 2 * i, A1 = A0 + 1, B0 = base + 2 * ((i + 1) % n), B1 = B0 + 1;
        fold(r[i][0], r[i][1], U, wPos, 3 * A0, ZO); fold(r[i][0], r[i][1], U, wPos, 3 * A1, ZI);
        wUv.set([r[i][0], ZO, r[i][0], ZI], 2 * A0);
        if (шов[i] && шов[(i + 1) % n]) швом++; else wIdx.push(A0, B0, A1, B0, B1, A1); }
      base += 2 * n; }
    const wallGeo = new THREE.BufferGeometry(); wallGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
    wallGeo.setAttribute('uv', new THREE.BufferAttribute(wUv, 2)); wallGeo.setIndex(wIdx);
    // торец фанеры: бумага чуть темнее граней, слои шпона (11 на 15 мм) — только вблизи, издали гаснут, чтобы не рябило
    const wallMat = new THREE.ShaderMaterial({ uniforms: uni, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vUv; varying vec3 vP; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.); vP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform vec3 uPaper; varying vec2 vUv; varying vec3 vP;` + shade + `
void main(){ vec3 n = normalize(cross(dFdx(vP), dFdy(vP))); if (dot(n, cameraPosition - vP) < 0.) n = -n; vec3 c = uPaper * .94 * lit(n);
  float u = (vUv.y + 4.89) / 15. * 11., px = fwidth(u), sl = abs(fract(u + .5) - .5);
  c *= 1. - .06 * smoothstep(.12, .0, sl) * smoothstep(.45, .15, px);
  gl_FragColor = vec4(c, 1.); }` });
    толща.push(new THREE.Mesh(wallGeo, wallMat));
    // винты
    const винтMat = new THREE.ShaderMaterial({ side: THREE.DoubleSide,
      uniforms: { uCol: { value: new THREE.Vector3(.16, .36, .92) }, uL: { value: new THREE.Vector3(.35, .8, .5).normalize() } },
      vertexShader: 'varying vec3 vN; varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: 'uniform vec3 uL, uCol; varying vec3 vN; varying vec3 vW; void main(){ vec3 n = normalize(vN); vec3 v = normalize(cameraPosition - vW); if (dot(n, v) < 0.) n = -n;' +
        ' float d = clamp(dot(n, uL), 0., 1.); vec3 h = normalize(uL + v); float sp = pow(clamp(dot(n, h), 0., 1.), 36.);' +
        ' float rim = pow(1. - clamp(dot(n, v), 0., 1.), 3.); gl_FragColor = vec4(uCol * (.40 + .62 * d) * (1. - .35 * rim) + vec3(.85, .92, 1.) * sp * .55, 1.); }' });
    const prof = [[0, 0], [SC.head_d / 2, 0], [SC.head_d / 2, SC.head_h * .5], [SC.head_d / 2 - .45, SC.head_h * .88], [SC.head_d / 2 - 1.6, SC.head_h * 1.06], [0, SC.head_h * 1.12]]
      .map(q => new THREE.Vector2(q[0], q[1]));
    const headGeo = new THREE.LatheGeometry(prof, 32), postGeo = new THREE.CylinderGeometry(SC.post_d / 2, SC.post_d / 2, 1, 24, 1, true).translate(0, .5, 0);
    const slotGeo = new THREE.BoxGeometry(SC.head_d * .78, 1.1, .9).translate(0, SC.head_h * 1.02, 0), slotMat = new THREE.MeshBasicMaterial({ color: 0x0b1640 });
    const po = [0, 0, 0], pi = [0, 0, 0], vy = new THREE.Vector3(0, 1, 0), dv = new THREE.Vector3();
    for (const sc of D.screws) { const g = new THREE.Group(), post = new THREE.Mesh(postGeo, винтMat), h1 = new THREE.Group(), h2 = new THREE.Mesh(headGeo, винтMat);
      h1.add(new THREE.Mesh(headGeo, винтMat), new THREE.Mesh(slotGeo, slotMat)); h1.rotation.x = Math.PI;   // шляпка со шлицем — снаружи
      fold(sc.x, sc.y, U, po, 0, ZO); fold(sc.x, sc.y, U, pi, 0, ZI);
      dv.set(pi[0] - po[0], pi[1] - po[1], pi[2] - po[2]); const L = dv.length(); dv.normalize();
      g.position.set(...po); g.quaternion.setFromUnitVectors(vy, dv); post.scale.y = L; h2.position.y = L;
      g.add(post, h1, h2); винты.push(g); }
    шовКвадов = швом;
  }
  // ножки «1» — гнутая рама по её виду сбоку: средняя линия (z назад, y вверх), полоса LT × LW; передняя сужается к полу
  const LG = D.leg, TP = LG.taper, LT = LG.LT, LW = LG.LW;
  const L = TP ? [LG.path[0], [LG.path[0][0], TP[0]], ...LG.path.slice(1)] : LG.path;
  const legMat = new THREE.ShaderMaterial({ uniforms: uni, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; varying vec3 vP; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.); vP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform vec3 uOr, uPaper; varying vec2 vUv; varying vec3 vP;` + LINES + shade + `
void main(){ vec3 n = normalize(cross(dFdx(vP), dFdy(vP))); if (dot(n, cameraPosition - vP) < 0.) n = -n; vec3 c = uPaper * lit(n);
  float g = 1. - (1. - fam(vUv, 1., .1) * .22) * (1. - fam(vUv, 10., .4) * .5); c = mix(c, min(c, uOr), g * .55);
  float e = min(min(vUv.y, ${LW.toFixed(1)} - vUv.y), 99.); float le = smoothstep(1.2, .3, e) * .9; c = mix(c, min(c, uOr * .92), le);
  gl_FragColor = vec4(c, 1.); }` });
  const legGeo = xc => {
    let s = 0; const ring = L.map((p, i) => { const q = L[Math.min(i + 1, L.length - 1)], r = L[Math.max(i - 1, 0)], tz = q[0] - r[0], ty = q[1] - r[1], tl = Math.hypot(tz, ty);
      if (i) s += Math.hypot(p[0] - L[i - 1][0], p[1] - L[i - 1][1]); return { z: p[0], y: p[1], nz: -ty / tl, ny: tz / tl, s, h: (i <= 1 && TP && p[1] < TP[0]) ? (TP[1] + (LT - TP[1]) * p[1] / TP[0]) / 2 : LT / 2 }; });
    const pos = [], uvs = [], ix = [];
    const side = f => { const base = pos.length / 3;
      for (const r of ring) for (let k = 0; k < 2; k++) { const [x, n, u2] = f(k, r); pos.push(xc + x, r.y + r.ny * n, r.z + r.nz * n); uvs.push(r.s, u2); }
      for (let i = 0; i < ring.length - 1; i++) { const a = base + 2 * i; ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } };
    side((k, r) => [k ? LW / 2 : -LW / 2, r.h, k ? LW : 0]); side((k, r) => [k ? LW / 2 : -LW / 2, -r.h, k ? LW : 0]);
    side((k, r) => [LW / 2, k ? r.h : -r.h, k ? LW : 0]); side((k, r) => [-LW / 2, k ? r.h : -r.h, k ? LW : 0]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(ix); return g; };
  // сборка в мм: пол y = 0, перёд сиденья z = 0, кресло смотрит на +z — как в ролике
  const inner = new THREE.Group();
  const tilt = new THREE.Group(); tilt.add(shell, ...толща, ...винты); tilt.rotation.x = -rad(LG.tilt ?? D.tilt); tilt.position.y = LG.seatFront ?? D.seatFront;
  inner.add(tilt);
  const XL = LG.XL || (K.A0 - 35), legs = [-XL, XL].map(xc => new THREE.Mesh(legGeo(xc), legMat)); legs.forEach(m => inner.add(m));
  // лист 15 мм стоит НА ножках (её слово 6 нояб.: «ножки… в массив кресла входят, а должны касаться»): ножки чертились под
  // опорную линию листа, а нижняя грань сиденья с толщиной — на −4,89 мм. Лист поднят по своей нормали ровно до касания — как в ролике.
  let поднят = 0;
  if (THICK) { tilt.updateMatrix(); const inv = tilt.matrix.clone().invert(), q = new THREE.Vector3(); let верх = -1e9;
    for (const m of legs) { const a = m.geometry.attributes.position;
      for (let j = 0; j < a.count; j++) { q.fromBufferAttribute(a, j).applyMatrix4(inv); if (inside(q.x, -q.z) && q.y > -40) верх = Math.max(верх, q.y); } }
    if (верх > ZO) { tilt.translateY(верх - ZO); поднят = верх - ZO; } }
  inner.scale.setScalar(0.001);
  const group = new THREE.Group(); group.add(inner); group.updateMatrixWorld(true);

  // ── середина следа — в начало координат; самая низкая точка ножек — ровно на пол (проверка: info)
  const v = new THREE.Vector3(), used = [...new Set(idx)];
  const each = (m, _, fn) => { const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); fn(v); } };
  let legMin = Infinity, shellMin = Infinity;
  legs.forEach(m => each(m, null, q => { legMin = Math.min(legMin, q.y); }));
  { const p = geo.attributes.position; for (const i of used) { v.fromBufferAttribute(p, i).applyMatrix4(shell.matrixWorld); shellMin = Math.min(shellMin, v.y); } }
  const box = new THREE.Box3().setFromObject(inner);
  inner.position.x -= (box.min.x + box.max.x) / 2; inner.position.z -= (box.min.z + box.max.z) / 2; inner.position.y -= legMin;
  group.updateMatrixWorld(true); box.setFromObject(inner);
  // касание: сколько точек каждой ножки лежит на полу (≤ 0,1 мм) и какой след они дают
  const feet = legs.map(m => { const on = []; each(m, null, q => { if (q.y < 1e-4) on.push([q.x, q.z, q.y]); });
    const xs = on.map(p => p[0]), zs = on.map(p => p[1]);
    return { точек: on.length, низ_мм: Math.min(...on.map(p => p[2])) * 1000, верх_мм: Math.max(...on.map(p => p[2])) * 1000,
      след_мм: [(Math.max(...xs) - Math.min(...xs)) * 1000, (Math.max(...zs) - Math.min(...zs)) * 1000] }; });
  const info = { ножки_низ_мм: 0, лист_низ_мм: (shellMin - legMin) * 1000, сдвиг_вверх_мм: -legMin * 1000, feet,
    толща_мм: THICK ? ZI - ZO : 0, винтов: винты.length, лист_поднят_на_ножки_мм: поднят, торцов_по_шву_не_рисуем: шовКвадов,
    размер_мм: [box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z].map(a => Math.round(a * 1000)) };

  // ── тень на полу: свет в кубе рассеянный, со всех граней — над чем есть лист, там пол темнее; низкое (ступни) — резко, высокое — мягко
  const CELL = 0.01, PAD = 0.3, x0 = box.min.x - PAD, z0 = box.min.z - PAD;
  const GX = Math.ceil((box.max.x - box.min.x + 2 * PAD) / CELL), GZ = Math.ceil((box.max.z - box.min.z + 2 * PAD) / CELL);
  const near = new Float32Array(GX * GZ), far = new Float32Array(GX * GZ);
  const put = q => { const i = Math.floor((q.x - x0) / CELL), j = Math.floor((q.z - z0) / CELL); if (i < 0 || j < 0 || i >= GX || j >= GZ) return;
    const k = j * GX + i; if (q.y < 0.05) near[k] = 1; else far[k] = Math.max(far[k], 1 / (1 + (q.y / 0.45) ** 2)); };
  { const p = geo.attributes.position; for (const i of used) { v.fromBufferAttribute(p, i).applyMatrix4(shell.matrixWorld); put(v); } }
  legs.forEach(m => { const p = m.geometry.attributes.position, a = new THREE.Vector3(), b = new THREE.Vector3();
    for (let i = 0; i + 1 < p.count; i++) { a.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); b.fromBufferAttribute(p, i + 1).applyMatrix4(m.matrixWorld);
      for (let t = 0; t <= 1; t += 0.1) put(v.lerpVectors(a, b, t)); } });
  const blur = (f, r, n) => { const t = new Float32Array(f.length);
    for (let it = 0; it < n; it++) {
      for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) { let s = 0, c = 0; for (let d = -r; d <= r; d++) { const ii = i + d; if (ii >= 0 && ii < GX) { s += f[j * GX + ii]; c++; } } t[j * GX + i] = s / (2 * r + 1); }
      for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) { let s = 0; for (let d = -r; d <= r; d++) { const jj = j + d; if (jj >= 0 && jj < GZ) s += t[jj * GX + i]; } f[j * GX + i] = s / (2 * r + 1); } } };
  blur(near, 1, 2); blur(far, 4, 3);
  const shc = document.createElement('canvas'); shc.width = GX; shc.height = GZ;
  { const c = shc.getContext('2d'), im = c.createImageData(GX, GZ);
    for (let k = 0; k < GX * GZ; k++) { const a = 1 - (1 - 0.55 * Math.min(near[k] * 1.6, 1)) * (1 - 0.32 * Math.min(far[k] * 1.3, 1)); im.data.set([a * 255, a * 255, a * 255, 255], 4 * k); }
    c.putImageData(im, 0, 0); }
  const shTex = new THREE.CanvasTexture(shc);   // строка 0 картинки — ближний к −z край (плоскость повёрнута: +y → −z)
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(GX * CELL, GZ * CELL).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: shTex, transparent: true, depthWrite: false, toneMapped: false }));
  sh.position.set(x0 + GX * CELL / 2, 0.0015, z0 + GZ * CELL / 2); sh.renderOrder = -1;
  group.add(sh);
  return { group, box, info };
}
