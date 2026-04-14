const STORAGE_KEY = "cmtv223:leads";
const THEME_KEY = "cmtv223:theme";

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (!root) return;
  if (theme === "dark") root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");
}

function toggleTheme() {
  const root = document.documentElement;
  const isDark = root?.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
  showToast(next === "dark" ? "Тёмная тема" : "Светлая тема");
}

function showToast(message) {
  const toast = qs("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("toast--show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("toast--show"), 2600);
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getLeads() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

function setLeads(leads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";

  // RU typical patterns: 8XXXXXXXXXX / 7XXXXXXXXXX / 9XXXXXXXXX
  if (digits.length === 11 && digits.startsWith("8")) return `+7${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith("7")) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith("9")) return `+7${digits}`;

  return digits.startsWith("+") ? digits : `+${digits}`;
}

function validateName(name) {
  const v = String(name || "").trim();
  if (v.length < 2) return "Введите имя (минимум 2 символа).";
  return "";
}

function validatePhone(phone) {
  const norm = normalizePhone(phone);
  const digits = norm.replace(/\D/g, "");
  if (digits.length < 10) return "Введите телефон (минимум 10 цифр).";
  return "";
}

function setFieldError(input, errorEl, message) {
  if (!input || !errorEl) return;
  errorEl.textContent = message || "";
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function scrollToTarget(selector) {
  const el = qs(selector);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatLeadsForDisplay(leads) {
  if (!leads.length) return "Заявок пока нет.";
  return leads
    .map((l, idx) => {
      const lines = [
        `#${idx + 1}`,
        `Дата: ${l.createdAt || "-"}`,
        `Услуга: ${l.service || "-"}`,
        `Имя: ${l.name || "-"}`,
        `Телефон: ${l.phone || "-"}`,
        `Возраст ребёнка: ${l.age || "-"}`,
      ];
      return lines.join("\n");
    })
    .join("\n\n---\n\n");
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getPreferredTheme());

  const serviceInput = qs("#service");
  const nameInput = qs("#name");
  const phoneInput = qs("#phone");
  const ageInput = qs("#age");
  const form = qs("#leadForm");

  const nameError = qs("#nameError");
  const phoneError = qs("#phoneError");

  const dialog = qs("#leadsDialog");
  const leadsPre = qs("#leadsPre");
  const leadsHint = qs("#leadsHint");

  const showLeadsBtn = qs("#showLeads");
  const closeDialogBtn = qs("#closeDialog");
  const clearLeadsBtn = qs("#clearLeads");
  const copyLeadsBtn = qs("#copyLeads");

  const themeToggle = qs("#themeToggle");
  themeToggle?.addEventListener("click", toggleTheme);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-scroll-to]");
    if (!btn) return;
    const target = btn.getAttribute("data-scroll-to");
    const service = btn.getAttribute("data-service");
    if (serviceInput && service) serviceInput.value = service;
    if (target) scrollToTarget(target);
    showToast(service ? `Выбрано: ${service}` : "Переходим к записи.");
  });

  function runValidation() {
    const nameMsg = validateName(nameInput?.value);
    const phoneMsg = validatePhone(phoneInput?.value);

    setFieldError(nameInput, nameError, nameMsg);
    setFieldError(phoneInput, phoneError, phoneMsg);

    return !nameMsg && !phoneMsg;
  }

  nameInput?.addEventListener("input", () => setFieldError(nameInput, nameError, validateName(nameInput.value)));
  phoneInput?.addEventListener("input", () => setFieldError(phoneInput, phoneError, validatePhone(phoneInput.value)));

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!runValidation()) {
      showToast("Проверьте поля формы.");
      return;
    }

    const lead = {
      createdAt: new Date().toLocaleString("ru-RU"),
      service: (serviceInput?.value || "Массаж").trim(),
      name: (nameInput?.value || "").trim(),
      phone: normalizePhone(phoneInput?.value),
      age: (ageInput?.value || "").trim(),
    };

    const leads = getLeads();
    leads.unshift(lead);
    setLeads(leads.slice(0, 50));

    form.reset();
    if (serviceInput) serviceInput.value = "Массаж";
    setFieldError(nameInput, nameError, "");
    setFieldError(phoneInput, phoneError, "");
    showToast("Заявка сохранена. Я свяжусь с вами в ближайшее время.");
  });

  function openLeadsDialog() {
    const leads = getLeads();
    if (leadsPre) leadsPre.textContent = formatLeadsForDisplay(leads);
    if (leadsHint) leadsHint.textContent = leads.length ? `Всего: ${leads.length}` : "Пока ничего не сохранено.";
    if (dialog?.showModal) dialog.showModal();
    else showToast("Ваш браузер не поддерживает окно заявок.");
  }

  showLeadsBtn?.addEventListener("click", openLeadsDialog);
  closeDialogBtn?.addEventListener("click", () => dialog?.close());

  clearLeadsBtn?.addEventListener("click", () => {
    setLeads([]);
    if (leadsPre) leadsPre.textContent = "Заявок пока нет.";
    if (leadsHint) leadsHint.textContent = "Очищено.";
    showToast("Сохранённые заявки очищены.");
  });

  copyLeadsBtn?.addEventListener("click", async () => {
    try {
      const text = leadsPre?.textContent || "";
      await navigator.clipboard.writeText(text);
      showToast("Скопировано в буфер обмена.");
    } catch {
      showToast("Не удалось скопировать (ограничения браузера).");
    }
  });

  // --- Target cursor (vanilla adaptation for this landing) ---
  (function mountTargetCursor() {
    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const hasTouch =
      "ontouchstart" in window ||
      (navigator.maxTouchPoints ?? 0) > 0 ||
      (navigator.msMaxTouchPoints ?? 0) > 0;

    const isSmall = window.innerWidth <= 860;
    if (hasTouch || isSmall) return;

    const opts = {
      targetSelector: ".cursor-target",
      spinDuration: 2,
      hideDefaultCursor: true,
      hoverDuration: 180, // ms
      parallaxOn: true,
      borderWidth: 3,
      cornerSize: 14,
    };

    // Auto-mark targets on this site (don’t include inputs for usability)
    const autoTargets = document.querySelectorAll(
      ".btn, .link, .nav__link, a[href], button"
    );
    autoTargets.forEach((el) => {
      if (el.matches("input, textarea, select, label")) return;
      el.classList.add("cursor-target");
    });

    const root = document.documentElement;
    root.setAttribute("data-cursor", "on");

    const cursor = document.createElement("div");
    cursor.className = "target-cursor-wrapper is-spinning";
    cursor.style.setProperty("--cursor-spin", `${opts.spinDuration}s`);
    cursor.innerHTML = `
      <div class="target-cursor-dot"></div>
      <div class="target-cursor-corner corner-tl"></div>
      <div class="target-cursor-corner corner-tr"></div>
      <div class="target-cursor-corner corner-br"></div>
      <div class="target-cursor-corner corner-bl"></div>
    `;
    document.body.appendChild(cursor);

    const dot = cursor.querySelector(".target-cursor-dot");
    const corners = Array.from(
      cursor.querySelectorAll(".target-cursor-corner")
    );

    const originalCursor = document.body.style.cursor;
    if (opts.hideDefaultCursor) document.body.style.cursor = "none";

    const state = {
      mx: window.innerWidth / 2,
      my: window.innerHeight / 2,
      cx: window.innerWidth / 2,
      cy: window.innerHeight / 2,
      active: false,
      activeTarget: null,
      strength: 0,
      targetCorners: null,
      raf: 0,
      down: false,
    };

    const defaultOffsets = [
      { x: -opts.cornerSize * 1.6, y: -opts.cornerSize * 1.6 },
      { x: opts.cornerSize * 0.6, y: -opts.cornerSize * 1.6 },
      { x: opts.cornerSize * 0.6, y: opts.cornerSize * 0.6 },
      { x: -opts.cornerSize * 1.6, y: opts.cornerSize * 0.6 },
    ];

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function setCornerTransform(corner, x, y) {
      corner.style.transform = `translate(${x}px, ${y}px)`;
    }

    // Initialize corners to default positions
    defaultOffsets.forEach((p, i) => setCornerTransform(corners[i], p.x, p.y));

    function updateStrength(target) {
      const start = performance.now();
      const from = state.strength;
      const to = target;
      function step(now) {
        const t = Math.min(1, (now - start) / Math.max(1, opts.hoverDuration));
        // easeOutCubic
        const e = 1 - Math.pow(1 - t, 3);
        state.strength = lerp(from, to, e);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function computeTargetCorners(el) {
      const r = el.getBoundingClientRect();
      const bw = opts.borderWidth;
      const cs = opts.cornerSize;
      return [
        { x: r.left - bw, y: r.top - bw },
        { x: r.right + bw - cs, y: r.top - bw },
        { x: r.right + bw - cs, y: r.bottom + bw - cs },
        { x: r.left - bw, y: r.bottom + bw - cs },
      ];
    }

    function onEnterTarget(target) {
      if (!target || state.activeTarget === target) return;
      state.activeTarget = target;
      state.active = true;
      state.targetCorners = computeTargetCorners(target);
      cursor.classList.remove("is-spinning");
      if (!prefersReduced) updateStrength(1);
      else state.strength = 1;
    }

    function onLeaveTarget() {
      if (!state.activeTarget) return;
      state.activeTarget = null;
      state.active = false;
      state.targetCorners = null;
      if (!prefersReduced) updateStrength(0);
      else state.strength = 0;
      if (!prefersReduced) {
        window.setTimeout(() => {
          if (!state.activeTarget) cursor.classList.add("is-spinning");
        }, 80);
      } else {
        cursor.classList.add("is-spinning");
      }
    }

    function tick() {
      // cursor follows mouse
      state.cx = lerp(state.cx, state.mx, 0.22);
      state.cy = lerp(state.cy, state.my, 0.22);
      cursor.style.left = `${state.cx}px`;
      cursor.style.top = `${state.cy}px`;

      // corners parallax toward target corners
      const s = state.strength;
      if (s > 0.001 && state.targetCorners) {
        const baseX = state.cx;
        const baseY = state.cy;
        corners.forEach((corner, i) => {
          const tx = state.targetCorners[i].x - baseX;
          const ty = state.targetCorners[i].y - baseY;
          const cur = corner._p || { x: defaultOffsets[i].x, y: defaultOffsets[i].y };
          const k = opts.parallaxOn ? 0.18 : 0.35;
          const nx = lerp(cur.x, tx, k * s);
          const ny = lerp(cur.y, ty, k * s);
          corner._p = { x: nx, y: ny };
          setCornerTransform(corner, nx, ny);
        });
      } else {
        corners.forEach((corner, i) => {
          const cur = corner._p || { x: defaultOffsets[i].x, y: defaultOffsets[i].y };
          const nx = lerp(cur.x, defaultOffsets[i].x, 0.22);
          const ny = lerp(cur.y, defaultOffsets[i].y, 0.22);
          corner._p = { x: nx, y: ny };
          setCornerTransform(corner, nx, ny);
        });
      }

      // press feedback
      if (dot) {
        dot.style.transform = state.down
          ? "translate(-50%, -50%) scale(0.75)"
          : "translate(-50%, -50%) scale(1)";
      }
      cursor.style.scale = state.down ? "0.94" : "1";

      state.raf = requestAnimationFrame(tick);
    }

    function moveHandler(e) {
      state.mx = e.clientX;
      state.my = e.clientY;
    }

    function overHandler(e) {
      const t = e.target?.closest?.(opts.targetSelector);
      if (t) onEnterTarget(t);
    }

    function outHandler(e) {
      const leavingFrom = e.target?.closest?.(opts.targetSelector);
      const goingTo = e.relatedTarget?.closest?.(opts.targetSelector);
      if (!leavingFrom) return;
      if (leavingFrom && goingTo === leavingFrom) return;
      if (state.activeTarget === leavingFrom) onLeaveTarget();
    }

    function scrollHandler() {
      if (!state.activeTarget) return;
      state.targetCorners = computeTargetCorners(state.activeTarget);
      // If mouse is no longer over the element after scroll, leave.
      const el = document.elementFromPoint(state.mx, state.my);
      const still =
        el &&
        (el === state.activeTarget ||
          el.closest?.(opts.targetSelector) === state.activeTarget);
      if (!still) onLeaveTarget();
    }

    function downHandler() {
      state.down = true;
    }
    function upHandler() {
      state.down = false;
    }

    window.addEventListener("mousemove", moveHandler, { passive: true });
    window.addEventListener("mouseover", overHandler, { passive: true });
    window.addEventListener("mouseout", outHandler, { passive: true });
    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("mousedown", downHandler, { passive: true });
    window.addEventListener("mouseup", upHandler, { passive: true });

    state.raf = requestAnimationFrame(tick);

    window.addEventListener("beforeunload", () => {
      cancelAnimationFrame(state.raf);
      document.body.style.cursor = originalCursor;
      root.removeAttribute("data-cursor");
      cursor.remove();
    });
  })();

  // --- LiquidEther (vanilla, lightweight WebGL background for hero) ---
  (function mountLiquidEther() {
    const host = qs("#liquidEther");
    if (!host) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const hasTouch =
      "ontouchstart" in window ||
      (navigator.maxTouchPoints ?? 0) > 0 ||
      (navigator.msMaxTouchPoints ?? 0) > 0;
    if (prefersReduced || hasTouch) return;

    const canvas = document.createElement("canvas");
    host.appendChild(canvas);

    /** @type {WebGLRenderingContext | null} */
    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: false }) ||
      canvas.getContext("experimental-webgl");
    if (!gl) {
      host.remove();
      return;
    }

    // "Props" adapted to your landing palette + behavior
    const opts = {
      colors: ["#c28466", "#fbf7f1", "#6b7f73"],
      mouseForce: 18,
      cursorSize: 110,
      resolution: 0.55,
      autoDemo: true,
      autoSpeed: 0.55,
      autoIntensity: 2.0,
      autoResumeDelay: 2800,
      autoRampDuration: 0.6,
    };

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const msg = gl.getShaderInfoLog(sh) || "Shader compile failed";
        gl.deleteShader(sh);
        throw new Error(msg);
      }
      return sh;
    }

    function link(vs, fs) {
      const p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        const msg = gl.getProgramInfoLog(p) || "Program link failed";
        gl.deleteProgram(p);
        throw new Error(msg);
      }
      return p;
    }

    function hexToRgb01(hex) {
      const h = String(hex || "").replace("#", "").trim();
      const v =
        h.length === 3
          ? h
              .split("")
              .map((c) => c + c)
              .join("")
          : h.padEnd(6, "0").slice(0, 6);
      const n = parseInt(v, 16);
      const r = (n >> 16) & 255;
      const g = (n >> 8) & 255;
      const b = n & 255;
      return [r / 255, g / 255, b / 255];
    }

    const vert = `
      attribute vec2 aPos;
      varying vec2 vUv;
      void main() {
        vUv = aPos * 0.5 + 0.5;
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

    const frag = `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 uRes;
      uniform float uTime;
      uniform vec2 uMouse;   // 0..1 inside, -1..-1 when inactive
      uniform float uForce;
      uniform float uCursor;
      uniform vec3 uC0;
      uniform vec3 uC1;
      uniform vec3 uC2;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      vec2 warp(vec2 p, float t) {
        float n1 = noise(p * 2.2 + vec2(0.0, t * 0.20));
        float n2 = noise(p * 2.6 + vec2(5.2, t * 0.16));
        return p + 0.12 * vec2(n1 - 0.5, n2 - 0.5);
      }

      void main() {
        vec2 uv = vUv;
        vec2 p = uv;

        vec2 ar = vec2(uRes.x / max(uRes.y, 1.0), 1.0);
        vec2 q = (uv - 0.5) * ar;

        float m = 0.0;
        if (uMouse.x >= 0.0) {
          vec2 mq = (uMouse - 0.5) * ar;
          float d = length(q - mq);
          float r = max(0.001, uCursor / max(min(uRes.x, uRes.y), 1.0));
          m = exp(-d*d / (r*r)) * uForce;
          p += (q - mq) * (0.06 * m);
        }

        float t = uTime;
        p = warp(p, t);
        p = warp(p * 1.3 + 0.07 * vec2(sin(t), cos(t)), t * 1.08);

        float a = noise(p * 3.0 + vec2(0.0, t * 0.18));
        float b = noise(p * 4.2 + vec2(2.4, -t * 0.14));
        float f = smoothstep(0.18, 0.84, 0.55 * a + 0.45 * b);

        vec3 col = mix(uC0, uC2, f);
        col = mix(col, uC1, 0.22 + 0.32 * (0.5 - f) + 0.10 * m);

        float v = smoothstep(1.10, 0.35, length(q));
        col *= (0.90 + 0.10 * v);

        gl_FragColor = vec4(col, 0.22 + 0.20 * v);
      }
    `;

    let program;
    try {
      const vs = compile(gl.VERTEX_SHADER, vert);
      const fs = compile(gl.FRAGMENT_SHADER, frag);
      program = link(vs, fs);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    } catch {
      host.remove();
      return;
    }

    const posLoc = gl.getAttribLocation(program, "aPos");
    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uForce = gl.getUniformLocation(program, "uForce");
    const uCursor = gl.getUniformLocation(program, "uCursor");
    const uC0 = gl.getUniformLocation(program, "uC0");
    const uC1 = gl.getUniformLocation(program, "uC1");
    const uC2 = gl.getUniformLocation(program, "uC2");

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const c0 = hexToRgb01(opts.colors[0]);
    const c1 = hexToRgb01(opts.colors[1]);
    const c2 = hexToRgb01(opts.colors[2]);

    let w = 1, h = 1;
    function resize() {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width * dpr * opts.resolution));
      h = Math.max(1, Math.floor(rect.height * dpr * opts.resolution));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    const mouse = {
      x: -1,
      y: -1,
      tx: -1,
      ty: -1,
      lastUser: performance.now(),
      autoOn: opts.autoDemo,
      rampStart: 0,
    };

    function setMouseFromClient(clientX, clientY) {
      const r = host.getBoundingClientRect();
      const nx = (clientX - r.left) / Math.max(1, r.width);
      const ny = (clientY - r.top) / Math.max(1, r.height);
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return false;
      mouse.tx = nx;
      mouse.ty = ny;
      return true;
    }

    function onMove(e) {
      if (!setMouseFromClient(e.clientX, e.clientY)) return;
      mouse.lastUser = performance.now();
      mouse.autoOn = false;
    }

    window.addEventListener("mousemove", onMove, { passive: true });

    const t0 = performance.now();
    let raf = 0;

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function tick() {
      const now = performance.now();
      const t = (now - t0) / 1000;

      if (opts.autoDemo) {
        const idle = now - mouse.lastUser;
        if (idle > opts.autoResumeDelay && !mouse.autoOn) {
          mouse.autoOn = true;
          mouse.rampStart = now;
        }
      }

      if (mouse.autoOn) {
        const kRamp =
          opts.autoRampDuration > 0
            ? Math.min(1, (now - mouse.rampStart) / (opts.autoRampDuration * 1000))
            : 1;
        const e = kRamp * kRamp * (3 - 2 * kRamp);
        const a = (t * opts.autoSpeed) % (Math.PI * 2);
        const b = (t * (opts.autoSpeed * 0.73)) % (Math.PI * 2);
        const ax = 0.5 + 0.33 * Math.cos(a) + 0.08 * Math.cos(b * 2.0);
        const ay = 0.5 + 0.28 * Math.sin(b) + 0.08 * Math.sin(a * 1.7);
        mouse.tx = ax;
        mouse.ty = ay;
        mouse.x = mouse.x < 0 ? ax : lerp(mouse.x, mouse.tx, 0.06 + 0.10 * e);
        mouse.y = mouse.y < 0 ? ay : lerp(mouse.y, mouse.ty, 0.06 + 0.10 * e);
      } else {
        if (mouse.tx >= 0) {
          mouse.x = mouse.x < 0 ? mouse.tx : lerp(mouse.x, mouse.tx, 0.22);
          mouse.y = mouse.y < 0 ? mouse.ty : lerp(mouse.y, mouse.ty, 0.22);
        } else {
          mouse.x = -1;
          mouse.y = -1;
        }
      }

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(
        uForce,
        (opts.mouseForce / 20.0) * (mouse.autoOn ? opts.autoIntensity : 1.0)
      );
      gl.uniform1f(uCursor, opts.cursorSize);
      gl.uniform3f(uC0, c0[0], c0[1], c0[2]);
      gl.uniform3f(uC1, c1[0], c1[1], c1[2]);
      gl.uniform3f(uC2, c2[0], c2[1], c2[2]);

      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      raf = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries[0]?.isIntersecting ?? true;
        if (vis) {
          if (!raf) raf = requestAnimationFrame(tick);
        } else {
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: [0, 0.01, 0.1] }
    );
    io.observe(host);

    const ro = new ResizeObserver(() => resize());
    ro.observe(host);
    resize();
    raf = requestAnimationFrame(tick);

    window.addEventListener("beforeunload", () => {
      try {
        if (raf) cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("mousemove", onMove);
        gl.deleteBuffer(quad);
        gl.deleteProgram(program);
      } catch {
        void 0;
      }
    });
  })();

  // --- Shader background (vanilla adaptation; full-page canvas) ---
  (function mountShaderBackground() {
    const canvas = qs("#shaderBg");
    if (!canvas) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const hasTouch =
      "ontouchstart" in window ||
      (navigator.maxTouchPoints ?? 0) > 0 ||
      (navigator.msMaxTouchPoints ?? 0) > 0;
    if (prefersReduced || hasTouch) return;

    /** @type {WebGLRenderingContext | null} */
    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: false }) ||
      canvas.getContext("experimental-webgl");
    if (!gl) return;

    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

    // Colors adjusted to your warm palette (terracotta/sage) instead of purple.
    // Shader logic kept the same.
    const fsSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec4 uBg1;
      uniform vec4 uBg2;
      uniform vec4 uLine;

      const float overallSpeed = 0.18;
      const float gridSmoothWidth = 0.015;
      const float axisWidth = 0.05;
      const float majorLineWidth = 0.025;
      const float minorLineWidth = 0.0125;
      const float majorLineFrequency = 5.0;
      const float minorLineFrequency = 1.0;
      const vec4 gridColor = vec4(0.5);
      const float scale = 5.0;
      // lineColor is provided via uniform uLine (theme-aware)
      const float minLineWidth = 0.01;
      const float maxLineWidth = 0.2;
      const float lineSpeed = 1.0 * overallSpeed;
      const float lineAmplitude = 1.0;
      const float lineFrequency = 0.2;
      const float warpSpeed = 0.2 * overallSpeed;
      const float warpFrequency = 0.5;
      const float warpAmplitude = 1.0;
      const float offsetFrequency = 0.5;
      const float offsetSpeed = 1.33 * overallSpeed;
      const float minOffsetSpread = 0.6;
      const float maxOffsetSpread = 2.0;
      const int linesPerGroup = 16;

      #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
      #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
      #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
      #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

      float drawGridLines(float axis) {
        return drawCrispLine(0.0, axisWidth, axis)
              + drawPeriodicLine(majorLineFrequency, majorLineWidth, axis)
              + drawPeriodicLine(minorLineFrequency, minorLineWidth, axis);
      }

      float drawGrid(vec2 space) {
        return min(1.0, drawGridLines(space.x) + drawGridLines(space.y));
      }

      float random(float t) {
        return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
      }

      float getPlasmaY(float x, float horizontalFade, float offset) {
        return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec4 fragColor;
        vec2 uv = fragCoord.xy / iResolution.xy;
        vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

        float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
        float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

        space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
        space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

        vec4 lines = vec4(0.0);

        for(int l = 0; l < linesPerGroup; l++) {
          float normalizedLineIndex = float(l) / float(linesPerGroup);
          float offsetTime = iTime * offsetSpeed;
          float offsetPosition = float(l) + space.x * offsetFrequency;
          float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
          float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
          float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
          float linePosition = getPlasmaY(space.x, horizontalFade, offset);
          float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

          float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
          vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
          float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

          line = line + circle;
          lines += line * uLine * rand;
        }

        fragColor = mix(uBg1, uBg2, uv.x);
        fragColor *= verticalFade;
        fragColor.a = 1.0;
        fragColor += lines * 0.55;

        gl_FragColor = fragColor;
      }
    `;

    function loadShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function initProgram(vs, fs) {
      const vertexShader = loadShader(gl.VERTEX_SHADER, vs);
      const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fs);
      if (!vertexShader || !fragmentShader) return null;
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return null;
      }
      return program;
    }

    const program = initProgram(vsSource, fsSource);
    if (!program) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const attribPos = gl.getAttribLocation(program, "aVertexPosition");
    const uRes = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uBg1 = gl.getUniformLocation(program, "uBg1");
    const uBg2 = gl.getUniformLocation(program, "uBg2");
    const uLine = gl.getUniformLocation(program, "uLine");

    let raf = 0;
    const start = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    function render() {
      if (document.hidden) {
        raf = requestAnimationFrame(render);
        return;
      }

      resize();
      const t = (performance.now() - start) / 1000;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);

      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        // deep warm charcoal + muted ember line
        gl.uniform4f(uBg1, 0.06, 0.055, 0.05, 1.0);
        gl.uniform4f(uBg2, 0.12, 0.105, 0.09, 1.0);
        gl.uniform4f(uLine, 0.91, 0.69, 0.56, 1.0);
      } else {
        // warm paper + terracotta line
        gl.uniform4f(uBg1, 0.98, 0.96, 0.92, 1.0);
        gl.uniform4f(uBg2, 0.93, 0.91, 0.86, 1.0);
        gl.uniform4f(uLine, 0.76, 0.46, 0.34, 1.0);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(attribPos, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(attribPos);

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      raf = requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
    raf = requestAnimationFrame(render);

    window.addEventListener("beforeunload", () => {
      try {
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
      } catch {
        void 0;
      }
    });
  })();
});

